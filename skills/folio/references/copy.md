# Words

Copy is the first design decision. Write the whole page as plain text in `work/copy.md` before any
markup, in the CV's language.

## 1. The argument

Answer in one line each:

- Who reads this page? (A recruiter in hospital nursing; a CTO hiring backend engineers; a school
  admissions panel; a client looking for a freelance designer.)
- What must they believe after one screen? ("She runs a resuscitation bay calmly and wants paediatrics
  in Bordeaux.")
- What proves it? (The CV's facts: the units, the years, the certifications, the numbers.)
- What do they do next? (Write an email. Download the CV. Look at the work.)

Then list the page as claims with proof, one line per section, in the order a reader needs them:

```
1. Camille, infirmière de réanimation à Bordeaux, cherche la pédiatrie.  → name, job, city, aim, button
2. Trois ans de réanimation adulte, dont un an en nuit.                  → the roles, dated
3. Elle sait ce qu'un service de pédiatrie va lui demander.               → the DU, the stage en néonat
4. Les gestes qu'elle maîtrise.                                           → skills, grouped
5. Écrivez-lui.                                                           → email, large
```

A section without a claim is filler; cut it. The usual "About / Skills / Experience / Contact" order is
a default, not a law: a student leads with what they want and their school; a senior leads with the
last two roles; a career changer leads with the story of the turn.

## 2. The first screen

It answers, in large type, who this is and what they do, and offers the next step.

- **The `h1`** is one of: the name (when the direction sets the name large) with the job on the next line
  or in the sentence; or a short statement that contains the name or is beside it ("Inès Hadj,
  ingénieure backend"). Two lines or fewer at every width. About 32 characters is safe everywhere.
- **The supporting sentence** (lead size, 32–48px below the h1, never pushed to the bottom of the
  screen) says concretely what they do, where, and what they look for. At most about 25 words.
  Example: "Six ans de Go et de Kubernetes chez des éditeurs SaaS lyonnais. Je cherche une équipe plateforme,
  à Lyon ou à distance."
- **One action**, named for what it does: "M'écrire", "Écrire à Camille", "Download the CV", "See the
  work". A real link or button. The secondary action, if any, is a plain text link.

Character arithmetic for two lines: characters per line ≈ line width ÷ (font size × k), with k ≈ 0.40
for condensed faces, 0.50 for most faces at display size, 0.58 for wide faces or capitals. At 390px with
20px margins and a 44px headline: about 16 characters per line, 32 for two lines.

## 3. Rewriting experience

The CV's bullets are the raw material. Turn each role into readable statements without adding facts.

- Keep: the role as written, the organisation, the place, the dates, every number, every named tool.
- Rewrite: nominal lists into sentences with a subject and a verb ("Gestion du planning" → "Je
  faisais le planning de 14 personnes" only if "14" is in the CV; otherwise "Je gérais le planning de
  l'équipe").
- First person or neutral, chosen once for the page. French CVs often use infinitive or nominal style;
  on the site, prefer first person ("J'ai…") or a crisp neutral ("Mise en place de…") consistently.
- Most recent first. Two to four lines per role; older roles one line.
- Never upgrade: "participé à" stays "participé à", not "piloté". "Notions" stays "notions".

## 4. Headline shapes

Pick the plainest one that is true:

- **The name.** Strongest with a short name and a direction that sets it large.
- **Name and job.** "Thomas Leroux, commercial terrain."
- **What they do, plainly.** "Je soigne en réanimation." Only if the sentence under it names them.
- **The aim.** "Je cherche une alternance en marketing." For students and career changers.

Avoid: the mad-lib ("Passionate full-stack developer crafting digital experiences"), the tricolon
("Code. Create. Inspire."), the correction ("Not just a developer"), the question, the welcome, the
colon headline, one word styled differently.

Section headings are two to four words, plain: "Parcours", "Expérience", "Ce que je sais faire",
"Formation", "Langues", "Projets", "Me contacter". Not "My journey 🚀", not "Field notes".

## 5. Things that read as generated

`check_site.mjs` flags most of these. In French and English:

- **Vocabulary of the genre:** passionné(e), dynamique, motivé(e) et rigoureux(se), force de
  proposition, sens du relationnel, à l'écoute, polyvalent(e), n'hésitez pas à me contacter, je mets
  mon énergie au service de…, unlock, elevate, seamless, cutting-edge, crafting digital experiences,
  passionate about, driven, results-oriented, team player.
  If a quality matters, show it with a fact from the CV instead of naming it.
- **Furniture text:** "Scroll", local time, coordinates, "© 2026 — Made with ❤️", version stamps,
  strings of words with middle dots or slashes.
- **Em dashes as a habit.** One or two on a page. Use full stops.
- **Threes everywhere:** three qualities, three stats, three values. Use the number the content has.
- **Explaining the design:** "A clean, minimal portfolio".

## 6. French typography

When the page is in French:

- Narrow no-break space (U+202F, `&#8239;`) before `;` `!` `?` and inside « guillemets » ; no-break
  space (U+00A0, `&nbsp;`) before `:`. `check_site.mjs` warns on ordinary spaces and missing ones.
- Guillemets « » for quotations, never "straight quotes". Apostrophe ’ (U+2019), not '.
- Dates: "mars 2021 – juin 2024" with an en dash and spaces, or "2021–2024" without spaces for years
  only. Months in lower case.
- Numbers: thousands with a narrow no-break space (12 500), decimal comma (4,5), percent with a
  narrow no-break space (112 %), currency after the number (35 k€, 1 200 €).
- Titles: sentence case ("Expérience professionnelle", not "Expérience Professionnelle").
- Capitals keep their accents (É, À).
- Diplomas as written: "Diplôme d'État d'infirmier", "BTS NDRC", "Master 2".
- `lang="fr"` on `<html>`, `hyphens: auto` allowed on body text in French, never on headings.

## 7. Micro-typography

- Curly quotes and apostrophes, a real ellipsis (…), an en dash for ranges (2019–2022).
- Tabular figures for dates in columns and for figures.
- No text under 13px, no centred paragraph over three lines, no justified text, no all-caps over three
  words.
- The `mailto:` link has a subject: `mailto:camille@…?subject=Votre%20site`.
