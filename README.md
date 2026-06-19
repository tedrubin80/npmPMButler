# PM Butler

Eight AI project management personas for Claude Code, Cursor, and npm-based skill install.

**Repository:** [github.com/tedrubin80/pmbutler](https://github.com/tedrubin80/pmbutler)

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

Copies `skills/pm-butler/` to:

- `~/.cursor/skills/pm-butler/`
- `~/.claude/skills/pm-butler/`

### Project-local (Cursor)

Commit `.cursor/skills/pm-butler/` into your repo. See `packaging-example/project-local/` in the parent monorepo for layout.

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
