import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const productionPages = fs
  .readdirSync(root)
  .filter((file) => file.endsWith(".html") && !file.includes(".local-backup"));

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("browser-loaded CSS, JavaScript, fonts, and images use versioned URLs", () => {
  const files = [...productionPages, "app.js", "styles.css", "image-sitemap.xml"];
  for (const file of files) {
    const source = read(file);
    const assetReferences = source.match(/(?:(?:assets|fonts)\/[a-z0-9._/-]+\.(?:avif|webp|jpe?g|svg|woff2)|favicon\.svg)(?:\?[^"'\s<),]+)?/gi) ?? [];
    for (const reference of assetReferences) {
      assert.match(reference, /[?&]v=[a-z0-9._-]+(?:&|$)/i, file + " contains unversioned asset " + reference);
    }

    if (file.endsWith(".html")) {
      const codeReferences = source.match(/(?:href|src)=["'][^"']+\.(?:css|js)(?:\?[^"']*)?["']/gi) ?? [];
      for (const reference of codeReferences) {
        assert.match(reference, /[?&]v=[a-z0-9._-]+/i, file + " contains unversioned code asset " + reference);
      }
    }
  }
});

test("the active display font ships only as WOFF2", () => {
  const css = read("styles.css");
  const fontPath = path.join(root, "fonts", "BlackwoodCastle.woff2");

  assert.match(css, /url\(["']?fonts\/BlackwoodCastle\.woff2\?v=[^)"']+["']?\)\s+format\(["']woff2["']\)/);
  assert.doesNotMatch(css, /BlackwoodCastle(?:Shadow)?\.ttf|Blackwood Castle Shadow/);
  assert.equal(fs.existsSync(fontPath), true, "BlackwoodCastle.woff2 is missing");
  assert.equal(fs.readFileSync(fontPath).toString("ascii", 0, 4), "wOF2", "font is not WOFF2");
  assert.equal(fs.existsSync(path.join(root, "fonts", "BlackwoodCastle.ttf")), false, "active TTF must be removed");
  assert.equal(fs.existsSync(path.join(root, "fonts", "BlackwoodCastleShadow.ttf")), false, "unused shadow TTF must be removed");
});

test("Vercel applies immutable one-year caching to versioned asset paths", () => {
  const config = JSON.parse(read("vercel.json"));
  const immutable = new Map(
    config.headers
      .filter((rule) => rule.headers.some((header) => header.key.toLowerCase() === "cache-control"))
      .map((rule) => [rule.source, rule.headers.find((header) => header.key.toLowerCase() === "cache-control").value])
  );
  const expectedSources = [
    "/assets/(.*)",
    "/fonts/(.*)",
    "/styles.css",
    "/homepage-enhancements.css",
    "/seo.css",
    "/content-expansion.css",
    "/app.js",
    "/image-lightbox.js",
    "/favicon.svg"
  ];

  for (const source of expectedSources) {
    assert.equal(immutable.get(source), "public, max-age=31536000, immutable", source + " lacks immutable caching");
  }

  assert.deepEqual(config.images.formats, ["image/avif", "image/webp"]);
  assert.ok(config.images.sizes.includes(320));
  assert.ok(config.images.sizes.includes(480));
  assert.ok(config.images.sizes.includes(960));
  assert.equal(config.images.minimumCacheTTL, 31536000);
  assert.deepEqual(config.images.qualities, [75]);
  assert.ok(config.images.localPatterns.some((pattern) => pattern.pathname === "^/assets/.*$"));
});
