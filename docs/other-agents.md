# Using folio with other AI coding agents

Agents like **Cursor**, **Aider**, or any LLM with custom instructions don't have native `SKILL.md` discovery. Use one of these methods.

## Option 1: Reference the skill as a file

If your agent can load instructions from a file, point it at:

```
path/to/folio/skills/folio/SKILL.md
```

The skill calls its scripts and references by paths relative to `skills/folio/`, so keep the whole folder, not just `SKILL.md`.

## Option 2: Copy the skill folder

Copy `skills/folio/` into wherever your agent looks for skills:

```bash
cp -r skills/folio/ ~/.your-agent/skills/folio/
```

## Google Antigravity

- **Project level**: symlink or copy `skills/folio/` to `.agents/skills/folio/`.
- **Global**: copy `skills/folio/` to `~/.gemini/config/skills/folio/`.

## Prerequisites

Whatever the method, the environment needs:

- **Python 3.9+** with `pypdf`
- **Node.js 22.23+** (Node 24 LTS recommended) and npm
- **Playwright** with Chromium: `npm i -D playwright && npx playwright install chromium`
