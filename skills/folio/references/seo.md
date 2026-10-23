# SEO for a personal site

A personal site has one search job: when someone types the person's name (often with their job or
city), this page comes first and its result says who they are. Everything below serves that. It does
not chase keywords, and it never stuffs skills into hidden text.

The technical hygiene rules come from Vercel's Web Interface Guidelines (MIT,
github.com/vercel-labs/web-interface-guidelines); the rest is specific to personal pages.
`scripts/seo_head.py` writes the head block from the profile; `scripts/check_site.mjs` checks it.

## 1. Ask once: index or not

Some people do not want their CV found by their current employer. Ask in the same message as the other
missing facts: "Votre site doit-il apparaître dans Google ?" Default: indexed. If not, `--noindex`
adds `<meta name="robots" content="noindex, nofollow">` and the sitemap is not written. Record the
answer in `profile.privacy.indexable`.

## 2. The head block

Generate it, do not hand-write it:

```bash
python3 <skill>/scripts/seo_head.py --profile work/profile.json --url https://prenom-nom.example.fr \
  --out site/public --head site/src/seo-head.html [--noindex] [--description "…"]
```

It writes `site/src/seo-head.html` (the layout `src/layouts/Base.astro` puts it in `<head>`; never
hand-edit the head in the page), and `site/public/robots.txt`, `sitemap.xml` and `favicon.svg`, which the
build copies to `dist/`. If the final address is not known yet, pass
`--url https://SITE_URL` and replace it at publication: Open Graph and canonical URLs must be absolute.

What it writes, and why:

| Tag | Rule |
| --- | --- |
| `<title>` | `Prénom Nom, métier à Ville`, 60 characters or fewer. The name first: it is what people search. |
| `meta description` | One plain sentence from the copy deck: what they do, where, what they look for. 70–160 characters. Not a list of skills. |
| `link rel="canonical"` | The site's absolute address. |
| Open Graph | `og:type=profile`, `profile:first_name`, `profile:last_name`, `og:title`, `og:description`, `og:url`, `og:locale` (`fr_FR`), `og:image` = absolute URL of `announce.png` (1200×627) with its width, height and alt. |
| Twitter | `twitter:card=summary_large_image`, same title, description, image. |
| JSON-LD | One `ProfilePage` whose `mainEntity` is a schema.org `Person` (below). |
| Favicon | `favicon.svg`: the initials in the page's display colour on its ground. No generic globe. |
| `theme-color` | The ground colour of the first screen (the hero's field when there is one). |

## 3. The Person in JSON-LD

Only facts the site already shows. Never the phone, the street address, the birth date or anything
hidden by the privacy pass.

- `name`, `givenName`, `familyName`
- `jobTitle`: the headline as written
- `address`: `PostalAddress` with `addressLocality` (city) and `addressCountry` only
- `url`: the site; `sameAs`: the links the person listed (LinkedIn, GitHub, Behance, Instagram…)
- `knowsAbout`: the skills and tools shown on the page (10 at most)
- `knowsLanguage`: the languages shown
- `alumniOf`: schools, as `EducationalOrganization` with `name`
- `worksFor`: the current employer only if the person is employed there and the page names it
- `email`: only if the page shows it (it usually does, as `mailto:`)
- `image`: the photo's absolute URL only if the photo is shown

Validate the output once with a JSON parser (`seo_head.py` does) and, before launch, with Google's Rich
Results Test.

## 4. On the page itself

- **One `h1` with the person's name in it**, or the name immediately beside it in the first screen. The
  name as text, never only inside an image or an SVG. `translate="no"` on the name so automatic
  translation does not mangle it.
- **Heading levels in order** (`h1` → `h2` → `h3`), no skipped level, one `h2` per section. A label
  styled small is still an `h2` if it names a section.
- **Real text for everything that matters**: roles, employers, cities, skills. Search engines read the
  HTML, not the drawings.
- **Images**: `width` and `height` on every `<img>` (prevents layout shift, which counts in Core Web
  Vitals), `alt` that describes, `loading="lazy"` below the fold, `fetchpriority="high"` on a photo in
  the first screen.
- **Fonts**: `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the one or two files the
  first screen uses (the display face and the text regular), `font-display: swap` everywhere.
- **Speed**: the page is one HTML file with self-hosted fonts and no framework; keep it that way. No
  external script, no tracking tag, no web font from a third party.
- **Language**: `lang` on `<html>`; a second-language version of a block carries its own `lang`
  attribute. A full second-language page gets `hreflang` alternates in both heads.
- **Links**: `<a href>` for navigation (no click handlers on `div`s), descriptive link text ("Voir le
  dépôt pgmigrate-lite", not "ici").
- **No zoom lock**: never `user-scalable=no` or `maximum-scale=1`.

## 5. What not to do

- No keyword lists, hidden text, or skills repeated in white on white.
- No fake reviews or `aggregateRating`, no `Organization` markup pretending the person is a company.
- No invented `jobTitle` or `worksFor` to rank for a job the person does not hold.
- No meta keywords tag (ignored by search engines, read by competitors).

## 6. Optional: Vercel's own review

If the `web-design-guidelines` skill is installed (`npx skills add vercel-labs/agent-skills --skill
web-design-guidelines`), run it on `site/src/` (the Astro page and its components) after `check_site.mjs` passes and fix what it
finds. Skip three of its rules on a personal site: "Title Case for headings" (wrong in French, and
sentence case is the house style), "Second person; avoid first person" (a personal site speaks in the
first person), and "URL reflects state" for a one-page site with no filters.
