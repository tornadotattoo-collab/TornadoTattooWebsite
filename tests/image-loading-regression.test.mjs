import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const productionPages = [
  "index.html",
  "josh-poindexter-tattoo-artist-oklahoma-city.html",
  "selena-gjovaag-tattoo-artist-oklahoma-city.html",
  "cover-up-tattoos-oklahoma-city.html",
  "japanese-tattoos-oklahoma-city.html",
  "horror-tattoos-oklahoma-city.html",
  "traditional-tattoos-oklahoma-city.html",
  "black-and-gray-tattoos-oklahoma-city.html",
  "color-tattoos-oklahoma-city.html",
  "sleeve-and-backpiece-tattoos-oklahoma-city.html",
  "memorial-tattoos-oklahoma-city.html",
  "tattoo-consultation-guide-oklahoma-city.html",
  "tattoo-aftercare-guide.html",
  "samurai-backpiece-tattoo-case-study.html",
  "tiger-skulls-backpiece-tattoo-case-study.html",
  "color-owl-sleeve-tattoo-case-study.html",
  "traditional-tiger-tattoo-case-study.html",
  "blue-gemstone-sleeve-tattoo-case-study.html",
  "cover-up-design-planning-examples.html",
  "tattoo-guides-and-case-studies.html"
];

test("production images load without lazy placeholders", () => {
  const lazyImages = [];
  for (const page of productionPages) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    if (/<img\b[^>]*\bloading=["']lazy["']/i.test(html)) {
      lazyImages.push(page);
    }
  }

  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.doesNotMatch(
    app,
    /image\.loading\s*=\s*item\.contain\s*\?\s*["']eager["']\s*:\s*["']lazy["']/,
    "service-gallery images must not be lazy-loaded"
  );
  assert.deepEqual(lazyImages, [], `lazy-loaded production images remain: ${lazyImages.join(", ")}`);
});
