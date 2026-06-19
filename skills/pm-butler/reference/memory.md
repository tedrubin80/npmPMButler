# /pm-butler memory

Read or write **persistent memory** when enabled in `PROJECT.md`.

## Check settings

```bash
npx pm-butler memory status
```

Or run `node skills/pm-butler/scripts/memory.mjs status`.

## When memory is enabled

After substantive PM work, log structured entries:

```bash
npx pm-butler memory log --type decision --title "..." --body "..." --persona Oracle
npx pm-butler memory log --type concern --title "..." --severity concern --persona Sculptor
```

Also update Project Edition markdown (`DECISIONS.md`, `CONCERNS.md`, etc.) when that mode is active. Memory store and markdown should agree.

## Settings (PROJECT.md)

```markdown
## Persistent memory
- **Enabled:** true
- **Backend:** folder | sqlite
- **Path:** .claude/pm-butler
- **Git trackable:** true
```

Programmatic override: `<path>/config.json` with `persistentMemory` object.

## Backends

- **folder** — JSON files under `<path>/memory/` (commit to git when git trackable)
- **sqlite** — `<path>/sqlite/pm-butler.db` (Node 22+; gitignore when not trackable)
