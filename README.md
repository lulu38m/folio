# folio

**Your CV, made into a site that is yours.**

> **Rather not install anything?** Send your CV at [FOLIO_DOMAIN](https://FOLIO_DOMAIN) and get your site online, from 12 €. 🇫🇷 [Lire en français](README.fr.md)

<p>
  <img src="docs/assets/camille-rousseau.png" alt="Site made by folio for Camille Rousseau, an ICU nurse (fictional CV): a handover sheet with her name, ward and target post" width="49%">
  <img src="docs/assets/ines-hadj.png" alt="Site made by folio for Inès Hadj, a backend engineer (fictional CV): name and pitch on the left, a spec table on the right" width="49%">
</p>

`folio` is an agent skill that turns a CV into a personal website that does not look generated. Give it a CV (PDF, DOCX, LinkedIn export or text) and it builds a static Astro site with an art direction made for that one person, the SEO a personal page needs to come first on the name, and a LinkedIn announcement image and post.

Nothing is invented: every fact on the page comes from the CV.

The two sites above were made by `folio` from fictional CVs: a nurse whose page is a ward handover sheet, an engineer whose page reads like a spec. Same skill, nothing in common.

## Rather not run it yourself? Use FOLIO_DOMAIN

[FOLIO_DOMAIN](https://FOLIO_DOMAIN) runs `folio` for you. Send your CV, get your site online at your name. No account, no subscription, no terminal.

| | Skill | Essentiel | Pro |
|---|---|---|---|
| Price | Free | 12 € once | 29 € once |
| Site made from your CV | ✓ | ✓ | ✓ |
| Hosting | Your own | 1 year included, on `firstname-lastname.FOLIO_DOMAIN` | 1 year included, on your own domain |
| Changes | As many as you like | 2 regenerations | Unlimited for 1 year |
| LinkedIn image and post | ✓ | ✓ | ✓ |
| "Made with folio" footer | Your call | Yes | No |
| Site source code | ✓ | | ✓ |

After the first year, hosting renews at 19 € a year, CV updates included, never charged automatically.

The skill stays free and open source. Install it below and run it yourself anytime.

## Install

**Claude Code:**

```bash
/plugin marketplace add lulu38m/folio
/plugin install folio@folio
```

**Codex:**

```bash
codex plugin marketplace add lulu38m/folio
codex plugin add folio@folio
```

**Any other agent**, one command via the [`skills`](https://github.com/vercel-labs/skills) CLI (Cursor, Codex, Copilot, Gemini CLI, opencode, and more):

```bash
npx skills add https://github.com/lulu38m/folio --skill folio
```

Add `-g` to install it globally; drop it to scope it to the current project.

<details>
<summary>No installer? Copy the skill directly.</summary>

```bash
git clone https://github.com/lulu38m/folio
mkdir -p ~/.claude/skills && cp -R folio/skills/folio ~/.claude/skills/
```

Restart Claude Code after copying. In the Claude app, zip `skills/folio/` and upload it under Settings → Capabilities → Skills.
</details>

### Also works with

This repo exposes the skill at every agent's standard discovery path via symlinks. No extra config needed.

| Agent | How it discovers |
|---|---|
| **Claude Code** | `.claude/skills/folio/` (in addition to the plugin install above) |
| **Codex CLI** | `.agents/skills/folio/`, walking up to the repo root |
| **opencode** | `.opencode/skills/folio/` |
| **Google Antigravity** | `.agents/skills/folio/` at the project root, or `~/.gemini/config/skills/folio/` globally |
| **Other agents** | Point custom instructions at `skills/folio/SKILL.md`, see [`docs/other-agents.md`](docs/other-agents.md) |

> **Windows users:** symlinks need `git clone -c core.symlinks=true` and Developer Mode or admin rights. If they do not work, copy `skills/folio/` to your agent's skill folder instead.

## Use it

Attach your CV and ask:

```text
Turn my CV into a website.
```

Or point it at a site you already have:

```text
Make my personal site look less generated.
```

The skill works in French and English and writes the site in the CV's language. You get a project folder with `work/` (the extracted profile and notes), `site/` (the Astro source) and `site/dist/`, ready to put on Netlify, Vercel, Cloudflare Pages or GitHub Pages.

## How it works

1. **Read.** `extract_cv.py` pulls the text, links and photo from the CV. The agent fills a profile, copying facts as written, and asks once, in one message, for anything essential that is missing.
2. **Hide what is private.** Phone, street address, date of birth, nationality and photo stay off the page unless the person asks for them.
3. **Deal a direction.** `deal.py` deals three of ten art directions, each with its own type system and palette, seeded by the person, so two people in the same job never get the same site.
4. **Build.** A static Astro site from `assets/site-template/`: React islands for motion, Tailwind, self-hosted fonts from Fontsource, optional [Cult UI](https://www.cult-ui.com) components.
5. **SEO.** `seo_head.py` writes the title, description, Open Graph, a schema.org `Person` with public facts only, and the sitemap.
6. **Check, look, fix.** `check_site.mjs` opens the site in a real browser at three widths and fails what reads as generated. The agent looks at the screenshots, critiques them like a juror, fixes, and looks again.
7. **Announce.** A LinkedIn image and post to share the site.

## What it refuses to make

Skill bars, "Hi, I'm Alex 👋", typing effects, timelines with dots, circular avatars, icon rows, tech logo walls, cards for every job, gradients, glass, glows, eyebrow labels, monospace "tech" captions, the cream-and-terracotta and purple palettes, Google Fonts links, and any fact that is not in the CV.

## Requirements

- An agent that supports Agent Skills: Claude Code, the Claude app, Codex CLI, opencode, or any agent with custom instructions
- Python 3.9+ with `pypdf`
- Node.js 22.23+ (Node 24 LTS recommended) and npm. Check with `node -v`; if it is older, `nvm install 24` (or download it from nodejs.org)
- Playwright with Chromium, for the check: `npm i -D playwright && npx playwright install chromium`
- Optional: `tesseract` (with the French data), to read CVs exported as images (Canva, scans). Without it, the agent reads the page image itself

Optional, for a second review pass: `npx skills add vercel-labs/agent-skills --skill web-design-guidelines`.

## What's in this repo

- `skills/folio/`: the skill
  - `SKILL.md`: the run, step by step, and the house rules
  - `references/`: directions, copy (with French typography), rules, components, type/colour/layout, SEO, motion, critique
  - `scripts/`: `extract_cv.py`, `deal.py`, `new_site.mjs`, `fetch_fonts.mjs`, `seo_head.py`, `check_site.mjs`
  - `assets/site-template/`: the Astro project every site starts from
- `docs/`: screenshots and the guide for other agents
- `plugin.json`: portable Agent Plugins manifest
- `.claude-plugin/`: Claude Code manifest and marketplace catalog
- `.codex-plugin/`: Codex manifest
- `.claude/skills/folio/`, `.agents/skills/folio/`, `.opencode/skills/folio/`: symlinks to `skills/folio/`

## Credits

- House rules and the look-and-fix loop adapted from [taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT, © 2026 Leonxlnx)
- Motion rules adapted from [Emil Kowalski's skills](https://github.com/emilkowalski/skills) (MIT, © 2026 Emil Kowalski)
- SEO hygiene rules adapted from Vercel's [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) (MIT, © 2025 Vercel Labs)
- Optional components adapted from [Cult UI](https://www.cult-ui.com) (MIT, © 2023 Jordan Gilliam)
- The optional review step uses the `web-design-guidelines` skill from [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- Fonts from [Fontsource](https://fontsource.org), under the SIL Open Font License

## Contributing

Ideas, bug reports and new art directions are welcome: open an issue or a PR. Please never attach a real person's CV; use a fictional one.

## Licence

[MIT](LICENSE). The hosted service at [FOLIO_DOMAIN](https://FOLIO_DOMAIN) is a separate product built on this skill.
