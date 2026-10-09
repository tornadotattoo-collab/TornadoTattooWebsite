# Tornado Tattoo Website

The source for [Tornado Tattoo](https://tornadotattoo.com/), a custom tattoo shop in Oklahoma City. This is a hand-authored, multi-page website built from HTML, CSS, JavaScript, and local image/font assets. There is no frontend framework, package manifest, build step, or application server.

## At a glance

- Production domain: `https://tornadotattoo.com`
- Production hosting: Vercel, configured in `vercel.json`
- Public pages: 20 standalone HTML documents in the repository root
- Local test runner: Node.js built-in test runner; no npm dependencies
- Image delivery: Vercel Image Optimization, requested through `/_vercel/image`

## Preview and test

For full production behavior, use a Vercel preview deployment or run the project with the Vercel CLI after the project has been linked:

```sh
vercel dev
```

A basic static server is useful for checking markup and layout, but it does not implement Vercel's `/_vercel/image` endpoint. Optimized page images and dynamic gallery thumbnails will therefore not render correctly through Python's server alone.

```sh
python -m http.server 8000
```

Open <http://localhost:8000>. No installation is needed for this basic preview.

Run the complete regression suite from the repository root with Node.js 20.11 or newer:

```sh
node --test
```

The tests use only Node.js built-ins. They check SEO and sitemap consistency, page/navigation links, Vercel redirects and caching rules, image optimization and loading behavior, responsive portfolio layout, and project-image lightboxes.

## Site map

The site's public pages are grouped by purpose:

- Home: [`index.html`](index.html)
- Artist profiles: [`josh-poindexter-tattoo-artist-oklahoma-city.html`](josh-poindexter-tattoo-artist-oklahoma-city.html), [`selena-gjovaag-tattoo-artist-oklahoma-city.html`](selena-gjovaag-tattoo-artist-oklahoma-city.html)
- Tattoo styles and services: [`cover-up-tattoos-oklahoma-city.html`](cover-up-tattoos-oklahoma-city.html), [`japanese-tattoos-oklahoma-city.html`](japanese-tattoos-oklahoma-city.html), [`horror-tattoos-oklahoma-city.html`](horror-tattoos-oklahoma-city.html), [`traditional-tattoos-oklahoma-city.html`](traditional-tattoos-oklahoma-city.html), [`black-and-gray-tattoos-oklahoma-city.html`](black-and-gray-tattoos-oklahoma-city.html), [`color-tattoos-oklahoma-city.html`](color-tattoos-oklahoma-city.html), [`sleeve-and-backpiece-tattoos-oklahoma-city.html`](sleeve-and-backpiece-tattoos-oklahoma-city.html), and [`illustrative-tattoos-oklahoma-city.html`](illustrative-tattoos-oklahoma-city.html)
- Guides: [`tattoo-consultation-guide-oklahoma-city.html`](tattoo-consultation-guide-oklahoma-city.html), [`tattoo-aftercare-guide.html`](tattoo-aftercare-guide.html), and the [`tattoo-guides-and-case-studies.html`](tattoo-guides-and-case-studies.html) index
- Tattoo project case studies: [`samurai-backpiece-tattoo-case-study.html`](samurai-backpiece-tattoo-case-study.html), [`tiger-skulls-backpiece-tattoo-case-study.html`](tiger-skulls-backpiece-tattoo-case-study.html), [`color-owl-sleeve-tattoo-case-study.html`](color-owl-sleeve-tattoo-case-study.html), [`traditional-tiger-tattoo-case-study.html`](traditional-tiger-tattoo-case-study.html), [`blue-gemstone-sleeve-tattoo-case-study.html`](blue-gemstone-sleeve-tattoo-case-study.html), and [`cover-up-design-planning-examples.html`](cover-up-design-planning-examples.html)

## Repository layout

| Path | Purpose |
| --- | --- |
| `*.html` | Homepage, service pages, artist profiles, guides, and case studies |
| `styles.css` | Shared site styles and responsive layout |
| `homepage-enhancements.css` | Homepage-specific presentation and sections |
| `seo.css` | Shared styles for service and artist pages |
| `content-expansion.css` | Guide and case-study layouts, including the shared project lightbox |
| `app.js` | Homepage navigation, galleries, and portfolio lightbox interactions |
| `image-lightbox.js` | Shared image lightbox used by project-card pages |
| `assets/` | Artist portraits, shop photography, portfolio images, and social-share image |
| `fonts/` | Locally served WOFF2 display font |
| `tests/` | Node.js regression tests |
| `docs/` | Supporting launch and business-profile documentation |
| `vercel.json` | Image optimization settings, redirects, and response headers |
| `robots.txt`, `sitemap.xml`, `image-sitemap.xml` | Crawler directives and page/image discovery |

`index.local-backup.html` and `local-index-changes.patch` are local/reference files, not production pages. `.vercelignore` excludes them, along with documentation and tests, from Vercel uploads.

## Editing and publishing

Pages are edited directly in their HTML files. Shared presentation belongs in the CSS files above; homepage behavior belongs in `app.js`; project-page image behavior belongs in `image-lightbox.js`. Keep each page's canonical URL, social metadata, structured data, and links consistent with the public production domain.

When replacing or adding images, keep the original files in `assets/`, include their intrinsic dimensions and descriptive alternative text, and follow the existing responsive-image pattern. The HTML and JavaScript request optimized variants from Vercel while retaining the original image URL for the full-size lightbox. Asset URLs include a `v=` query parameter: bump that version when changing a cached image, font, stylesheet, or script. Vercel serves these assets with long-lived immutable caching.

When adding or retiring a public page, update all applicable references together:

1. Add or remove the HTML page and its navigation/internal links.
2. Update `sitemap.xml` and `image-sitemap.xml` with the canonical URL, accurate last-modified date, and representative image metadata.
3. Update `tests/launch-readiness.test.mjs`, which enumerates public pages and expected sitemap dates.
4. Add a permanent redirect in `vercel.json` when a published URL changes.
5. Run `node --test` from the repository root and review a Vercel preview before production deployment.

The production setup is Vercel-oriented, not provider-neutral: pages depend on Vercel's image endpoint, and `vercel.json` defines production redirects, image formats/sizes, and immutable asset caching. The configuration also adds `noindex` headers for the `verispark.io` review hosts; do not remove those rules without confirming the preview-domain indexing requirements.

## Search and sharing

`robots.txt` points crawlers to both XML sitemaps. Each public page has a canonical URL and social-sharing metadata; pages also contain JSON-LD structured data. The launch-readiness tests validate the production origin (`https://tornadotattoo.com`), expected page list and modification dates, social image dimensions, structured data, and legacy redirects. Update these together when changing public URLs or metadata.

## Contact and booking destinations

Consultation and contact destinations are linked directly from the site markup, including phone, email, booking, and the official [Tornado Tattoo Instagram account](https://www.instagram.com/tornadotattoo/). When any destination changes, search the HTML pages for the old value and update every occurrence; these links are not generated from a central configuration file.
