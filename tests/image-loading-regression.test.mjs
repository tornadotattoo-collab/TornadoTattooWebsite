import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const productionPages = fs
  .readdirSync(root)
  .filter((file) => file.endsWith(".html") && !file.includes(".local-backup"));

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function attribute(tag, name) {
  return tag.match(new RegExp("\\b" + name + "=[\"']([^\"']+)[\"']", "i"))?.[1] ?? null;
}

function localPath(url) {
  return url.split("?")[0].replace(/^\//, "");
}

function assertVersioned(url, message) {
  assert.match(url, /[?&]v=[a-z0-9._-]+(?:&|$)/i, message);
}

function optimizerRequest(url) {
  const parsed = new URL(url.replaceAll("&amp;", "&"), "https://tornadotattoo.com");
  assert.equal(parsed.pathname, "/_vercel/image", url + " must use Vercel Image Optimization");
  return {
    source: parsed.searchParams.get("url"),
    width: Number.parseInt(parsed.searchParams.get("w"), 10),
    quality: Number.parseInt(parsed.searchParams.get("q"), 10)
  };
}

function jpegDimensions(bytes) {
  let offset = 2;
  let orientation = 1;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      const width = bytes.readUInt16BE(offset + 7);
      const height = bytes.readUInt16BE(offset + 5);
      return orientation >= 5 && orientation <= 8 ? { width: height, height: width } : { width, height };
    }
    if (marker === 0xe1 && bytes.toString("ascii", offset + 4, offset + 10) === "Exif\0\0") {
      const tiff = offset + 10;
      const littleEndian = bytes.toString("ascii", tiff, tiff + 2) === "II";
      const readUInt16 = (position) => littleEndian ? bytes.readUInt16LE(position) : bytes.readUInt16BE(position);
      const readUInt32 = (position) => littleEndian ? bytes.readUInt32LE(position) : bytes.readUInt32BE(position);
      const ifd = tiff + readUInt32(tiff + 4);
      const entries = readUInt16(ifd);
      for (let index = 0; index < entries; index += 1) {
        const entry = ifd + 2 + (index * 12);
        if (readUInt16(entry) === 0x0112) orientation = readUInt16(entry + 8);
      }
    }
    offset += bytes.readUInt16BE(offset + 2) + 2;
  }
  throw new Error("JPEG dimensions were not found");
}

function imageDimensions(relativePath) {
  const bytes = fs.readFileSync(path.join(root, relativePath));
  if (/\.jpe?g$/i.test(relativePath)) return jpegDimensions(bytes);
  if (/\.webp$/i.test(relativePath)) {
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
    const chunk = bytes.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
    if (chunk === "VP8 ") {
      const frame = bytes.indexOf(Buffer.from([0x9d, 0x01, 0x2a]), 20);
      return { width: bytes.readUInt16LE(frame + 3) & 0x3fff, height: bytes.readUInt16LE(frame + 5) & 0x3fff };
    }
    if (chunk === "VP8L") {
      const bits = bytes.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  throw new Error("Unsupported image type: " + relativePath);
}

function srcsetCandidates(value) {
  return value.split(",").map((candidate) => {
    const [url, descriptor] = candidate.trim().split(/\s+/);
    return { url, width: Number.parseInt(descriptor, 10) };
  });
}

test("only each page's primary image loads eagerly", () => {
  for (const page of productionPages) {
    const images = [...read(page).matchAll(/<img\b[^>]*\bsrc=["'][^"']+["'][^>]*>/gi)].map((match) => match[0]);
    assert.ok(images.length > 0, page + " has no content images");

    assert.equal(attribute(images[0], "loading"), "eager", page + " primary image must be eager");
    assert.equal(attribute(images[0], "fetchpriority"), "high", page + " primary image must have high fetch priority");
    for (const image of images.slice(1)) {
      assert.equal(attribute(image, "loading"), "lazy", page + " below-fold image must be lazy");
      assert.notEqual(attribute(image, "fetchpriority"), "high", page + " below-fold image must not have high fetch priority");
    }
  }
});

test("every content image uses Vercel AVIF/WebP srcsets plus intrinsic dimensions", () => {
  for (const page of productionPages) {
    const html = read(page);
    const pictures = [...html.matchAll(/<picture\b[^>]*>[\s\S]*?<\/picture>/gi)].map((match) => match[0]);
    const sourcedImages = [...html.matchAll(/<img\b[^>]*\bsrc=["'][^"']+["'][^>]*>/gi)].map((match) => match[0]);
    const allImages = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);

    assert.equal(pictures.length, sourcedImages.length, page + " must wrap every sourced image in picture");

    for (const tag of allImages) {
      assert.match(tag, /\bwidth=["']\d+["']/i, page + " image is missing width");
      assert.match(tag, /\bheight=["']\d+["']/i, page + " image is missing height");
    }

    for (const picture of pictures) {
      const image = picture.match(/<img\b[^>]*>/i)?.[0];
      assert.ok(image, page + " picture is missing img fallback");
      const fallback = attribute(image, "src");
      const full = attribute(image, "data-full-src");
      const width = Number.parseInt(attribute(image, "width"), 10);
      const height = Number.parseInt(attribute(image, "height"), 10);

      assert.match(full, /^assets\/(?!responsive\/).+\.(?:jpe?g|webp)\?v=/i, page + " full image must retain the original asset");
      assertVersioned(full, page + " full image is unversioned");
      const fallbackRequest = optimizerRequest(fallback);
      assert.equal(fallbackRequest.source, "/" + full, page + " fallback must optimize its lightbox original");
      assert.equal(fallbackRequest.quality, 75, page + " fallback quality changed");
      assert.ok(fallbackRequest.width <= 960, page + " fallback exceeds 960 pixels");
      const originalDimensions = imageDimensions(localPath(full));
      assert.ok(
        Math.abs((width / height) - (originalDimensions.width / originalDimensions.height)) < 0.001,
        page + " intrinsic aspect ratio does not match " + full
      );

      const avifSource = picture.match(/<source\b[^>]*type=["']image\/avif["'][^>]*>/i)?.[0];
      const webpSource = picture.match(/<source\b[^>]*type=["']image\/webp["'][^>]*>/i)?.[0];
      assert.ok(avifSource, page + " picture is missing AVIF source");
      assert.ok(webpSource, page + " picture is missing WebP source");
      assert.ok(attribute(image, "sizes"), page + " img fallback is missing sizes");
      assert.equal(attribute(avifSource, "sizes"), attribute(image, "sizes"), page + " AVIF sizes mismatch");
      assert.equal(attribute(webpSource, "sizes"), attribute(image, "sizes"), page + " WebP sizes mismatch");

      const avifCandidates = srcsetCandidates(attribute(avifSource, "srcset"));
      const webpCandidates = srcsetCandidates(attribute(webpSource, "srcset"));
      assert.deepEqual(avifCandidates.map(({ width: candidateWidth }) => candidateWidth), webpCandidates.map(({ width: candidateWidth }) => candidateWidth), page + " responsive widths mismatch");
      assert.ok(avifCandidates.length >= 2, page + " must provide at least two responsive sizes");

      for (const { url, width: candidateWidth } of [...avifCandidates, ...webpCandidates]) {
        const request = optimizerRequest(url);
        assert.equal(request.source, "/" + full, page + " srcset optimizes the wrong original");
        assertVersioned(request.source, page + " optimized source is unversioned");
        assert.equal(request.width, candidateWidth, page + " srcset descriptor does not match its request width");
        assert.equal(request.quality, 75, page + " srcset quality changed");
        assert.ok(candidateWidth > 0, page + " has invalid srcset width " + url);
      }
    }
  }
});

test("high-image-count pages never use full originals as thumbnail sources", () => {
  for (const page of ["index.html", "sleeve-and-backpiece-tattoos-oklahoma-city.html"]) {
    const html = read(page);
    const images = [...html.matchAll(/<img\b[^>]*\bsrc=["'][^"']+["'][^>]*>/gi)].map((match) => match[0]);
    for (const image of images) {
      const fallback = optimizerRequest(attribute(image, "src"));
      assert.ok(fallback.width <= 960, page + " fallback exceeds 960 pixels");
      assert.notEqual(attribute(image, "src"), attribute(image, "data-full-src"), page + " thumbnail points at its full original");
    }
  }
});

test("dynamic galleries lazy-load responsive thumbnails and reserve originals for lightboxes", () => {
  const app = read("app.js");
  const sharedLightbox = read("image-lightbox.js");

  assert.match(app, /image\.loading\s*=\s*["']lazy["']/, "service-gallery thumbnails must be lazy");
  assert.match(app, /\/_vercel\/image\?url=/, "service-gallery thumbnails must use Vercel Image Optimization");
  assert.match(app, /dataset\.fullSrc/, "homepage lightbox must read the original image URL");
  assert.match(sharedLightbox, /dataset\.fullSrc/, "shared lightbox must read the original image URL");
  assert.doesNotMatch(sharedLightbox, /currentSrc\s*\|\|\s*image\.src/, "shared lightbox must not open a responsive thumbnail");
});
