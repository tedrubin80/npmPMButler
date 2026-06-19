# PM Butler

Eight AI project management personas for Claude Code, Cursor, and Copilot-class harnesses. PM Butler routes work across your entire SDLC — discovery through handoff — using specialized personas that produce structured output you can use as real project documentation.

## Personas

| Persona | Phase |
|---------|-------|
| **Head Butler** | Routing, init, handoff |
| **Oracle** | Discovery & research |
| **Sculptor** | Scope & requirements |
| **Architect** | Design & planning |
| **Alchemist** | Sprint & development |
| **Gatekeeper** | Review & QA |
| **Shipper** | Launch & deployment |
| **Librarian** | Documentation |

## Install

```bash
npm install github:tedrubin80/npmPMButler
```

Or run without installing:

```bash
npx github:tedrubin80/npmPMButler skills install
```

### Install skills to your agent

```bash
npx github:tedrubin80/npmPMButler skills install --all     # Claude Code + Cursor
npx github:tedrubin80/npmPMButler skills install --claude  # Claude Code only
npx github:tedrubin80/npmPMButler skills install --cursor  # Cursor only
npx github:tedrubin80/npmPMButler skills check             # Verify install
```

Installs to:
- `~/.claude/skills/pm-butler/` (Claude Code)
- `~/.cursor/skills/pm-butler/` (Cursor)

## Usage

Once installed, invoke inside your agent:

```
/pm-butler init        # Start a new project, creates PROJECT.md
/pm-butler route       # Let Head Butler route your request
/pm-butler discover    # Oracle — research & discovery
/pm-butler scope       # Sculptor — requirements & scope
/pm-butler design      # Architect — technical design
/pm-butler sprint      # Alchemist — sprint planning
/pm-butler review      # Gatekeeper — QA & review
/pm-butler launch      # Shipper — deployment
/pm-butler document    # Librarian — documentation
/pm-butler concerns    # Flag issues across all personas
/pm-butler handoff     # Hand off between phases
/pm-butler crisis      # All hands — crisis mode
```

## Concern Severity

- **Watch** — noted, not blocking
- **Concern** — must address before proceeding
- **Blocker** — phase cannot close until resolved

## Handoff Chain

```
Oracle → Sculptor → Architect → Alchemist → Gatekeeper → Shipper → Librarian → Oracle
```

## Requirements

- Node.js 18+
- Claude Code, Cursor, or any Copilot-class harness

## License

MIT — © Ted Rubin. Free to use and build on with attribution.
