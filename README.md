# PM Butler

Eight AI project management personas for Claude Code, Cursor, and npm-based skill install.

**Site:** [pmbutler.dev](https://pmbutler.dev) · **Repository:** [github.com/tedrubin80/pmbutler](https://github.com/tedrubin80/pmbutler) · **npm:** [pm-butler](https://www.npmjs.com/package/pm-butler)

## Install

### Claude Code (plugin marketplace)

```
/plugin marketplace add tedrubin80/pmbutler
/plugin install pmbutler
```

Invoke: `/pmbutler:pm-butler init`

Local dev test:

```bash
claude --plugin-dir .
```

### Cursor / Claude (personal skill via npm)

```bash
npx pm-butler skills install
npx pm-butler skills check
```

### Project Edition (decision logs in your repo)

Scaffold living markdown files for decisions, scope, risks, and lessons:

```bash
npx pm-butler docs init
npx pm-butler docs init --dir docs/pm   # optional subdirectory
npx pm-butler docs check
```

Creates `PROJECT.md` plus eleven Project Edition files (`DECISIONS.md`, `SCOPE.md`, `RISKS.md`, etc.). Commit them to git — that is the durable record. Personas update these files during `/pm-butler` commands.

### Persistent memory (optional)

Programmable structured memory in a local folder or SQLite database:

```bash
# Git-friendly JSON under .claude/pm-butler/memory/
npx pm-butler memory init --enable --path .claude/pm-butler --backend folder

# SQLite under .pm-butler/sqlite/pm-butler.db (Node 22+)
npx pm-butler memory init --enable --path .pm-butler --backend sqlite

npx pm-butler memory status
npx pm-butler memory config --enable --backend folder --path .claude/pm-butler
npx pm-butler memory log --type decision --title "Pick npm for install" --body "..."
npx pm-butler memory list --type decision --limit 10
```

Settings live in `PROJECT.md` (**Persistent memory** section) and `<path>/config.json`. Toggle anytime with `memory config --enable` or `--disable`.

### Project-local (Cursor)

Commit `.cursor/skills/pm-butler/` into your repo. See `npm-packages/v2/project-local/` in the parent monorepo for layout.

## First run

```
/pmbutler:pm-butler init
```

Creates `PROJECT.md` from `templates/PROJECT.md`.

## Structure

```
skills/pm-butler/
??? SKILL.md           # Entry point
??? reference/         # Sub-command flows
??? content/           # Full ensemble + project edition prompts
??? scripts/           # context.mjs
```

## Commands

`init` · `route` · `discover` · `scope` · `design` · `sprint` · `review` · `launch` · `document` · `concerns` · `handoff` · `crisis`

See `skills/pm-butler/SKILL.md` for the full table.

## Repository

This is the **npm publish repo**: [github.com/tedrubin80/npmPMButler](https://github.com/tedrubin80/npmPMButler)

Full monorepo (site, Gumroad packs): [github.com/tedrubin80/pmbutler](https://github.com/tedrubin80/pmbutler) — attached as git submodule at `npmPMButler/`.

## Changelog

### 0.1.5

- `npm pkg fix`: normalized `repository.url` and `bin` path (no behavior changes)

### 0.1.4

- Synced full package: `docs init`, `memory`, templates
- Repository moved to npmPMButler; monorepo submodule

### 0.1.3

- `docs init` / Project Edition scaffolds
- `memory init` / persistent memory (folder + sqlite)
