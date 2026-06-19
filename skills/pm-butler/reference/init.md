# /pm-butler init

Create or refresh `PROJECT.md` at the repository root.

## Before starting

If Project Edition files are missing, tell the user to run:

```bash
npx pm-butler docs init
# optional: npx pm-butler docs init --dir docs/pm
```

Resolve the documentation directory from `PROJECT.md` (`**Documentation directory:**`). All Project Edition paths are relative to that directory (default: repo root).

## Flow

1. Interview the user briefly (or infer from the codebase):
   - Project name and one-liner
   - Who uses it and in what context
   - Stack (frontend, backend, infra)
   - Team size and decision makers
   - Timeline and non-negotiable constraints
   - Current SDLC phase
2. Use `${CLAUDE_PLUGIN_ROOT}/templates/PROJECT.md` from the skill package, or merge into an existing `PROJECT.md` from `docs init`.
3. Write `PROJECT.md` to the project root. Keep **Project Edition → Mode: active** and the documentation directory unchanged unless the user asks to move files.
4. Offer to run `discover` if phase is discovery, or `route` if unclear.

## Output

Confirm the file path and summarize what was captured. List recommended next command.
