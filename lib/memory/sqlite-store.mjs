import { mkdirSync, existsSync } from "fs";
import { dirname } from "path";
import { randomBytes } from "crypto";

let DatabaseSync;

async function loadSqlite() {
  if (DatabaseSync) return DatabaseSync;
  try {
    ({ DatabaseSync } = await import("node:sqlite"));
    return DatabaseSync;
  } catch (err) {
    throw new Error(
      "SQLite backend requires Node.js 22+. Use backend folder, or upgrade Node."
    );
  }
}

function nowIso() {
  return new Date().toISOString();
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS memory_entries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT,
      body TEXT,
      persona TEXT,
      severity TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_memory_type_created ON memory_entries(type, created_at DESC);
    CREATE TABLE IF NOT EXISTS memory_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  db.prepare(
    "INSERT OR IGNORE INTO memory_meta(key, value) VALUES ('schemaVersion', '1')"
  ).run();
}

export async function initSqliteStore(dbPath) {
  const Database = await loadSqlite();
  mkdirSync(dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  initSchema(db);
  db.close();
}

export async function logSqliteEntry(dbPath, entry) {
  const Database = await loadSqlite();
  const db = new Database(dbPath);
  initSchema(db);

  const createdAt = entry.createdAt || nowIso();
  const id = entry.id || randomBytes(8).toString("hex");
  const type = entry.type || "note";
  const metadata = JSON.stringify(entry.metadata || {});

  db.prepare(
    `INSERT INTO memory_entries (id, type, title, body, persona, severity, metadata, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    type,
    entry.title || "",
    entry.body || "",
    entry.persona || null,
    entry.severity || null,
    metadata,
    createdAt,
    createdAt
  );

  db.close();
  return { id, type, title: entry.title || "", createdAt, dbPath };
}

export async function listSqliteEntries(dbPath, { type, limit = 20 } = {}) {
  if (!existsSync(dbPath)) return [];

  const Database = await loadSqlite();
  const db = new Database(dbPath);
  initSchema(db);

  const sql = type
    ? `SELECT id, type, title, body, persona, severity, metadata, created_at AS createdAt, updated_at AS updatedAt
       FROM memory_entries WHERE type = ? ORDER BY created_at DESC LIMIT ?`
    : `SELECT id, type, title, body, persona, severity, metadata, created_at AS createdAt, updated_at AS updatedAt
       FROM memory_entries ORDER BY created_at DESC LIMIT ?`;

  const rows = type
    ? db.prepare(sql).all(type, limit)
    : db.prepare(sql).all(limit);

  db.close();

  return rows.map(row => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : {}
  }));
}
