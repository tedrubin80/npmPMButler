import { writeFileSync, existsSync, readFileSync, appendFileSync } from "fs";
import { join } from "path";
import { loadMemoryConfig, saveMemoryConfig, upsertProjectMemorySection } from "./config.mjs";
import { initFolderStore, logFolderEntry, listFolderEntries } from "./folder-store.mjs";
import { initSqliteStore, logSqliteEntry, listSqliteEntries } from "./sqlite-store.mjs";

const GITIGNORE_BLOCK = `
# PM Butler persistent memory (sqlite — local only)
.pm-butler/sqlite/
.claude/pm-butler/sqlite/
`;

export async function initPersistentMemory(cwd, options = {}) {
  const current = loadMemoryConfig(cwd);
  const settings = {
    enabled: options.enabled ?? true,
    backend: options.backend ?? current.backend ?? "folder",
    path: options.path ?? current.path ?? ".pm-butler",
    gitTrackable: options.gitTrackable ?? current.gitTrackable ?? true
  };

  if (settings.backend !== "sqlite") settings.backend = "folder";

  upsertProjectMemorySection(cwd, settings);
  saveMemoryConfig({ ...current, cwd }, settings);
  const config = loadMemoryConfig(cwd);

  if (config.backend === "sqlite") {
    await initSqliteStore(config.dbPath);
  } else {
    initFolderStore(config.storePath);
  }

  maybeUpdateGitignore(cwd, config);

  return config;
}

export async function updateMemoryConfig(cwd, overrides) {
  const current = loadMemoryConfig(cwd);
  if (!existsSync(current.configPath) && !existsSync(current.projectPath)) {
    await initPersistentMemory(cwd, overrides);
    return loadMemoryConfig(cwd);
  }

  upsertProjectMemorySection(cwd, {
    enabled: overrides.enabled ?? current.enabled,
    backend: overrides.backend ?? current.backend,
    path: overrides.path ?? current.path,
    gitTrackable: overrides.gitTrackable ?? current.gitTrackable
  });

  saveMemoryConfig(current, overrides);
  const config = loadMemoryConfig(cwd);

  if (config.enabled) {
    if (config.backend === "sqlite") await initSqliteStore(config.dbPath);
    else initFolderStore(config.storePath);
  }

  maybeUpdateGitignore(cwd, config);
  return config;
}

export async function logMemoryEntry(cwd, entry) {
  const config = loadMemoryConfig(cwd);
  if (!config.enabled) {
    throw new Error("Persistent memory is disabled. Run: npx pm-butler memory init --enable");
  }

  const normalized = {
    ...entry,
    type: config.backend === "sqlite" ? normalizeType(entry.type) : normalizeFolderType(entry.type)
  };

  if (config.backend === "sqlite") {
    return logSqliteEntry(config.dbPath, normalized);
  }

  return logFolderEntry(config.storePath, normalized);
}

export async function listMemoryEntries(cwd, options = {}) {
  const config = loadMemoryConfig(cwd);
  if (!config.enabled) return [];

  const type = options.type ? normalizeType(options.type) : undefined;

  if (config.backend === "sqlite") {
    return listSqliteEntries(config.dbPath, { type, limit: options.limit ?? 20 });
  }

  return listFolderEntries(config.storePath, {
    type: type ? normalizeFolderType(type) : undefined,
    limit: options.limit ?? 20
  });
}

export function getMemoryStatus(cwd) {
  const config = loadMemoryConfig(cwd);
  return {
    ...config,
    projectExists: existsSync(config.projectPath),
    configExists: existsSync(config.configPath),
    storeReady:
      config.backend === "sqlite"
        ? existsSync(config.dbPath)
        : existsSync(join(config.storePath, "meta.json"))
  };
}

function normalizeType(type) {
  if (!type) return "note";
  const t = String(type).toLowerCase().replace(/s$/, "");
  if (t === "decision") return "decision";
  if (t === "concern") return "concern";
  if (t === "session") return "session";
  return "note";
}

function normalizeFolderType(type) {
  const t = normalizeType(type);
  return `${t}s`;
}

function maybeUpdateGitignore(cwd, config) {
  if (config.gitTrackable && config.backend === "folder") return;

  const gitignorePath = join(cwd, ".gitignore");
  if (!existsSync(gitignorePath)) {
    if (config.backend === "sqlite") {
      writeFileSync(gitignorePath, `${GITIGNORE_BLOCK.trim()}\n`, "utf8");
    }
    return;
  }

  const content = readFileSync(gitignorePath, "utf8");
  if (content.includes(".pm-butler/sqlite/")) return;

  if (config.backend === "sqlite" && !config.gitTrackable) {
    appendFileSync(gitignorePath, GITIGNORE_BLOCK, "utf8");
  }
}

export { loadMemoryConfig } from "./config.mjs";
