# House rules and generated-portfolio tells

A tell is a device that makes a page read as generated. Most began as good ideas; they became tells by
being produced by default, for everyone, without a reason. Recruiters now recognise them before they
read the name. Each rule says what to do instead. *(check)* means `check_site.mjs` measures it;
*(look)* means you check it in the screenshots.

The rules come in two levels:

- **Blocking**: honesty, privacy, the frame (legibility, contrast, one `h1`, nothing hidden) and the
  stack (§4 to §7). A FAIL here is never negotiable.
- **Style**: the tells (§1 to §3). They are the default, not a law. A page may break **one** of them on
  purpose (§8). The smaller ones (monospace, thin rules, soft radius, centring) are only warnings: keep
  one if you can defend it in one sentence in `work/notes.md`.

The aim is a page that could only be this person's, not a page that avoids every risk. A rule followed
everywhere gives a sober page; a sober page is not yet a good one.

## 1. Portfolio and CV tells (specific to this skill)

| Tell | Instead |
| --- | --- |
| "Hi, I'm Alex 👋", "Bonjour, moi c'est…", "Bienvenue sur mon portfolio" *(check)* | The name and job, stated. The page is already a hello. |
| Typing effect, rotating job titles, blinking cursor *(look)* | One job title, the true one. |
| Skill bars, percentages, stars, dots, radar charts, gauges *(check)* | Words. Languages with their CECRL level or a plain description ("courant, 2 ans à Dublin"). Tools with where and how long ("PostgreSQL, en production depuis 2020"). |
| Vertical timeline: a thin line down the middle with dots and alternating cards *(look)* | Dated rows, an index table, a list, or the direction's own device (a thick drawn route with real stops in `itineraire`). |
| Circular avatar with a coloured ring, often tilted or with a blob behind *(look)* | The photo large, square-cornered, cropped with intent (face on the upper third), or no photo. |
| Icon rows: phone, envelope, pin, LinkedIn/GitHub/Twitter logos in circles *(look)* | The email as text, set large and linked. Other links as words ("LinkedIn", "GitHub"). |
| Tech logo walls and tool icon grids *(look)* | The tools as a sentence or a grouped list, with context. |
| One card per job, three cards per row, the same card everywhere *(look)* | The direction's section shape. Repetition only for an archive (an index, a list of projects). |
| "About me / My skills / My experience / Contact me" as the fixed order | The order of the argument (`copy.md` §1). Plain headings ("Parcours", "Ce que je sais faire", "Me contacter"), no "My". |
| "Available for work" with a pulsing green dot *(check)* | "Je cherche un poste de… à… à partir de…" in the first screen. |
| Download CV button with a download icon and an arrow | A plain link: "Télécharger le CV (PDF, 120 ko)". |
| Quote marks around a self-written motto, or an inspirational quote | Nothing. A motto is not information. |
| Counting stats row: "5+ years · 20+ projects · 100% satisfaction" *(look)* | Real figures one at a time with their context (`chiffres` direction), or none. Never round "+" numbers. |
| Fake testimonials, client logos, "Trusted by" *(look)* | Only what the CV states. A recommendation can be quoted only if the person provides its text and the author's consent. |
| Dark mode toggle with sun/moon icon as a feature | One designed mode. A dark page if the direction deals it. |
| Hobbies with icons (✈️ 📚 🎸) *(check: emoji)* | Interests as a short sentence, only if they say something about the person. |
| "Scroll" indicator, mouse icon, bouncing chevron *(check)* | Content that starts on the first screen. |
| Job titles in tracked capitals above each role (eyebrows) *(check)* | The role is the heading. Dates in tabular figures beside it. |

## 2. General tells (from the generated-page registries)

| Tell | Instead |
| --- | --- |
| Gradients: backgrounds, buttons, text, borders *(check)* | Flat colour. A neutral scrim over a photograph is the one exception (`data-scrim`). |
| Glass: backdrop blur panels, floating pill navigation *(check)* | Opaque surfaces one tone step from the ground; a plain navigation bar. |
| Shadows and glows on things at rest *(check)* | A tone step between surfaces. Shadows only on what truly floats (a menu), marked `data-floats`. |
| Eyebrows: tiny tracked uppercase labels above headings, pill badges *(check)* | The information goes in the heading or the first sentence. |
| Monospace for a "technical" voice outside real code *(check)* | The text face, with tabular figures for numbers. |
| 01 / 02 / 03, (001), "Step 2" *(check: copy)* | Order by position, dates or size. An `<ol>` if it truly is a sequence. |
| Hairline rules, 1px outlined boxes, dashed lines, grid lines, crop marks *(check)* | Space, tone steps, filled shapes. A thick bar (4px+) if a bar is the idea. Lines are allowed inside real tables only. |
| One soft radius (8–16px) on every box *(check)* | Square, or fully round, chosen once for the page. |
| Emoji as icons or bullets *(check)* | Words. |
| Icon in a tinted square above every heading *(look)* | Nothing. |
| One word of the headline in italic, serif, colour or underline *(look)* | One face, one colour per headline. |
| Everything centred *(check)* | Left-anchored; centre one moment per page at most. |
| Nine sizes close to each other *(check)* | Five sizes, far apart. |
| Fade-and-rise on every block, bounce easing, infinite loops *(check: too many entrances)* | One signature move, headings that rise once, one live thing, ease-out (`motion.md`). |
| Everything sliding, pinning and drawing with the scroll *(check: more than one scroll move)* | At most one scroll-linked move, on the motif, if it earns it (`motion.md` §Scroll). Most of the page holds still. |
| An empty page: type on plain ground, section after section *(check)* | The motif in three sections, two full-width fields, one element at display scale per section, and more material from the person (`SKILL.md` step 1). |
| The same layout twice in a row, heading left and text right down the page *(check)* | The shape the sheet deals for each role; name each section's layout before building it. |
| Hover lift and zoom on every card *(look)* | Hover feedback that suits each element, gated to real pointers. |

## 3. Palettes and faces

- **Banned palettes** *(check)*: yellow-cream ground with terracotta, rust or clay; violet and indigo;
  near-black ground with a neon accent and glow. These are the colours of generated pages.
- **Warmth** comes from a low-chroma stone or bone ground (saturation under ~15 %), a deep green, brown
  or oxblood ink, a photograph, or a full flat field (mustard, tomato, pink) used with conviction.
- **Overused faces** *(check: warn)*: Inter, Roboto, Open Sans, Poppins, Montserrat, Lato, Raleway,
  Nunito, Space Grotesk, Playfair Display, Fraunces, Instrument Serif, DM Sans, DM Serif Display, Plus
  Jakarta Sans, Geist, Outfit, Manrope, Sora, Syne, Satoshi, Clash Display, General Sans, Cormorant,
  Bricolage Grotesque, JetBrains Mono, Space Mono, Oswald, Bebas Neue, Anton. They are not bad faces;
  they are what every generated page uses. The sheet deals from a pool of less common open faces.
- **Self-hosted fonts only** *(check)*. No Google Fonts link.

## 4. The frame

- One `h1`, on the first screen, saying who and what, two lines or fewer at every width *(check)*.
- Every headline two lines or fewer at 1440, 768 and 390 *(check)*.
- A heading on every section *(check)*.
- Equal outer margins, 16–32px, at every width *(check)*.
- No section with its content in one half and nothing in the other *(check at 1440)*. Close the void:
  the section's picture, a second column, the list, the dates, a field of colour.
- No stretch of plain ground taller than about half a screen *(look)*. Sections 80–208px apart.
- Body text 16px or more, full ink; grey only for secondary notes *(check)*.
- Contrast AA: 4.5:1 for text, 3:1 for large type *(check)*.
- Nothing on top of a headline at any scroll position; fixed navigation never covers text *(look)*.

## 5. Honesty

- Every fact comes from the CV or the person. No invented employer, date, number, tool, client, quote,
  logo, award or testimonial.
- Sample content is not allowed on a person's site. If a section would be empty, it does not exist.
- No stock photographs of people, no generated faces, no "office" pictures. A drawing from their world,
  in code, is honest; a stranger's face standing in for them is not.
- Found pictures (a city, an archive), if used, are credited in the footer and never presented as the
  person's own work.

## 6. Privacy

Hidden by default: phone, street address, date of birth and age, nationality, marital status, photo
(until confirmed), driving licence, ID numbers, salary, referees. The `mailto:` link carries a subject
line. Nothing from `work/` is published.

## 7. The stack

The site is Astro with React islands (`SKILL.md` step 8). The stack adds possibilities, not exceptions:

- Every rule above applies to components from libraries (Cult UI, Kokonut UI, shadcn) exactly as to hand-written
  markup. `references/components.md` says which ones can be adapted and how.
- The page is static HTML first. All text, every heading and every link are in the HTML Astro writes;
  React only adds movement or interaction on top *(check: no-script pass)*.
- No `client:only` for content, at most one `client:load`, and under 400 KB of JavaScript *(check)*.
- Tailwind's default shadows, blurs, rings and soft radii are not used; utilities reference the tokens
  (`bg-bg`, `text-ink`, `bg-accent`), never raw palette classes (`bg-slate-900`, `text-violet-500`).
- No UI kit look: no shadcn default theme, no Card/Badge/Avatar components as they ship.

## 8. One deliberate break

A page may break one style rule (§1 to §3) when the break says something true about the person that
the rule would hide. A pilot's page with a real instrument gauge for a figure from the CV, a developer's
page set in monospace because code is their material, a beauty-industry page in a soft gradient taken
from their own work, a night-shift nurse's page on a near-black ground with one signal colour.

- **One break per page**, chosen at step 5 with the direction, not to rescue a failing check.
- **Written down**: in `work/notes.md`, the rule broken, the fact from the CV or the person that
  justifies it, and how it shows on the page. One sentence each.
- **Done fully**: a break done timidly reads as a mistake. If it is the gradient, it is a real field of
  colour, not a faint tint.
- **Checked**: `check_site.mjs --allow <tag>` reports that FAIL as ALLOWED (tags: `gradient`, `shadow`,
  `blur`, `eyebrow`, `gauge`, `palette`, `emoji`, `layout`). Every other FAIL still counts.
- **Never a break**: anything in §4 to §7 (honesty, privacy, legibility, the stack), invented content,
  stock faces, the typing effect, rotating titles, a fake testimonial. A gauge for a real figure is
  allowed; a gauge rating a skill is not.
