import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";

const TYPES = ["decisions", "concerns", "sessions", "notes"];

function slug(text) {
  return String(text || "entry")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function nowIso() {
  return new Date().toISOString();
}

function fileStamp(iso) {
  return iso.replace(/[:.]/g, "-");
}

export function initFolderStore(storePath) {
  mkdirSync(storePath, { recursive: true });
  for (const type of TYPES) mkdirSync(join(storePath, type), { recursive: true });

  const readme = join(storePath, "README.md");
  if (!existsSync(readme)) {
    writeFileSync(
      readme,
      `# PM Butler persistent memory (folder)

JSON entries by type. Safe to commit when git trackable is enabled.

- \`decisions/\` — structured decision records
- \`concerns/\` — Watch / Concern / Blocker events
- \`sessions/\` — session summaries and handoffs
- \`notes/\` — freeform memory

Also mirror important decisions into Project Edition \`DECISIONS.md\` when active.
`,
      "utf8"
    );
  }

  const metaPath = join(storePath, "meta.json");
  if (!existsSync(metaPath)) {
    writeFileSync(
      metaPath,
      JSON.stringify({ schemaVersion: 1, backend: "folder", createdAt: nowIso() }, null, 2),
      "utf8"
    );
  }
}

export function logFolderEntry(storePath, entry) {
  initFolderStore(storePath);

  const createdAt = entry.createdAt || nowIso();
  const id = entry.id || `${fileStamp(createdAt)}-${randomBytes(3).toString("hex")}`;
  const type = TYPES.includes(entry.type) ? entry.type : "notes";
  const filename = `${fileStamp(createdAt)}-${slug(entry.title || id)}.json`;
  const path = join(storePath, type, filename);

  const payload = {
    id,
    type,
    title: entry.title || "",
    body: entry.body || "",
    persona: entry.persona || null,
    severity: entry.severity || null,
    metadata: entry.metadata || {},
    createdAt,
    updatedAt: createdAt
  };

  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return { ...payload, path };
}

export function listFolderEntries(storePath, { type, limit = 20 } = {}) {
  if (!existsSync(storePath)) return [];

  const types = type ? [type.endsWith("s") ? type : `${type}s`] : TYPES;
  const rows = [];

  for (const t of types) {
    const dir = join(storePath, t);
    if (!existsSync(dir)) continue;

    for (const file of readdirSync(dir).filter(f => f.endsWith(".json"))) {
      try {
        const row = JSON.parse(readFileSync(join(dir, file), "utf8"));
        rows.push({ ...row, path: join(dir, file) });
      } catch {
        /* skip corrupt files */
      }
    }
  }

  return rows
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit);
}
