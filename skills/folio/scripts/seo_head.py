#!/usr/bin/env python3
"""Write the SEO head block, robots.txt, sitemap.xml and favicon.svg for a personal site.

Usage:
  seo_head.py --profile work/profile.json --url https://prenom-nom.example.fr --out site/public \
      --head site/src/seo-head.html [--job "infirmière en réanimation"] [--description "…"] \
      [--bg "#E6EEF4"] [--ink "#0B263A"] [--noindex]

Only facts the profile marks as public go into the markup: never the phone, street address, birth date
or anything listed in privacy.hidden. In the Astro site, layouts/Base.astro includes src/seo-head.html in
<head>; robots.txt, sitemap.xml and favicon.svg go to public/ and are copied to dist/ by the build.
Without --head, the head block is written to <out>/seo-head.html to paste by hand. See references/seo.md.
"""
import argparse, datetime, html, json, os, sys


def esc(s):
    return html.escape(s or "", quote=True)


def lower_first(s):
    return s[:1].lower() + s[1:] if s and not s[:2].isupper() else s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--profile", required=True)
    ap.add_argument("--url", required=True, help="absolute site address, e.g. https://camille-rousseau.example.fr")
    ap.add_argument("--out", default="site/public", help="folder for robots.txt, sitemap.xml, favicon.svg")
    ap.add_argument("--head", help="file for the head block (default <out>/seo-head.html); site/src/seo-head.html for the Astro site")
    ap.add_argument("--job", help="short job title for the <title>, as the page says it")
    ap.add_argument("--description", help="meta description (one sentence, 70-160 characters)")
    ap.add_argument("--bg", default="#FFFFFF", help="ground colour of the first screen (theme-color, favicon)")
    ap.add_argument("--ink", default="#000000", help="ink colour for the favicon initials")
    ap.add_argument("--image", default="announce.png", help="Open Graph image path relative to the site")
    ap.add_argument("--noindex", action="store_true")
    a = ap.parse_args()

    p = json.load(open(a.profile, encoding="utf-8"))
    url = a.url.rstrip("/") + "/"
    if not url.startswith(("http://", "https://")):
        sys.exit("--url must be absolute (https://…)")
    lang = (p.get("language") or "fr").lower()
    locale = {"fr": "fr_FR", "en": "en_GB", "es": "es_ES", "de": "de_DE"}.get(lang, f"{lang}_{lang.upper()}")
    name = p["name"]["display"]
    first, last = p["name"].get("first", ""), p["name"].get("last", "")
    city = (p.get("location") or {}).get("city", "")
    country = (p.get("location") or {}).get("country", "")
    job = a.job or (p.get("headline") or "").split(" — ")[0].split(" - ")[0].strip()
    privacy = p.get("privacy", {})
    indexable = not a.noindex and privacy.get("indexable", True)

    if lang == "fr":
        title = f"{name}, {lower_first(job)}" + (f" à {city}" if city else "")
    else:
        title = f"{name}, {job}" + (f" in {city}" if city else "")
    desc = a.description
    if not desc:
        look = (p.get("looking_for") or "").rstrip(".")
        if lang == "fr":
            desc = f"{name}, {lower_first(job)}" + (f" à {city}" if city else "") + "." + (f" Cherche : {lower_first(look)}." if look else "")
        else:
            desc = f"{name}, {job}" + (f" in {city}" if city else "") + "." + (f" Looking for: {look}." if look else "")
    warnings = []
    if len(title) > 60:
        warnings.append(f"title is {len(title)} characters (60 max): pass a shorter --job")
    if not 70 <= len(desc) <= 160:
        warnings.append(f"description is {len(desc)} characters (aim for 70-160): pass --description")

    img_url = url + a.image.lstrip("/")
    img_alt = f"{name}, {lower_first(job) if lang == 'fr' else job}"

    # Person, public facts only
    person = {"@type": "Person", "name": name, "givenName": first, "familyName": last, "jobTitle": job, "url": url}
    if city:
        person["address"] = {"@type": "PostalAddress", "addressLocality": city, **({"addressCountry": country} if country else {})}
    links = [l["url"] for l in (p.get("contact") or {}).get("links", []) if l.get("url", "").startswith("http")]
    if links:
        person["sameAs"] = links
    email = (p.get("contact") or {}).get("email")
    if email:
        person["email"] = f"mailto:{email}"
    knows = []
    for g in p.get("skills", []):
        knows += g.get("items", [])
    knows += p.get("tools", [])
    seen, knows_clean = set(), []
    for k in knows:
        k2 = k.split(" (")[0].strip()
        if k2 and k2.lower() not in seen:
            seen.add(k2.lower()); knows_clean.append(k2)
    if knows_clean:
        person["knowsAbout"] = knows_clean[:10]
    langs = [l["name"] for l in p.get("languages", []) if l.get("name")]
    if langs:
        person["knowsLanguage"] = langs
    schools = []
    for e in p.get("education", []):
        s = (e.get("school") or "").strip()
        if s and s not in schools:
            schools.append(s)
    if schools:
        person["alumniOf"] = [{"@type": "EducationalOrganization", "name": s} for s in schools]
    cur = next((e for e in p.get("experience", []) if e.get("end") in ("present", "aujourd'hui", "") and e.get("org")
                and e.get("contract") not in ("freelance", "stage", "bénévolat")), None)
    if cur:
        person["worksFor"] = {"@type": "Organization", "name": cur["org"]}
    if p.get("has_photo") and privacy.get("show_photo") and p.get("photo"):
        person["image"] = url + "media/" + os.path.basename(p["photo"])
    graph = {"@context": "https://schema.org", "@type": "ProfilePage", "url": url, "inLanguage": lang,
             "dateModified": datetime.date.today().isoformat(), "mainEntity": person}
    ld = json.dumps(graph, ensure_ascii=False, indent=2)
    json.loads(ld)  # validates

    out = [
        f"<title>{esc(title)}</title>",
        f'<meta name="description" content="{esc(desc)}">',
        f'<link rel="canonical" href="{esc(url)}">',
        '<meta name="robots" content="noindex, nofollow">' if not indexable else '<meta name="robots" content="index, follow, max-image-preview:large">',
        f'<meta name="theme-color" content="{esc(a.bg)}">',
        '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
        '<meta property="og:type" content="profile">',
        f'<meta property="profile:first_name" content="{esc(first)}">',
        f'<meta property="profile:last_name" content="{esc(last)}">',
        f'<meta property="og:title" content="{esc(title)}">',
        f'<meta property="og:description" content="{esc(desc)}">',
        f'<meta property="og:url" content="{esc(url)}">',
        f'<meta property="og:locale" content="{locale}">',
        f'<meta property="og:image" content="{esc(img_url)}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="627">',
        f'<meta property="og:image:alt" content="{esc(img_alt)}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{esc(title)}">',
        f'<meta name="twitter:description" content="{esc(desc)}">',
        f'<meta name="twitter:image" content="{esc(img_url)}">',
        f'<script type="application/ld+json">\n{ld}\n</script>',
    ]
    os.makedirs(a.out, exist_ok=True)
    head_path = a.head or os.path.join(a.out, "seo-head.html")
    os.makedirs(os.path.dirname(os.path.abspath(head_path)), exist_ok=True)
    open(head_path, "w", encoding="utf-8").write("\n".join(out) + "\n")

    if indexable:
        open(os.path.join(a.out, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {url}sitemap.xml\n")
        open(os.path.join(a.out, "sitemap.xml"), "w").write(
            '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            f"  <url><loc>{esc(url)}</loc><lastmod>{datetime.date.today().isoformat()}</lastmod></url>\n</urlset>\n")
    else:
        open(os.path.join(a.out, "robots.txt"), "w").write("User-agent: *\nDisallow: /\n")
        sm = os.path.join(a.out, "sitemap.xml")
        if os.path.exists(sm):
            os.remove(sm)

    initials = (first[:1] + last[:1]).upper() or name[:2].upper()
    open(os.path.join(a.out, "favicon.svg"), "w", encoding="utf-8").write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="{esc(a.bg)}"/>'
        f'<text x="32" y="43" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="30" '
        f'fill="{esc(a.ink)}">{esc(initials)}</text></svg>\n')

    print(f"title ({len(title)}): {title}")
    print(f"description ({len(desc)}): {desc}")
    print(f"indexable: {indexable}")
    print(f"wrote {head_path}, {a.out}/robots.txt" + (", sitemap.xml" if indexable else "") + ", favicon.svg")
    for w in warnings:
        print("WARN", w)


if __name__ == "__main__":
    main()
