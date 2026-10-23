# Type, colour, layout

The direction sheet deals the faces, the palette and the compositions. This file is how to apply them
so the page looks decided.

## Type

- **Few sizes, far apart.** One display size, one heading size, one lead size, one body size, one small
  size. Five is the ceiling. The display size is at least four times the body size on desktop; the best
  personal sites go much further (a name at 12–20vw). If two sizes look almost the same, make them the
  same.
- **Display settings** for anything over 40px: tracking −0.02 to −0.05em (tighter as it grows; capitals
  0 to +0.03em), leading 0.85–1.05, `text-wrap: balance`, a `max-width` in `ch` so lines break where you
  decide. Pull large round or diagonal initials left by about 0.05em to align optically with the text
  below. Author the line break of the name and the h1 at each width.
- **Text**: 17–19px, leading 1.45–1.6, 45–75 characters per line, full ink. Secondary text is the same
  face in `--muted`, never smaller than 13px and never a thin weight.
- **Weights**: big type does not need to be bold; half of strong heroes are regular. Use the weights the
  sheet names, no more.
- **One family or two**, never three. Each face keeps its job.
- **Figures**: `font-variant-numeric: tabular-nums` on dates, periods and numbers in columns.
- **Fitting a line to the width**: never guess a `vw` size for a name that must run margin to margin;
  measure it (`data-fit` in the template's `src/scripts/base.js`, or SVG `textLength`). A name a few pixels off the edge reads
  as a mistake.
- **Accents and commas between lines**: capitals with accents (É, À) and a comma at the end of the line
  above collide when leading drops under about 0.95. Check two-line display lines in the screenshots.
- **Light on dark**: drop one weight step, add 0.01em tracking, raise leading slightly.

## Colour

- Roles: `--bg` (ground, 50–80 % of the page; the rest is fields and pictures), `--surface` (one tone step, for panels and fields),
  `--ink` (text), `--muted` (secondary text, passes 4.5:1), `--accent` (the action and at most one other
  thing, under 5 % of any screen), `--accent-ink` (text on the accent), and `--field-n` with its ink when
  the palette has fields.
- Every colour in the build is a token. A raw hex in a rule is a second palette starting.
- Surfaces are separated by tone, not by lines or shadows. One step is enough; never nest a panel in a
  panel.
- A field is a whole section in one flat colour with its own ink, edge to edge. Neighbouring fields differ
  in lightness. Order them like chapters. **Every page has at least two**: the ink used as the ground of
  the cover or of one chapter is the simplest and strongest (light ink on a deep ground, then back).
- Headings are ink, not accent. Links are ink with an underline; the accent marks the main action.
- A dark page: `color-scheme: dark` on `:root`, a tinted deep ground, a soft light ink, `--muted`
  checked at 4.5:1, depth from a lighter surface step, never from glows.
- With a photograph, take the ground or one field from its background tone if it fits the proportions;
  never wash the photo with the brand colour.

## Layout

- **Margins**: one pair, 16–32px, equal on both sides at every width. The navigation sits on the same
  margins as the content.
- **Grid**: 12 columns from 768px (Tailwind's `md:`), 4 below. Every left edge is a column line. Two or three anchor
  lines for the whole page (the margin, a third across, the midpoint), reused on purpose.
- **No centred container by reflex.** Large things (the name, colour fields, pictures) run the full
  width; only the measure of running text is constrained (`max-width` in `ch` on the paragraph).
- **Text in one half means something in the other half**: the dates, the list, the picture, the figure,
  the definition list. Never plain ground.
- **Section rhythm**: 80–208px between sections on desktop, 64–112px on the phone. The gap between
  sections is clearly larger than any gap inside one. A heading has twice as much space above as below.
- **No two neighbouring sections share a layout.** Name each section's shape (split, rows, statement,
  table, field, poster…); the same word twice in a row is the template showing.
- **Break the system once**: one centred line, one inverted section, one element at a different scale.
- **Navigation**: the name or initials at one end, two to four plain links, one action. On the phone,
  the name and the action; links move to the footer or a simple sheet. Fixed navigation never covers
  text; prefer static.
- **Endings**: a designed close (the email large, the name returned, one quiet line), not link columns.
- **Short is fine, empty is not.** Most personal sites need four to six sections; do not add sections to
  seem complete. But each section is full: its content, the motif or a picture, and one thing at display
  scale. A section that is a heading and two lines of body text on plain ground is a gap in the page.

## The phone

Design 390px as its own composition: re-author line breaks, re-crop the photo to portrait, stack splits
in the order of reading, keep one dominant thing on the first screen with the h1, the sentence and the
action visible. Margins 16–20px, body 16–18px, touch targets 44px high. Check the 390 screenshots every
round: overflow and three-line headlines appear there first.
