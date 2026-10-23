# Motion

Motion comes last and stays small. A personal site is read, not operated: a recruiter opens it once or
twice. One orchestrated moment on load and short entrances as sections arrive land better than effects
everywhere. Rules adapted from Emil Kowalski's skills (MIT).

## What moves

1. **The signature move** on the sheet, once, on load or when its section enters.
2. **Entrances**: a section's heading, then its text, then its picture, staggered 40–80 ms apart,
   rising 12–24px with opacity, once. Not one fade for a whole block, and not the same fade on every
   block of the page.
3. **Feedback**: buttons scale to 0.97 on press (100–160 ms); links thicken their underline on hover;
   the copy-email button changes its label to confirm.
4. Nothing else. No parallax on text, no cursor followers, no marquee of skills, no infinite loops.

## Curves and durations

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);     /* entering, leaving, responding */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* moving across the screen (a drawn route) */
```

| What | Duration | Curve |
| --- | --- | --- |
| Button press | 100–160 ms | ease-out |
| Hover colour or underline | 150–200 ms | ease |
| Small reveal (details opening, label change) | 150–250 ms | ease-out |
| Section entrance | 400–600 ms | ease-out |
| Signature move on load | 500–900 ms total | ease-out (or ease-in-out for a line drawing) |

- Never `ease-in` for anything the visitor watches start. Never bounce or overshoot.
- Never animate from `scale(0)`; start at 0.95 or more with opacity.
- Exit faster than entrance.
- Transform, opacity and clip-path only; never animate width, height, top or left (a `<details>` height
  change is the one exception, and it is short).
- `transition` with named properties, never `transition: all`.
- Hover effects inside `@media (hover: hover) and (pointer: fine)`.

## Never lose content

- Content is visible on the first paint without script. `src/styles/base.css` only hides `[data-reveal]`
  when `html.js` is set, and `src/scripts/base.js` shows everything after 2.5 s in any case.
- A React island renders its final state in the HTML. It may put things in their start state only on the
  client, only if they are still below the fold, and only to animate them in (`useOnView`, below).
- `prefers-reduced-motion: reduce` keeps everything visible and removes travel; opacity changes may stay.
- After adding motion, run the check again: a text element still invisible after scrolling is a FAIL.

## Clip-path reveals

Never put a fully closed `clip-path` on the element the IntersectionObserver watches: Chromium counts
the clipped element as not intersecting, so the reveal never fires and the screen stays blank. Observe
the container and clip its children.

## Counting figures, drawing lines

- A counting figure uses tabular figures so its width does not jump, runs once, and shows its final
  value immediately under reduced motion and without script (the HTML holds the real value; the script
  counts up to it).
- A drawn line (`stroke-dashoffset`) runs once, 700–900 ms, ease-in-out; the labels appear as the line
  reaches them, and are in the HTML from the start.

## Motion in the Astro site

The site is static Astro. Two tools, in this order:

1. **CSS and `data-reveal`** (from `src/scripts/base.js`) for section entrances, hover and press. No
   JavaScript framework is shipped for these. Most of the page should move this way.
2. **React islands with Motion** (`motion` on npm, ex-Framer Motion) for what CSS does badly: the
   signature move, a spring, a sequence across several elements, a figure that counts, a line that draws,
   a layout change (a `<details>`-like expansion, tabs). Islands live in `src/components/`.

The template ships three islands built on one rule (`src/components/motion/useOnView.ts`): the HTML holds
the final state; on the client, only elements still below the fold are put in their start state, then
played once when they enter; reduced motion leaves everything as rendered.

| Island | Use | Example |
| --- | --- | --- |
| `CountUp.tsx` | A real figure from the CV counting once | `<CountUp client:idle value={112} suffix=" %" />` |
| `DrawPath.tsx` | A route, a plan, a curve drawing once | `<DrawPath client:idle d="…" viewBox="0 0 400 200" stroke="var(--accent)" />` |
| `Rise.tsx` | A list whose items rise or wipe in sequence | `<Rise client:idle clip><ol>{items.map(i => <li data-rise>…</li>)}</ol></Rise>` |

Rules for islands:

- `client:idle` for anything that animates on view (it must hydrate before the element arrives to prepare
  it); `client:visible` only for things that respond to the visitor (tabs, an expanding row). Never
  `client:load` on more than one island, and never `client:only` for content (it is absent from the HTML,
  so search engines and the no-script check see nothing).
- Motion values: the curves and durations above. Springs only for things the visitor drags or toggles,
  with no visible overshoot (`bounce: 0`, or damping high enough).
- A third-party component (Cult UI, see `components.md`) that starts its content at `opacity: 0` in the
  HTML must be adapted to `useOnView` before use. `check_site.mjs` fails text missing without script and
  text hidden on the first screen.
- JavaScript budget: under 400 KB uncompressed for the whole page (`check_site.mjs` reports it). React
  and Motion together are about 290 KB (about 90 KB over the wire); that leaves room for a few islands,
  not twenty. A page with no island ships no framework at all.
