import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const productionPages = fs
  .readdirSync(root)
  .filter((file) => file.endsWith(".html") && !file.includes(".local-backup"));

const pagesWithProjectCards = productionPages.filter((file) =>
  /class="project-card"/.test(fs.readFileSync(path.join(root, file), "utf8"))
);

test("every project-card page loads the shared full-image lightbox", () => {
  assert.ok(pagesWithProjectCards.length > 0, "expected project-card pages");

  for (const page of pagesWithProjectCards) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    assert.match(
      html,
      /<script[^>]+src="image-lightbox\.js(?:\?[^"]*)?"[^>]*><\/script>/,
      `${page} must load image-lightbox.js`
    );
  }
});

test("the shared lightbox intercepts cards and uses the original uncropped image", () => {
  const script = fs.readFileSync(path.join(root, "image-lightbox.js"), "utf8");

  assert.match(script, /querySelectorAll\(["']\.project-card/);
  assert.match(script, /preventDefault\(\)/);
  assert.match(script, /currentSrc\s*\|\|\s*image\.src/);
  assert.match(script, /objectFit\s*=\s*["']contain["']/);
  assert.match(script, /maxHeight/);
  assert.match(script, /Escape/);
});

test("the lightbox preserves modified-link behavior and traps focus", () => {
  const script = fs.readFileSync(path.join(root, "image-lightbox.js"), "utf8");

  assert.match(script, /event\.button\s*!==\s*0/);
  assert.match(script, /event\.metaKey/);
  assert.match(script, /event\.ctrlKey/);
  assert.match(script, /event\.key\s*===\s*["']Tab["']/);
  assert.match(script, /focusable/);
  assert.match(script, /event\.preventDefault\(\)/);
});

test("the lightbox exposes image changes accessibly", () => {
  const script = fs.readFileSync(path.join(root, "image-lightbox.js"), "utf8");

  assert.match(script, /aria-describedby/);
  assert.match(script, /aria-live/);
});

test("the shared lightbox centers the image instead of using a left grid column", () => {
  const css = fs.readFileSync(path.join(root, "content-expansion.css"), "utf8");

  assert.match(css, /\.project-image-lightbox\{[^}]*display:flex/);
  assert.match(css, /\.project-image-lightbox\{[^}]*justify-content:center/);
  assert.doesNotMatch(css, /grid-template-columns:auto minmax\\(0,1fr\\) auto/);
  assert.doesNotMatch(css, /\\\\n\\\\n\\.project-image-lightbox/);
});

test("the lightbox keeps navigation clear of the image on mobile", () => {
  const css = fs.readFileSync(path.join(root, "content-expansion.css"), "utf8");

  assert.match(css, /\.project-lightbox-nav\{position:absolute/);
  assert.match(css, /@media\(max-width:700px\).*\.project-lightbox-nav\{[^}]*bottom:/s);
});

test("the lightbox coverage includes every project card on the production pages", () => {
  const totalCards = pagesWithProjectCards.reduce((count, page) => {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    return count + (html.match(/class="project-card"/g) || []).length;
  }, 0);

  assert.equal(totalCards, 25);
});
