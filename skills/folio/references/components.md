# Components and outside resources

The site is Astro with React islands, Tailwind and Motion, so components from the React ecosystem can be
used. Most of them were made for product pages and carry the generated look (glow, glass, gradient, soft
shadow, rounded card). A component is used for its **behaviour**, then restyled to the sheet's tokens until
it passes the house rules. If it cannot pass them without losing what it does, it is not used.

## 1. Cult UI

[Cult UI](https://www.cult-ui.com) (MIT, © Jordan Gilliam) is a shadcn registry of animated React
components built on Motion and Tailwind. The template is ready for it: `components.json`, the `@/*` alias
and `cn()` in `src/lib/utils.ts`.

### Install one

```bash
cd site
npx shadcn@latest add https://cult-ui.com/r/<name>.json
```

It writes `src/components/ui/<name>.tsx` and installs the npm packages it imports. If the registry cannot
be reached, copy the source from GitHub and install its imports by hand:
`https://raw.githubusercontent.com/nolly-studio/cult-ui/main/apps/www/registry/default/ui/<name>.tsx`.
Keep the first-line comment `// Adapted from Cult UI (MIT, © Jordan Gilliam)` in the file.
`src/components/ui/CopyEmail.tsx` in the template is a worked example: Cult UI's `copy-button` with a
word instead of icons, no blur, no scale-from-small, tokens instead of its colours.

### Adapt it, every time

1. **Tokens, not its colours.** Replace its colour classes (`bg-neutral-900`, `text-white`, `ring-*`) by the
   token utilities (`bg-bg`, `bg-surface`, `text-ink`, `text-accent`, `bg-accent text-accent-ink`).
2. **Remove the look.** Delete `shadow-*`, `drop-shadow-*`, `blur-*`, `backdrop-blur-*`, gradients
   (`bg-gradient-*`, `from-*`/`via-*`/`to-*`, inline `linear-gradient`), `ring-*` outlines and 1px borders.
   Radius: square, or fully round, as the page chose once. Surfaces differ by one tone step instead.
3. **The HTML holds the content.** If it renders its text from `initial={{ opacity: 0 }}` or only after
   mount, rewrite the entrance with `useOnView` (`motion.md`). No `client:only`.
4. **Next.js out.** Replace `next/image` by `<img width height alt loading="lazy">` and `next/link` by `<a>`.
5. **Fonts out.** Remove its font imports (`geist/font/*`): the sheet's faces only.
6. **Motion values in.** Durations and curves from `motion.md`; no bounce, no infinite loop.
7. **Hydrate it right.** `client:visible` if it responds to the visitor, `client:idle` if it animates on
   view. Then `check_site.mjs` again: it measures shadows, blur, gradients, hidden text and the JS weight.

### Which ones

**Useful after adapting** (behaviour a personal page can need):

| Component | For | Note |
| --- | --- | --- |
| `expandable` | Experience rows that open to show the CV's bullets | Remove its shadows and blur |
| `direction-aware-tabs` | Skill groups, languages, two CV versions (FR/EN) | Square tabs in tokens; text in HTML for every tab (render all panels, hide inactive with `hidden`) |
| `side-panel` | A project's details beside its picture (`atelier`) | |
| `text-animate` | The h1 or a section heading rising word by word, once | Only `fadeInUp` or `calmInUp`; adapt to `useOnView` |
| `rolling-number` | A figure that rolls to its value | Prefer the template's `CountUp`, which is already safe |
| `squiggle-arrow` | One hand-drawn mark pointing at the action | Once per page at most |
| `svg-shapes`, `svg-bands` | Flat shapes and bands as a drawing from the person's world | In the palette only |
| `lightboard` | A dot-matrix board (`affiche`, transport, logistics, sport) | The text must also be real HTML beside it |
| `speech-bubble` | A real quote the person provided, with consent | Never an invented testimonial |
| `copy-button` | Copy the email address | Remove the blur; a word, not only an icon |
| `bg-media` | A video or photo of the person's own work, full-bleed | With `data-scrim` if text sits on it |
| `mock-browser-window` | A real screenshot of a site the person built (`atelier`) | Never around placeholder content |

**Never** (they are the generated look, or a portfolio tell from `rules.md`): `typewriter`,
`type-animate` (typing effect); `glow-button`, `gradient-button-group`, `gradient-heading`,
`bg-animated-gradient`, `hero-static-radial-gradient`, `hero-color-panel`; every `halo-*`,
`border-beam-*`, `neumorph-*` (including `neumorph-eyebrow`), `metal-button`, `cosmic-button`,
`organic-*`, `texture-*`, `shadow-card`, `minimal-card`, `shift-card`, `cutout-card`, `folded-card`
(cards with shadows); `distorted-glass`, `fluted-glass`, `edge-blur`, `hero-liquid-metal`,
`hero-dithering`, `dither-image`, `shader-*`, `ai-blob-warp`, `bg-animated-fractal-dot-grid`,
`canvas-fractal-grid`, `grid-beam`, `stripe-bg-guides` (ornament); `logo-carousel`, `tweet-grid`,
`dock`, `globe`, `three-d-carousel`, `feature-carousel`, `loading-carousel` (tells: logo walls,
carousels, icon docks); `apple-*`, `mac-screen` device mockups; and everything made for products
(`ai-*`, `prompt-*`, `agent-*`, `marketing-*`, `gateway-*`, `analytics-chart`, `kanban-board`, `*-poll`,
`vote-tally`, `feature-voting`, `collab-*`, `onboarding`, `wizard-expandable`, `security-checkpoint`,
`popover-form`, `color-picker`, `timer`, `file-icons`, `code-block` outside real code,
`terminal-animation`). `pixel-heading-*` need Geist fonts (overused): only with the sheet's face.

Any component not listed: judge it by the same test, and record the decision in `work/notes.md`.

## 2. Kokonut UI

[Kokonut UI](https://kokonutui.com) (MIT, © Dorian Baffier) is a second shadcn registry built on the same
stack (Tailwind, Motion). It installs into the same template, and the seven adaptation steps of §1 apply
unchanged.

```bash
cd site
npx shadcn@latest add https://kokonutui.com/r/<name>.json
```

It writes `src/components/kokonutui/<name>.tsx`; move it to `src/components/ui/`. If the registry cannot
be reached, copy the source from
`https://raw.githubusercontent.com/kokonut-labs/kokonutui/main/components/kokonutui/<name>.tsx`. Keep the
header comment (`@author`, `@license: MIT`) in the file.

**Useful after adapting:**

| Component | For | Note |
| --- | --- | --- |
| `marker-text` | A hand-drawn mark (circle, underline, highlight) on one phrase of the body, drawing once when it is on screen | Once per page, never inside a headline (`rules.md` §2: one word marked in a headline is a tell). Colour from the tokens |
| `split-flap-text` | A departures-board line (`affiche`, transport, logistics, travel) | Always pass `text`, never `words`: cycling words is the rotating-job-title tell. The text is real HTML too |
| `contact-sheet` | A photographer's or videographer's own frames as a film contact sheet, with their marks | Their pictures only. Remove its gradient and rounded corners |
| `lightbox-grid` | The person's own work (photos, drawings, screens) opening full size | `next/image` → `<img width height alt loading="lazy">`; square corners |
| `scroll-index` | A rail of ticks beside a long page, one per section heading | `scroller="window"` and the page as `children`, never its sample article. Only for long pages (six sections or more) |
| `background-paths` | A ribbon of lines drawing in once behind a first screen, when lines mean something in the person's world (textile, cartography, sound, flows) | `speed={0}` and `interactive={false}` so it draws once and holds; stroke in a token; never behind body text. Judge it in the screenshots |

**Never:** the decorative backgrounds (`halftone-background`, `dot-field`, `flow-field`, `topo-background`,
`drape-background`, `ink-background`, `caustics-background`, `rain-glass-background`, `shape-hero`);
`gradient-button`, `liquid-glass-card`, `morphic-navbar`, `particle-button`, `attract-button` (gradient,
glass, glow); `bento-grid`, `card-stack`, `card-flip`, `carousel-cards`, `notification-stack` (cards and
carousels); `type-writer`, `glitch-text`, `swoosh-text`, `shadow-text` (typing effect, extruded or shadowed
type); `metric-card`, `spending-ring`, `liquid-gauge`, `uptime-card`, `apple-activity-card` (gauges and
stat tiles); every `ai-*`, and everything made for products (payments, pickers, carts, drawers, toolbars).

## 3. Other resources

| Resource | Status | Why |
| --- | --- | --- |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | Built in | `rules.md`, `critique.md` are adapted from it |
| [Emil Kowalski's skills](https://github.com/emilkowalski/skills) | Built in | `motion.md` is adapted from them |
| [Vercel web-design-guidelines](https://github.com/vercel-labs/agent-skills) | Optional review, step 10 | `seo.md` §6 |
| [Anthropic frontend-design](https://github.com/anthropics/skills) | Optional, compatible | Same stance (commit to a direction, distinctive type). folio's dealt sheet already plays its role; if installed, do not let it replace the sheet |
| [Impeccable](https://github.com/pbakaus/impeccable) | Optional review, step 11 | Its audit and critique commands can add a second opinion after `critique.md` |
| [Refero Styles](https://styles.refero.design) | Reference only | Real products' design systems: useful to study type and spacing, never copied into a person's site (another brand's identity) |
| [Recent](https://recent.design) (ex-[Godly](https://godly.website)) | Reference only | A gallery of remarkable sites: useful when writing a new direction, never copied into a person's site |
| [Sitereel](https://sitereel.ai) | Reference only | Ready-made site prompts (portfolio, product, luxury): finished styles with no link to a CV. The dealt sheet plays this role |
| [ShaderGradient](https://shadergradient.co) | Not used | An animated gradient on WebGL: the gradient tell, heavy (three.js), and nothing of the person in it |
