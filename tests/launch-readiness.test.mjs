import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonicalOrigin = 'https://tornadotattoo.com';
const socialImageUrlPattern = /^https:\/\/tornadotattoo\.com\/assets\/tornado-tattoo-social-share\.jpg\?v=[a-z0-9._-]+$/i;

const publicPages = [
  'index.html',
  'josh-poindexter-tattoo-artist-oklahoma-city.html',
  'selena-gjovaag-tattoo-artist-oklahoma-city.html',
  'cover-up-tattoos-oklahoma-city.html',
  'japanese-tattoos-oklahoma-city.html',
  'horror-tattoos-oklahoma-city.html',
  'traditional-tattoos-oklahoma-city.html',
  'black-and-gray-tattoos-oklahoma-city.html',
  'color-tattoos-oklahoma-city.html',
  'sleeve-and-backpiece-tattoos-oklahoma-city.html',
  'illustrative-tattoos-oklahoma-city.html',
  'tattoo-consultation-guide-oklahoma-city.html',
  'tattoo-aftercare-guide.html',
  'samurai-backpiece-tattoo-case-study.html',
  'tiger-skulls-backpiece-tattoo-case-study.html',
  'color-owl-sleeve-tattoo-case-study.html',
  'traditional-tiger-tattoo-case-study.html',
  'blue-gemstone-sleeve-tattoo-case-study.html',
  'cover-up-design-planning-examples.html',
  'tattoo-guides-and-case-studies.html'
];

const expectedLastModified = new Map([
  ['/', '2026-09-17'],
  ['/josh-poindexter-tattoo-artist-oklahoma-city.html', '2026-07-30'],
  ['/selena-gjovaag-tattoo-artist-oklahoma-city.html', '2026-09-17'],
  ['/cover-up-tattoos-oklahoma-city.html', '2026-09-17'],
  ['/japanese-tattoos-oklahoma-city.html', '2026-09-17'],
  ['/horror-tattoos-oklahoma-city.html', '2026-09-17'],
  ['/traditional-tattoos-oklahoma-city.html', '2026-09-17'],
  ['/black-and-gray-tattoos-oklahoma-city.html', '2026-09-17'],
  ['/color-tattoos-oklahoma-city.html', '2026-09-17'],
  ['/sleeve-and-backpiece-tattoos-oklahoma-city.html', '2026-09-17'],
  ['/illustrative-tattoos-oklahoma-city.html', '2026-09-17'],
  ['/tattoo-consultation-guide-oklahoma-city.html', '2026-07-29'],
  ['/tattoo-aftercare-guide.html', '2026-07-29'],
  ['/samurai-backpiece-tattoo-case-study.html', '2026-09-17'],
  ['/tiger-skulls-backpiece-tattoo-case-study.html', '2026-09-17'],
  ['/color-owl-sleeve-tattoo-case-study.html', '2026-09-17'],
  ['/traditional-tiger-tattoo-case-study.html', '2026-09-17'],
  ['/blue-gemstone-sleeve-tattoo-case-study.html', '2026-09-17'],
  ['/cover-up-design-planning-examples.html', '2026-09-17'],
  ['/tattoo-guides-and-case-studies.html', '2026-09-17']
]);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function metaContent(html, attribute, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<meta\\s+${attribute}="${escaped}"\\s+content="([^"]+)"`, 'i');
  return html.match(pattern)?.[1] ?? null;
}

function canonicalFor(page) {
  return page === 'index.html' ? `${canonicalOrigin}/` : `${canonicalOrigin}/${page}`;
}

function parseSitemap(relativePath) {
  const xml = read(relativePath);
  return new Map(
    [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g)]
      .map(([, url, lastmod]) => [url, lastmod])
  );
}

function jpegDimensions(filePath) {
  const bytes = fs.readFileSync(filePath);
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'social image must be a JPEG');
  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    const segmentLength = bytes.readUInt16BE(offset + 2);
    offset += segmentLength + 2;
  }
  throw new Error('JPEG dimensions were not found');
}

test('every Contact navigation link points to the existing Visit section', () => {
  assert.match(read('index.html'), /id="visit"/);
  for (const page of publicPages) {
    const html = read(page);
    assert.doesNotMatch(html, /index\.html#contact/, `${page} still points to the missing contact section`);
    if (page !== 'index.html') {
      assert.match(html, /href="\/#visit"[^>]*>Contact<\/a>/, `${page} does not link Contact to /#visit`);
    }
  }
});

test('Vercel permanently redirects every confirmed legacy URL', () => {
  const config = JSON.parse(read('vercel.json'));
  const actual = new Map(config.redirects.map(({ source, destination, permanent }) => [source, { destination, permanent }]));
  const expected = new Map([
    ['/contact-us/', { destination: '/#visit', permanent: true }],
    ['/joshs-instagram-feed/', { destination: '/josh-poindexter-tattoo-artist-oklahoma-city.html', permanent: true }],
    ['/elementor-662/', { destination: '/josh-poindexter-tattoo-artist-oklahoma-city.html', permanent: true }],
    ['/author/greg/', { destination: '/', permanent: true }],
    ['/index.html', { destination: '/', permanent: true }],
    ['/memorial-tattoos-oklahoma-city.html', { destination: '/illustrative-tattoos-oklahoma-city.html', permanent: true }]
  ]);
  assert.deepEqual(actual, expected);
});

test('only the Verispark review hosts receive a noindex response header', () => {
  const config = JSON.parse(read('vercel.json'));
  const noindexRules = config.headers.filter(rule =>
    rule.headers.some(header => header.key.toLowerCase() === 'x-robots-tag')
  );
  assert.equal(noindexRules.length, 2);
  assert.deepEqual(
    new Set(noindexRules.map(rule => rule.has?.find(condition => condition.type === 'host')?.value)),
    new Set(['verispark.io', 'www.verispark.io'])
  );
  for (const rule of noindexRules) {
    assert.match(rule.headers.find(header => header.key.toLowerCase() === 'x-robots-tag').value, /\bnoindex\b/);
  }
});

test('repository-only files are excluded from Vercel uploads', () => {
  const patterns = new Set(read('.vercelignore').split(/\r?\n/).map(line => line.trim()).filter(Boolean));
  for (const excluded of [
    'index.local-backup.html',
    'local-index-changes.patch',
    'OPEN-ME.txt',
    'README.md',
    '.nojekyll',
    'docs/',
    'tests/'
  ]) {
    assert.ok(patterns.has(excluded), `${excluded} is still eligible for deployment`);
  }
});

test('every public page has canonical and complete social-sharing metadata', () => {
  for (const page of publicPages) {
    const html = read(page);
    const expectedUrl = canonicalFor(page);
    assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1], expectedUrl, `${page} canonical`);
    assert.equal(metaContent(html, 'property', 'og:url'), expectedUrl, `${page} og:url`);
    const socialImageUrl = metaContent(html, 'property', 'og:image');
    assert.match(socialImageUrl, socialImageUrlPattern, `${page} og:image`);
    assert.equal(metaContent(html, 'property', 'og:image:secure_url'), socialImageUrl, `${page} og:image:secure_url`);
    assert.equal(metaContent(html, 'property', 'og:image:type'), 'image/jpeg', `${page} og:image:type`);
    assert.equal(metaContent(html, 'property', 'og:image:width'), '1200', `${page} og:image:width`);
    assert.equal(metaContent(html, 'property', 'og:image:height'), '630', `${page} og:image:height`);
    assert.ok(metaContent(html, 'property', 'og:image:alt'), `${page} og:image:alt`);
    assert.equal(metaContent(html, 'name', 'twitter:card'), 'summary_large_image', `${page} twitter:card`);
    assert.equal(metaContent(html, 'name', 'twitter:image'), socialImageUrl, `${page} twitter:image`);
    assert.ok(metaContent(html, 'name', 'twitter:image:alt'), `${page} twitter:image:alt`);
  }
});

test('the shared social image is an exact 1200 by 630 JPEG', () => {
  assert.deepEqual(
    jpegDimensions(path.join(root, 'assets', 'tornado-tattoo-social-share.jpg')),
    { width: 1200, height: 630 }
  );
});

test('both sitemaps use canonical URLs and verified page update dates', () => {
  const expected = new Map([...expectedLastModified].map(([pathname, date]) => [`${canonicalOrigin}${pathname}`, date]));
  assert.deepEqual(parseSitemap('sitemap.xml'), expected);
  assert.deepEqual(parseSitemap('image-sitemap.xml'), expected);
});

test('structured data contains no alternate Tornado Tattoo host', () => {
  for (const page of publicPages) {
    const html = read(page);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
    assert.ok(blocks.length > 0, `${page} has no JSON-LD`);
    for (const [, source] of blocks) {
      JSON.parse(source);
      const urls = source.match(/https?:\\?\/\\?\/[^"\s]+/g) ?? [];
      for (const url of urls) {
        const normalized = url.replaceAll('\\/', '/');
        const parsed = new URL(normalized);
        if (['tornadotattoo.com', 'www.tornadotattoo.com', 'verispark.io', 'www.verispark.io'].includes(parsed.hostname)) {
          assert.equal(parsed.origin, canonicalOrigin, `${page} uses alternate site URL ${normalized}`);
        }
      }
    }
  }
});
