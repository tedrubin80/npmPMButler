# /pm-butler route

Head Butler routes the user's request to the correct persona.

## Flow

1. Read `PROJECT.md` current phase if present.
2. Match user intent to persona:

| Signal | Persona | Next command |
|--------|---------|--------------|
| idea, problem, validate, research | Oracle | discover |
| requirements, stories, scope, AC | Sculptor | scope |
| architecture, design, edge cases | Architect | design |
| sprint, capacity, backlog | Alchemist | sprint |
| test, QA, regression | Gatekeeper | review |
| deploy, launch, release | Shipper | launch |
| docs, retro, lessons | Librarian | document |
| production down, incident | All | crisis |

3. Announce routing in one line: "Routing to [Persona] for [reason]."
4. Read that persona's section in `content/ensemble.md` and proceed.

If two personas apply, name both and ask which to lead (or run a handoff).
