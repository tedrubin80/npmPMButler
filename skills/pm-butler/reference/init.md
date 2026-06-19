# /pm-butler init

Create or refresh `PROJECT.md` at the repository root.

## Flow

1. Interview the user briefly (or infer from the codebase):
   - Project name and one-liner
   - Who uses it and in what context
   - Stack (frontend, backend, infra)
   - Team size and decision makers
   - Timeline and non-negotiable constraints
   - Current SDLC phase
2. Copy structure from `${CLAUDE_PLUGIN_ROOT}/templates/PROJECT.md` (or the skill's `templates/PROJECT.md`).
3. Write `PROJECT.md` to the project root.
4. Offer to run `discover` if phase is discovery, or `route` if unclear.

## Output

Confirm the file path and summarize what was captured. List recommended next command.
