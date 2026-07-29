from __future__ import annotations

import json
import re
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://tornadotattoo.com"
TODAY = "2026-07-29"
BUSINESS_ID = f"{BASE}/#business"
WEBSITE_ID = f"{BASE}/#website"
LOGO_ID = f"{BASE}/#logo"
MAP_URL = (
    "https://www.google.com/maps/place/Tornado%2BTattoo/"
    "%4035.5041807%2C-97.6206745%2C17z/"
    "data%3D%213m1%214b1%214m5%213m4%211s0x87b20556e9f74f89%3A"
    "0x52e9efd2bf80fcc5%218m2%213d35.5041801%214d-97.618501"
)
SOCIALS = [
    "https://www.instagram.com/tornadotattoo/",
    "https://www.facebook.com/tornadotattoo",
    "https://www.tiktok.com/@tornadotattoo",
    "https://www.youtube.com/@tornadotattoo",
    "https://x.com/tornadotattoo",
    "https://www.pinterest.com/tornadotattoo",
    "https://www.snapchat.com/@tornadotattoo",
]


def logo_node() -> dict:
    return {
        "@type": "ImageObject",
        "@id": LOGO_ID,
        "url": f"{BASE}/favicon.svg",
        "contentUrl": f"{BASE}/favicon.svg",
        "width": 64,
        "height": 64,
        "caption": "Tornado Tattoo logo",
    }


def website_node() -> dict:
    return {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        "url": f"{BASE}/",
        "name": "Tornado Tattoo",
        "alternateName": "Tornado Tattoo OKC",
        "publisher": {"@id": BUSINESS_ID},
        "inLanguage": "en-US",
    }


def business_node() -> dict:
    return {
        "@type": "TattooParlor",
        "@id": BUSINESS_ID,
        "name": "Tornado Tattoo",
        "url": f"{BASE}/",
        "logo": {"@id": LOGO_ID},
        "image": [
            f"{BASE}/assets/josh-at-work.webp",
            f"{BASE}/assets/tornado-tattoo-shop-oklahoma-city.webp",
        ],
        "telephone": "+1-405-601-4445",
        "email": "tornadotattoookc@gmail.com",
        "priceRange": "$50 and up",
        "foundingDate": "2006",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "3306 N MacArthur Blvd",
            "addressLocality": "Oklahoma City",
            "addressRegion": "OK",
            "postalCode": "73122",
            "addressCountry": "US",
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 35.5041801,
            "longitude": -97.618501,
        },
        "hasMap": MAP_URL,
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                    "https://schema.org/Tuesday",
                    "https://schema.org/Wednesday",
                    "https://schema.org/Thursday",
                    "https://schema.org/Friday",
                    "https://schema.org/Saturday",
                ],
                "opens": "12:00",
                "closes": "20:00",
            }
        ],
        "sameAs": SOCIALS,
    }


def json_ld(graph: list[dict]) -> str:
    payload = {"@context": "https://schema.org", "@graph": graph}
    return '<script type="application/ld+json">\n' + json.dumps(
        payload, ensure_ascii=False, indent=2
    ) + "\n  </script>"


def replace_first_json_ld(html: str, replacement: str) -> str:
    updated, count = re.subn(
        r'<script type="application/ld\+json">.*?</script>',
        replacement,
        html,
        count=1,
        flags=re.DOTALL,
    )
    if count != 1:
        raise RuntimeError("Expected exactly one JSON-LD block")
    return updated


def breadcrumb_node(page_url: str, page_name: str) -> dict:
    return {
        "@type": "BreadcrumbList",
        "@id": f"{page_url}#breadcrumb",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": f"{BASE}/",
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": page_name,
                "item": page_url,
            },
        ],
    }


def update_homepage() -> None:
    path = ROOT / "index.html"
    html = path.read_text(encoding="utf-8")
    html = html.replace(
        '<meta property="og:image" content="https://tornadotattoo.com/assets/josh-at-work.jpg">',
        '<meta property="og:image" content="https://tornadotattoo.com/assets/josh-at-work.webp">\n'
        '  <meta property="og:image:width" content="1365">\n'
        '  <meta property="og:image:height" content="2048">',
        1,
    )
    preload = (
        '  <link rel="preload" as="image" href="assets/josh-at-work.avif" '
        'type="image/avif" fetchpriority="high">\n'
    )
    marker = '  <link rel="icon" href="favicon.svg" type="image/svg+xml">\n'
    if preload not in html:
        html = html.replace(marker, marker + preload, 1)

    page_node = {
        "@type": "WebPage",
        "@id": f"{BASE}/#webpage",
        "url": f"{BASE}/",
        "name": "Tornado Tattoo | Custom Tattoo Shop in Oklahoma City",
        "isPartOf": {"@id": WEBSITE_ID},
        "about": {"@id": BUSINESS_ID},
        "primaryImageOfPage": {
            "@type": "ImageObject",
            "@id": f"{BASE}/#primaryimage",
            "url": f"{BASE}/assets/josh-at-work.webp",
            "contentUrl": f"{BASE}/assets/josh-at-work.webp",
            "width": 1365,
            "height": 2048,
            "caption": "Josh Poindexter tattooing a client at Tornado Tattoo in Oklahoma City",
        },
        "inLanguage": "en-US",
    }
    html = replace_first_json_ld(
        html,
        json_ld([website_node(), logo_node(), business_node(), page_node]),
    )

    old_hero = (
        '      <div class="hero-image" role="img" aria-label="Josh Poindexter tattooing a client inside Tornado Tattoo">'
        '<span class="image-note">Josh at work</span></div>'
    )
    new_hero = '''      <figure class="hero-image">
        <picture>
          <source srcset="assets/josh-at-work.avif" type="image/avif">
          <source srcset="assets/josh-at-work.webp" type="image/webp">
          <img src="assets/josh-at-work.jpg" alt="Josh Poindexter tattooing a client at Tornado Tattoo in Oklahoma City" width="1365" height="2048" loading="eager" fetchpriority="high" decoding="async">
        </picture>
        <figcaption class="image-note">Josh at work</figcaption>
      </figure>'''
    if old_hero not in html:
        raise RuntimeError("Homepage hero marker was not found")
    html = html.replace(old_hero, new_hero, 1)
    path.write_text(html, encoding="utf-8")


def update_artist_page() -> None:
    path = ROOT / "josh-poindexter-tattoo-artist-oklahoma-city.html"
    html = path.read_text(encoding="utf-8")
    html = html.replace(
        "https://tornadotattoo.com/assets/josh-at-work.jpg",
        "https://tornadotattoo.com/assets/josh-at-work.webp",
        1,
    )
    page_url = f"{BASE}/josh-poindexter-tattoo-artist-oklahoma-city.html"
    person_id = f"{page_url}#person"
    graph = [
        website_node(),
        logo_node(),
        business_node(),
        {
            "@type": "WebPage",
            "@id": f"{page_url}#webpage",
            "url": page_url,
            "name": "Josh Poindexter | Tattoo Artist in Oklahoma City",
            "isPartOf": {"@id": WEBSITE_ID},
            "about": {"@id": person_id},
            "mainEntity": {"@id": person_id},
            "breadcrumb": {"@id": f"{page_url}#breadcrumb"},
            "inLanguage": "en-US",
        },
        {
            "@type": "Person",
            "@id": person_id,
            "name": "Josh Poindexter",
            "jobTitle": "Tattoo Artist and Owner",
            "image": f"{BASE}/assets/josh-poindexter.jpg",
            "url": page_url,
            "worksFor": {"@id": BUSINESS_ID},
        },
        breadcrumb_node(page_url, "Josh Poindexter"),
    ]
    html = replace_first_json_ld(html, json_ld(graph))
    path.write_text(html, encoding="utf-8")


def update_service_page(
    filename: str,
    page_name: str,
    document_name: str,
    service_name: str,
    service_type: str,
    image_path: str,
) -> None:
    path = ROOT / filename
    html = path.read_text(encoding="utf-8")
    page_url = f"{BASE}/{filename}"
    service_id = f"{page_url}#service"
    graph = [
        website_node(),
        logo_node(),
        business_node(),
        {
            "@type": "WebPage",
            "@id": f"{page_url}#webpage",
            "url": page_url,
            "name": document_name,
            "isPartOf": {"@id": WEBSITE_ID},
            "about": {"@id": service_id},
            "mainEntity": {"@id": service_id},
            "breadcrumb": {"@id": f"{page_url}#breadcrumb"},
            "inLanguage": "en-US",
        },
        {
            "@type": "Service",
            "@id": service_id,
            "name": service_name,
            "serviceType": service_type,
            "provider": {"@id": BUSINESS_ID},
            "areaServed": {"@type": "City", "name": "Oklahoma City"},
            "url": page_url,
            "image": f"{BASE}/{image_path}",
        },
        breadcrumb_node(page_url, page_name),
    ]
    html = replace_first_json_ld(html, json_ld(graph))
    html = html.replace(
        '<nav class="breadcrumbs">',
        '<nav class="breadcrumbs" aria-label="Breadcrumb">',
        1,
    )
    path.write_text(html, encoding="utf-8")


def image_xml(location: str, title: str, caption: str) -> str:
    return (
        "    <image:image>\n"
        f"      <image:loc>{escape(location)}</image:loc>\n"
        f"      <image:title>{escape(title)}</image:title>\n"
        f"      <image:caption>{escape(caption)}</image:caption>\n"
        "    </image:image>"
    )


def write_sitemaps() -> None:
    pages = [
        f"{BASE}/",
        f"{BASE}/josh-poindexter-tattoo-artist-oklahoma-city.html",
        f"{BASE}/cover-up-tattoos-oklahoma-city.html",
        f"{BASE}/japanese-tattoos-oklahoma-city.html",
        f"{BASE}/horror-tattoos-oklahoma-city.html",
        f"{BASE}/traditional-tattoos-oklahoma-city.html",
    ]
    sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for page in pages:
        sitemap.extend(
            [
                "  <url>",
                f"    <loc>{escape(page)}</loc>",
                f"    <lastmod>{TODAY}</lastmod>",
                "  </url>",
            ]
        )
    sitemap.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8")

    home_images = [
        ("assets/josh-at-work.webp", "Josh Poindexter tattooing at Tornado Tattoo", "Josh Poindexter tattooing a client inside Tornado Tattoo in Oklahoma City."),
        ("assets/josh-samurai-backpiece.webp", "Japanese samurai backpiece by Josh Poindexter", "Large Japanese samurai, temple, and mountain backpiece tattoo by Josh Poindexter."),
        ("assets/josh-tiger-skulls-backpiece.webp", "Tiger and skulls backpiece by Josh Poindexter", "Large black-and-gray tiger and skulls backpiece tattoo by Josh Poindexter."),
        ("assets/josh-ornamental-mandala-leg.webp", "Ornamental mandala leg sleeve by Josh Poindexter", "Full ornamental mandala leg sleeve tattoo by Josh Poindexter."),
        ("assets/josh-traditional-tiger-shoulder.webp", "Oklahoma City traditional tiger tattoo", "Bold color traditional tiger shoulder tattoo by Josh Poindexter."),
        ("assets/josh-blue-gemstone-sleeve.webp", "Blue gemstone sleeve by Josh Poindexter", "Blue gemstone and ornamental color sleeve tattoo by Josh Poindexter."),
        ("assets/josh-wolf-hand.webp", "Black-and-gray wolf hand tattoo", "Black-and-gray snarling wolf hand tattoo with red eyes by Josh Poindexter."),
        ("assets/josh-traditional-panther.webp", "Traditional panther tattoo by Josh Poindexter", "Bold black and red traditional panther tattoo by Josh Poindexter."),
        ("assets/josh-color-apple-branch.webp", "Color apple branch tattoo by Josh Poindexter", "Realistic red apples and green leaves color tattoo by Josh Poindexter."),
        ("assets/josh-color-lighthouse.webp", "Color lighthouse tattoo by Josh Poindexter", "Bright illustrative lighthouse and ocean color tattoo by Josh Poindexter."),
        ("assets/josh-poindexter.jpg", "Josh Poindexter at Tornado Tattoo", "Josh Poindexter, owner and tattoo artist at Tornado Tattoo in Oklahoma City."),
        ("assets/selena-gjovaag.jpg", "Selena Gjovaag at Tornado Tattoo", "Selena Gjovaag, tattoo artist at Tornado Tattoo in Oklahoma City."),
        ("assets/tornado-tattoo-shop-oklahoma-city.webp", "Tornado Tattoo storefront in Oklahoma City", "Exterior Tornado Tattoo storefront at 3306 North MacArthur Boulevard in Oklahoma City."),
    ]
    image_pages = {
        f"{BASE}/": home_images,
        f"{BASE}/josh-poindexter-tattoo-artist-oklahoma-city.html": [
            ("assets/josh-at-work.webp", "Josh Poindexter tattooing at Tornado Tattoo", "Josh Poindexter tattooing a client at Tornado Tattoo in Oklahoma City."),
            ("assets/josh-poindexter.jpg", "Josh Poindexter, Oklahoma City tattoo artist", "Portrait of Josh Poindexter, owner and artist at Tornado Tattoo."),
            ("assets/josh-samurai-backpiece.webp", "Japanese samurai backpiece by Josh Poindexter", "Large-scale Japanese samurai backpiece tattoo by Josh Poindexter."),
        ],
        f"{BASE}/cover-up-tattoos-oklahoma-city.html": [
            ("assets/josh-black-guitar.webp", "Black guitar tattoo by Josh Poindexter", "High-contrast black guitar tattoo used as an example of cover-up design planning."),
            ("assets/josh-tiger-skulls-backpiece.webp", "Black-and-gray cover-up composition", "Large black-and-gray tiger and skulls backpiece by Josh Poindexter."),
            ("assets/josh-color-owl-sleeve.webp", "Color owl sleeve by Josh Poindexter", "Full color owl and floral sleeve tattoo by Josh Poindexter."),
            ("assets/josh-blue-gemstone-sleeve.webp", "Blue gemstone sleeve by Josh Poindexter", "Ornamental blue gemstone color sleeve by Josh Poindexter."),
        ],
        f"{BASE}/japanese-tattoos-oklahoma-city.html": [
            ("assets/josh-samurai-backpiece.webp", "Japanese samurai backpiece by Josh Poindexter", "Japanese samurai, temple, and mountain backpiece tattoo by Josh Poindexter."),
            ("assets/josh-samurai-forearm.webp", "Samurai warrior tattoo by Josh Poindexter", "Black and red samurai warrior tattoo by Josh Poindexter."),
            ("assets/josh-color-floral-sleeve.webp", "Japanese-inspired floral sleeve", "Bright Japanese-inspired floral color sleeve tattoo by Josh Poindexter."),
            ("assets/josh-traditional-tiger-shoulder.webp", "Japanese-inspired tiger shoulder tattoo", "Bold color tiger shoulder tattoo by Josh Poindexter."),
        ],
        f"{BASE}/horror-tattoos-oklahoma-city.html": [
            ("assets/josh-kiss-demon.webp", "The Demon character tattoo by Josh Poindexter", "Color Demon character portrait tattoo by Josh Poindexter."),
            ("assets/josh-tiger-skulls-backpiece.webp", "Tiger and skulls dark-art backpiece", "Large tiger and skulls backpiece tattoo by Josh Poindexter."),
            ("assets/josh-wolf-hand.webp", "Red-eyed wolf hand tattoo", "Black-and-gray snarling wolf hand tattoo with red eyes by Josh Poindexter."),
            ("assets/josh-sugar-skull.webp", "Color sugar skull portrait", "Color sugar skull portrait tattoo by Josh Poindexter."),
        ],
        f"{BASE}/traditional-tattoos-oklahoma-city.html": [
            ("assets/josh-traditional-tiger-shoulder.webp", "Traditional tiger tattoo by Josh Poindexter", "Bold color traditional tiger shoulder tattoo by Josh Poindexter."),
            ("assets/josh-traditional-panther.webp", "Traditional panther tattoo by Josh Poindexter", "Bold black and red traditional panther tattoo by Josh Poindexter."),
            ("assets/josh-traditional-snake.webp", "Traditional snake tattoo by Josh Poindexter", "Bold green and red traditional snake tattoo by Josh Poindexter."),
            ("assets/josh-wolf-headdress.webp", "Traditional-inspired wolf headdress tattoo", "Traditional-inspired wolf headdress tattoo by Josh Poindexter."),
            ("assets/josh-dragon-balls.webp", "Dragon Balls color tattoo", "Bright orange Dragon Balls pop-culture tattoo by Josh Poindexter."),
        ],
    }
    image_sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ]
    for page, images in image_pages.items():
        image_sitemap.extend(["  <url>", f"    <loc>{escape(page)}</loc>", f"    <lastmod>{TODAY}</lastmod>"])
        for image_path, title, caption in images:
            image_sitemap.append(image_xml(f"{BASE}/{image_path}", title, caption))
        image_sitemap.append("  </url>")
    image_sitemap.append("</urlset>")
    (ROOT / "image-sitemap.xml").write_text(
        "\n".join(image_sitemap) + "\n", encoding="utf-8"
    )

    robots_path = ROOT / "robots.txt"
    robots = robots_path.read_text(encoding="utf-8").rstrip()
    image_sitemap_line = f"Sitemap: {BASE}/image-sitemap.xml"
    if image_sitemap_line not in robots:
        robots += "\n" + image_sitemap_line
    robots_path.write_text(robots + "\n", encoding="utf-8")


def main() -> None:
    update_homepage()
    update_artist_page()
    update_service_page(
        "cover-up-tattoos-oklahoma-city.html",
        "Cover-Up Tattoos",
        "Cover-Up Tattoos in Oklahoma City | Tornado Tattoo",
        "Tattoo Cover-Up Consultation",
        "Cover-Up Tattoos",
        "assets/josh-tiger-skulls-backpiece.webp",
    )
    update_service_page(
        "japanese-tattoos-oklahoma-city.html",
        "Japanese Tattoos",
        "Japanese Tattoos in Oklahoma City | Tornado Tattoo",
        "Japanese-Inspired Tattooing",
        "Japanese Tattoos",
        "assets/josh-samurai-backpiece.webp",
    )
    update_service_page(
        "horror-tattoos-oklahoma-city.html",
        "Horror Tattoos",
        "Horror Tattoos in Oklahoma City | Tornado Tattoo",
        "Horror and Dark-Art Tattooing",
        "Horror Tattoos",
        "assets/josh-kiss-demon.webp",
    )
    update_service_page(
        "traditional-tattoos-oklahoma-city.html",
        "Traditional Tattoos",
        "Traditional Tattoos in Oklahoma City | Tornado Tattoo",
        "Traditional Tattooing",
        "Traditional Tattoos",
        "assets/josh-traditional-tiger-shoulder.webp",
    )
    write_sitemaps()


if __name__ == "__main__":
    main()
