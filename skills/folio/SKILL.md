---
name: folio
description: >-
  Turns a CV or résumé (PDF, DOCX, LinkedIn export or pasted text) into a personal website that looks
  designed for that one person, not generated: a static Astro site with React islands for motion
  (Tailwind, Motion, optional Cult UI components), self-hosted fonts, plus a LinkedIn announcement image. Use it whenever someone asks to turn their CV, résumé or LinkedIn
  profile into a site, portfolio, personal page or online CV, or asks to make an existing personal site
  look less generic or less "AI-made". Includes the SEO a personal page needs to come first on the
  person's name. Works in French and English and writes the site in the CV's language.
---

# folio

A personal site built by a model usually looks like the average of every portfolio it has seen: "Hi,
I'm Alex 👋" over a circular photo, a typing effect cycling job titles, skill bars at 85%, a vertical
timeline with dots, a grid of tech logos, three rounded cards, a purple gradient. Recruiters have seen
that page ten thousand times. It says "template" before it says the person's name.

This skill replaces those defaults with decisions taken from the person:

1. **The material is the person.** Their trade, places, numbers, objects and words come first; the
   design is built from them, never from the category "portfolio".
2. **A script deals the direction, you choose.** `scripts/deal.py` deals three of ten art directions,
   each with its own type system and palette, seeded by the person, so two clients in the same job do
   not get the same site.
3. **House rules, measured.** `scripts/check_site.mjs` opens the page in a real browser at three
   widths and fails what reads as generated, and what would keep the page from ranking on the name.
4. **You look at what you made.** Screenshots, a juror's critique, fix, look again.

Nothing is ever invented about the person. Every fact on the page comes from the CV or from them.

Paths below are relative to this skill's folder (`<skill>`). Work in a project folder: inputs and notes
go in `work/`, the site's source in `site/` (an Astro project), what gets published in `site/dist/`.
Scripts need Python 3.9+ (`pypdf`), Node 22.23+ (Node 24 LTS recommended) with npm, and, for the check,
Playwright with Chromium (`npm i -D playwright && npx playwright install chromium` if missing).

## The run

Do these in order. Do not write markup before step 8.

### 1. Extract

```bash
python3 <skill>/scripts/extract_cv.py path/to/cv.pdf --out work
```

This writes `work/cv.txt` (the text, in reading order), `work/links.json` (every link in the PDF),
`work/images/` (embedded pictures; the largest portrait one is usually the photo) and
`work/profile.json`, an empty skeleton. Read `cv.txt` whole, then fill `profile.json` following
`references/content-model.md`. A DOCX or pasted text: save it as `work/cv.txt` and fill the profile the
same way.

Rules for the profile:

- **Copy, do not improve.** Employers, titles, dates, schools, numbers and skills are taken as written.
  You may fix a typo; you may not add a number, a responsibility or a tool that is not in the CV.
- **Mark what you inferred** (the sector, the person's level) in `notes`, never in the facts.
- If something essential is missing (no job title, no contact), ask the person once, in one message,
  with all the questions together. If no one can answer, build without it and say so in the report.

### 2. Privacy pass

A CV is written for one recruiter; a site is read by anyone. By default the site shows: name, job,
city (not street), email, links the person listed, their story, experience, education, skills,
languages. By default it **hides**: phone number, street address, date of birth or age, nationality,
marital status, driving licence, social security or ID numbers, salary expectations, references' names
and contacts. Set `privacy` in the profile accordingly and tell the person what you hid; they can ask to
show any of it. A photo is shown only if the person provided it for the site or confirms it.

Ask, with your other questions, whether the site should appear in search engines: some people do not
want their current employer to find it. Default yes. Record it in `privacy.indexable`; step 9 uses it.

### 3. Inventory the person

In `work/notes.md`, list eight to twelve things that belong to this person and to no one else in their
trade. Look for:

- **The trade's world:** its objects, tools, rituals, printed things (a nurse's handover sheet, a
  chef's ticket rail, a sales territory map, a developer's changelog, a teacher's register, an
  architect's section drawing). These become devices.
- **Their places:** cities, regions, countries, the route of their career.
- **Their numbers:** only those written in the CV (years, team size, results, languages, distances).
- **Their constraint or turn:** a reconversion, an alternance, a return to work, a move abroad.
- **Their name:** its length, its letters, whether it holds the page.
- **What they want next:** the job, the city, the kind of team. The page exists for this.

### 4. Write the argument

Answer in one line each: who reads this page (a recruiter in which field, a client, a school)? What
must they believe after one screen? What proves it? What do they do next (write an email, download the
CV, look at the work)? Then list the page as claims with their proof, one line per section, in the
order of the argument. A section with no claim does not exist. There is no obligatory "About / Skills /
Experience / Contact" sequence; see `references/copy.md` §1.

### 5. Deal the direction

```bash
python3 <skill>/scripts/deal.py --profile work/profile.json --options 3
```

It prints three directions that suit this profile (photo or not, projects or not, figures or not,
trade). Hold each against the inventory: which one can carry something only this person has? Choose
it and write one line in the notes on why. Then print the full sheet:

```bash
python3 <skill>/scripts/deal.py --profile work/profile.json --direction <id> > work/sheet.md
```

The sheet fixes the type system, the palette, the hero, the section shapes, the phone composition and
the signature move. **Adopt it.** Do not blend it with the layout you would have made anyway.
`--redraw type` or `--redraw palette` only for a reason you can state (the palette fights the subject's
own colours; the type has no glyph the name needs) and record it. `--list` shows everything.
`references/directions.md` explains each direction.

Then write the idea in the notes and do not build until both blanks are filled from the inventory:

> On this page, **[something that belongs to this person]** becomes **[the device the direction calls for]**.

**The colleague test:** put another person in the same job in the sentence. If it still works, the
idea belongs to the job, not to the person. Go back to the inventory.

### 6. Write the words

Write the whole page as plain text in `work/copy.md` before any markup, in the CV's language,
following `references/copy.md` (and its French section when the CV is French). In short:

- The first screen says who and what in large type: the name and what they do, or a short line that
  does it, and one sentence under it saying concretely what they do, where, and what they look for.
- One primary action, named for what it does ("M'écrire", "Download the CV"), as a real button or link.
- Headlines two lines or fewer at every width (about 32 characters is safe).
- Experience rewritten as plain statements from the CV's own facts, most recent first, each role with
  its dates. Keep their verbs where they are good; never inflate.
- No invented proof: no testimonials, no client logos, no "5,000 lines of code a day".

### 7. Start the site and fetch the fonts

```bash
node <skill>/scripts/new_site.mjs site
```

It copies `<skill>/assets/site-template` (Astro, React, Tailwind, Motion, ready for Cult UI) to `site/`
and installs it. Then fetch the faces the sheet names; the site hosts its own fonts (faster, no third
party, and no transfer of visitors' IP addresses to Google, which European courts have held against
sites using Google Fonts):

```bash
node <skill>/scripts/fetch_fonts.mjs --out site/public/fonts "Family Name:400,700" "Other Family:400,400i"
```

It writes the `.woff2` files and `site/public/fonts/fonts.css`, which the layout already links. Never use
a `fonts.googleapis.com` link.

### 8. Build

The template, and where everything goes:

| File | What you do there |
| --- | --- |
| `src/styles/tokens.css` | The sheet's colours and faces as custom properties. Everything references them. |
| `src/styles/base.css` | Neutral reset, the five type steps, focus, reduced motion, `data-reveal`. Leave it. |
| `src/styles/global.css` | Tailwind, plus the tokens as utilities (`bg-bg`, `text-ink`, `bg-accent`, `font-display`, `text-display`). Page-specific CSS goes at the end. |
| `src/layouts/Base.astro` | `<html lang>`, the SEO head from step 9, the font preloads, `base.js`. Pass `lang` and `preload`. |
| `src/pages/index.astro` | The page: static Astro markup, one section per claim. |
| `src/components/` | Sections as `.astro` components; React islands (`.tsx`) only where something moves. |
| `src/components/motion/` | `CountUp`, `DrawPath`, `Rise` and `useOnView`: safe animated islands (`references/motion.md`). |
| `src/components/ui/` | Components from libraries, adapted (`references/components.md`). `CopyEmail.tsx` is a worked example from Cult UI. |
| `src/lib/fr.ts` | `fr()`: French spacing before `; : ! ?` and inside « », for text written in the page. |
| `public/` | Fonts, `media/` (the person's own pictures), favicon, robots, sitemap, `announce.png`. |

Order of work:

1. **Tokens** from the sheet in `tokens.css`.
2. **The hero, exactly as the sheet describes it,** at 1440 and at 390. The big thing big, the small
   things small, before anything else exists.
3. **Each section in the shape the sheet deals for its role,** with the person's content, as static Astro.
   Neighbouring sections never share a layout. Carry the idea into every section, contact and footer
   included. Data that repeats (roles, schools, projects) lives in one object at the top of the page and
   is mapped, so nothing is typed twice.
4. **Pictures,** in this order: the person's own (photo, project screenshots, work they made);
   things drawn in code from their world (a route, a plan, a sheet, a ticket, set in the palette, one
   consistent flat language, as inline SVG); type and colour alone. Never stock photographs of people,
   never generated faces, never a placeholder box. A missing picture is better than a fake one.
5. **The live thing,** one, from the sheet's list, made with the person's real content. This is where a
   React island earns its place: a figure that counts (`CountUp`), a route that draws (`DrawPath`), rows
   that open, tabs. A component library (Cult UI) only through `references/components.md`.
6. **States and semantics:** one `h1`, a heading on every section, real links, `mailto:` with a
   subject, visible focus, `alt` and `width`/`height` on every image, headings in order
   (`h1` → `h2` → `h3`), the name as real text with `translate="no"`. All of it in the HTML Astro writes,
   none of it only inside a client island. The head comes from step 9.

Read `references/rules.md` before building: it is the full list of house rules and generated-portfolio
tells, and §7 covers the stack. The short form is the table below. Build with `npm run build` in `site/`;
it writes `site/dist/`.

### 9. SEO

The page's search job is narrow: come first when someone types the person's name, and show a result
that says who they are. Generate the head from the profile rather than writing it by hand:

```bash
python3 <skill>/scripts/seo_head.py --profile work/profile.json --url https://<the site's address> \
  --out site/public --head site/src/seo-head.html --job "<short job title>" \
  --bg "<first screen ground>" --ink "<ink>" [--noindex]
```

It writes `site/src/seo-head.html`, which the layout puts in `<head>` (title "Prénom Nom, métier à
Ville", meta description, canonical, Open Graph `profile` with the absolute URL of `announce.png`, Twitter
card, theme-color, favicon, and a schema.org `Person` in JSON-LD holding only the public facts), and
`site/public/robots.txt`, `sitemap.xml` (skipped with `--noindex`) and `favicon.svg`. Unknown address:
pass `https://SITE_URL` and replace it at publication. Then pass the one or two font files the first
screen uses to the layout: `<Base lang="fr" preload={["/fonts/<file>.woff2"]}>`. `references/seo.md` has
the rules and what never to do (keyword lists, hidden text, fake ratings, private fields in the JSON-LD).

If the `web-design-guidelines` skill from vercel-labs/agent-skills is installed, run it on
`site/src/` after step 10 passes and fix what it finds, except its "Title Case", "avoid first
person" and "URL reflects state" rules, which do not fit a French personal page (`references/seo.md` §6).

### 10. Check

```bash
cd site && npm run build && cd ..
node <skill>/scripts/check_site.mjs site/dist --out work/check
```

It serves `dist/` locally, opens it at 1440, 768 and 390 pixels, scrolls it so every reveal fires, saves a
first-screen and a full-page screenshot per width, and measures: one `h1`, headlines over two lines,
fonts that failed to load, horizontal overflow, text under 13px, contrast, gradients, shadows, blur,
monospace, tracked capitals, emoji, skill bars and stars, thin outlined boxes, banned palettes, overused
faces, banned phrases, French spacing before `; : ! ?`, sections without headings, half-empty sections,
the SEO head (title, description, canonical, absolute `og:image`, JSON-LD `Person` with no private
field, heading order, image dimensions, font preload, theme-color, zoom not locked), the page with
JavaScript off (the text must be in the HTML), and the weight of the JavaScript.
Fix every `FAIL`. Treat every `WARN` as wrong unless you can defend it in one sentence. Rebuild before
every check: it reads `dist/`, not the source.

### 11. Look

Passing the check means nothing banned was measured, not that the page is good. Open every screenshot
it lists (desktop, tablet, phone; first screen and full page) and critique them with
`references/critique.md`. Write the critique down in its format, fix the top three problems, check
again, look again. Three rounds at most. Judge only the pictures.

### 12. Move

Last, and little. One signature move from the sheet, an entrance for each section's parts (staggered
40–80 ms, rising 12–24 px, once), press feedback on buttons, hover gated behind
`(hover: hover) and (pointer: fine)`. Entrances with CSS (`data-reveal`); the signature move and anything
CSS does badly with a Motion island that follows `useOnView`. Transform, opacity and clip-path only,
ease-out curves, under 300 ms for interface feedback, and a `prefers-reduced-motion` fallback that keeps
everything visible. `references/motion.md` has the values and the island rules. Rebuild and check again
afterwards: a reveal that did not fire is a blank band in the screenshot.

### 13. The announcement kit

Build `site/src/pages/announce.astro`: a 1200×627 composition in the same direction (the page's type,
palette and device, the person's name, what they do, the site's address), then build and render it:

```bash
cd site && npm run build && cd ..
node <skill>/scripts/check_site.mjs site/dist --announce --out site/public
cd site && npm run build && rm -rf dist/announce && cd ..
```

This writes `site/public/announce.png`, used as the Open Graph image and posted on LinkedIn; the last
build copies it into `dist/`, and the announcement page itself is removed from what gets published. Then write
`work/post.md`: a LinkedIn post of 3 to 6 short lines in the person's voice and language, saying what
they do and what they look for, with the link. No hype, no emoji unless their CV uses them, no
"Excited to announce", no hashtag wall (two at most).

### 14. Report

Publish `site/dist/` (any static host: Vercel, Netlify, Cloudflare Pages, GitHub Pages; or the folio
hosting). Only when the last check shows **0 FAIL** at all three widths and you have looked at every screenshot
after the last change. Tell the person, briefly: the direction and why; the idea sentence; the live
thing; what you hid for privacy; whether the site is indexed and what replaces `SITE_URL`; every fact
you could not find and left out; the final critique score
and what still falls short. Do not claim a check you did not run.

## House rules

Measured by `check_site.mjs` unless marked *(look)*. Full list and reasons in `references/rules.md`.

| Rule | Instead |
| --- | --- |
| **One `h1` on the first screen that says who and what**, two lines or fewer at every width | The name with the job, or a short line; the sentence under it says the rest |
| **No skill bars, percentages, stars, dots or gauges** for skills or languages | Words: the level (CECRL C1, "daily for 4 years"), where it was used |
| **No timeline with a vertical line and dots** *(look)* | Dated rows, a list, an index, or the direction's device |
| **No "Hi, I'm…" 👋, no typing effect, no rotating job titles, no "Available for work" dot** | The plain statement, set well |
| **No circular avatar with a ring** *(look)* | The photo large, square-cornered, cropped with intent, or no photo |
| **No icon rows** (phone, mail, pin icons; social icon grids; tech logo walls) | Plain text links, the email set large |
| **No cards per job, no identical card grids** | The section shape on the sheet |
| **No eyebrows, no tracked uppercase labels, no monospace** outside real code | Put the words in the heading or the sentence |
| **No 01 / 02 / 03 numbering** unless the content is truly a sequence | Order by position or dates |
| **No gradients, glass, glows, or shadows on things at rest; no hairline rules** except in real tables | Flat colour, tone steps between surfaces, space |
| **No assistant palettes:** cream with terracotta, violet or indigo, near-black with a neon accent | The dealt palette |
| **No overused faces** (Inter, Poppins, Montserrat, Space Grotesk, Playfair, Fraunces, Instrument Serif…) | The dealt type system, self-hosted |
| **Two typefaces at most, five sizes at most**, body text 16px or more in full ink | Scale contrast does the work |
| **Equal outer margins; no section with half the width empty; a heading on every section** | Close every void with the section's content |
| **No invented facts, proof, testimonials, logos or numbers** *(look)* | What the CV says, set well |
| **No generated-voice copy** ("passionné", "dynamique", "n'hésitez pas", "unlock", "seamless", "Bienvenue sur mon portfolio") | Specific nouns and real numbers |

Removing ornament leaves space. Never fill it with another ornament. Fill it with scale (make the
main thing larger), with the person's full content, with a drawing from their world, or with a field
of flat colour.

## Files

| File | Read it when |
| --- | --- |
| `references/content-model.md` | Step 1: the fields of `profile.json`. |
| `references/directions.md` | Step 5: what each direction is, what it needs, how it fails. |
| `references/copy.md` | Steps 4 and 6: the argument, headlines, rewriting experience, French typography. |
| `references/rules.md` | Step 8: every house rule and generated-portfolio tell, with what to do instead; §7 the stack. |
| `references/components.md` | Step 8, before using any component library (Cult UI): which ones, how to adapt them. |
| `references/type-colour-layout.md` | Step 8: scale, setting, palettes, margins, grid, the phone. |
| `references/seo.md` | Step 9: the head, the JSON-LD `Person`, on-page rules, what never to do. |
| `references/motion.md` | Step 12: what moves, curves, durations, reduced motion, Motion islands. |
| `references/critique.md` | Step 11: how to look, the score, the caps. |
| `scripts/extract_cv.py` | Step 1. |
| `scripts/deal.py` | Step 5. `--list`, `--options 3`, `--direction <id>`, `--redraw type|palette`. |
| `scripts/new_site.mjs` | Step 7: copies the template to `site/` and installs it. |
| `scripts/fetch_fonts.mjs` | Step 7. |
| `scripts/seo_head.py` | Step 9: head block, robots.txt, sitemap.xml, favicon. |
| `scripts/check_site.mjs` | Steps 10 and 13 (`--announce`), on `site/dist`. |
| `assets/site-template/` | Step 7: the Astro project every site starts from, with a neutral foundation and no look of its own. |

Credits: the house rules and the look-and-fix loop are adapted from
[taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT) and the motion rules from
[Emil Kowalski's skills](https://github.com/emilkowalski/skills) (MIT), and the technical hygiene in
the SEO step from Vercel's [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
(MIT), used by the [agent-skills](https://github.com/vercel-labs/agent-skills) `web-design-guidelines` skill.
Components may be adapted from [Cult UI](https://www.cult-ui.com) (MIT).
