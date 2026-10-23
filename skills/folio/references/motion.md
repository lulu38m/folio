# Motion

Motion is built last and kept small. A personal site is read, not operated: most of the page holds
still, and what moves moves once. One orchestrated moment on load, section headings that rise as they
arrive, one live thing, and at most one scroll-linked move on the motif. A page that moves everywhere is
tiring and reads as a demo. Never effects for their own sake. Rules adapted from Emil Kowalski's skills (MIT).

## What moves

1. **The signature move** on the sheet, once, on load or when its section enters.
2. **Optional, the scroll move** on the sheet, on the motif only (a drawing, a bar; below, §Scroll).
   One per page at most. No display type sliding with the scroll, no pinned chapters.
3. **Entrances**: a section's heading rises once (`data-reveal`, or line by line with
   `data-reveal="lines"`), 12–24px with opacity. Not every paragraph, list item, row or picture: the
   check warns past about a dozen entrances.
4. **Feedback**: buttons scale to 0.97 on press (100–160 ms); links thicken their underline on hover;
   the copy-email button changes its label to confirm.
5. Nothing else. No parallax on running text, no cursor followers, no marquee of skills, no infinite
   loops, no scroll-jacking (the page always scrolls at the visitor's speed).

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

## Scroll

`src/scripts/base.js` gives every element marked `data-scroll` two custom properties, updated once per
frame while it is near the screen:

- `--p`: 0 when its top reaches the bottom of the screen, 1 when its bottom leaves the top. For movement
  that lasts the whole crossing (a line sliding, a picture moving slower than the page).
- `--pe`: 0 when it enters, 1 once its top is 35 % up the screen; it never goes back and completes at the
  end of the page. For things that build once (a drawing, a bar, a stamp).

Nothing is set without script or under reduced motion: every rule must fall back to the finished state,
`var(--pe, 1)` and `var(--p, 0.5)`. The helpers in `src/styles/base.css`:

| Class (inside a `data-scroll` block) | Does | Example |
| --- | --- | --- |
| `.scroll-draw` | SVG shapes with `pathLength="1"` draw with `--pe` | a route, a staff, a plan, a signature |
| `.scroll-grow` / `.scroll-grow-y` | scaleX / scaleY from 0 to 1 with `--pe` | a period bar, a figure's bar, a ruling |
| `.scroll-x` / `.scroll-x-rev` | translateX by `--shift` (16vw) across the crossing | a display line, a huge year, the closing name |
| `.scroll-y` | translateY by `--shift` (12vh) | a photo moving slower than the page |
| `.scroll-turn` | rotate by `--turn` (20deg) | a stamp, a sticker, a shape from the trade |
| `.pin` | `position: sticky; top: 0` | a chapter heading that stays while its rows scroll under it |

```astro
<section data-scroll class="bg-ink text-bg">
  <h2 class="text-display scroll-x" style="--shift: 10vw">Le trombone</h2>
  <svg class="scroll-draw" viewBox="0 0 1200 120" aria-hidden="true">
    {[0,1,2,3,4].map((i) => <line x1="0" x2="1200" y1={10 + i * 25} y2={10 + i * 25} pathLength="1" stroke="currentColor" stroke-width="6" />)}
  </svg>
</section>
```

Rules: transforms and strokes only (never width, top or opacity of text); a display line slides at most
about a fifth of the screen and is fully readable at the middle of its crossing; two neighbouring
display lines move in opposite directions; running text never moves with the scroll. A line set against
a margin gets `padding-inline` of half its `--shift`, so the slide ends on the margin, never off the edge. To stagger several
shapes, give each its own range with `--k` (0, 1, 2…):
`stroke-dashoffset: clamp(0, calc(1 - var(--pe, 1) * 1.5 + var(--k) * 0.12), 1)`.

Never put a scroll helper and `data-reveal` on the same element: both set `transform`, and the reveal
cancels the scroll move (or the reverse). The scroll move goes on a wrapper, the reveal on the child.

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
