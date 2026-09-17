import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

const illustrativePage = 'illustrative-tattoos-oklahoma-city.html';
const retiredMemorialPage = 'memorial-tattoos-oklahoma-city.html';
const illustrativeUrl = 'https://tornadotattoo.com/illustrative-tattoos-oklahoma-city.html';

test('illustrative tattoo guide replaces the memorial tattoo service page', () => {
  assert.ok(fs.existsSync(path.join(root, illustrativePage)), 'illustrative tattoo page is missing');
  assert.equal(fs.existsSync(path.join(root, retiredMemorialPage)), false, 'retired memorial tattoo page still exists');

  const html = read(illustrativePage);
  assert.match(html, /<title>Illustrative Tattoos in Oklahoma City \| Tornado Tattoo<\/title>/);
  assert.match(html, new RegExp(`<link rel="canonical" href="${illustrativeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`));
  assert.match(html, /Illustrative Tattoos • Oklahoma City/);
  assert.match(html, /Josh designs illustrative tattoos/i);
  assert.doesNotMatch(html, /memorial tattoos?/i);
});

test('site navigation, guides, redirects, and sitemaps point to the illustrative page', () => {
  for (const file of ['index.html', 'tattoo-guides-and-case-studies.html']) {
    const html = read(file);
    assert.match(html, /href="illustrative-tattoos-oklahoma-city\.html"/);
    assert.doesNotMatch(html, /memorial-tattoos-oklahoma-city\.html/);
    assert.doesNotMatch(html, />Memorial Tattoos</i);
  }

  const vercel = JSON.parse(read('vercel.json'));
  assert.ok(
    vercel.redirects.some(({ source, destination, permanent }) =>
      source === '/memorial-tattoos-oklahoma-city.html' &&
      destination === '/illustrative-tattoos-oklahoma-city.html' &&
      permanent === true
    ),
    'legacy memorial URL is not permanently redirected to the illustrative page'
  );

  for (const sitemap of ['sitemap.xml', 'image-sitemap.xml']) {
    const xml = read(sitemap);
    assert.match(xml, /https:\/\/tornadotattoo\.com\/illustrative-tattoos-oklahoma-city\.html/);
    assert.doesNotMatch(xml, /https:\/\/tornadotattoo\.com\/memorial-tattoos-oklahoma-city\.html/);
  }
});
