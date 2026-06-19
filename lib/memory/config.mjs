import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join, resolve, isAbsolute } from "path";

export const PROJECT_FILE = "PROJECT.md";
export const DEFAULT_MEMORY_PATH = ".pm-butler";
export const DEFAULT_FOLDER_SUBDIR = "memory";
export const DEFAULT_SQLITE_SUBDIR = "sqlite";
export const DEFAULT_DB_NAME = "pm-butler.db";
export const CONFIG_FILENAME = "config.json";
export const SCHEMA_VERSION = 1;

const MEMORY_SECTION = /## Persistent memory\s*\n([\s\S]*?)(?=\n## |\n*$)/i;

function parseBool(value, fallback = false) {
  if (value == null || value === "") return fallback;
  const v = String(value).trim().toLowerCase();
  if (["true", "yes", "on", "1"].includes(v)) return true;
  if (["false", "no", "off", "0"].includes(v)) return false;
  return fallback;
}

function parseProjectMemory(projectContent) {
  const section = projectContent.match(MEMORY_SECTION);
  if (!section) {
    return {
      enabled: false,
      backend: "folder",
      path: DEFAULT_MEMORY_PATH,
      gitTrackable: true
    };
  }

  const block = section[1];
  const pick = key => {
    const m = block.match(new RegExp(`\\*\\*${key}:\\*\\*\\s*([^\\n]+)`, "i"));
    return m ? m[1].trim().replace(/^`|`$/g, "") : undefined;
  };

  const backendRaw = (pick("Backend") || "folder").toLowerCase();
  const backend = backendRaw === "sqlite" ? "sqlite" : "folder";

  return {
    enabled: parseBool(pick("Enabled"), false),
    backend,
    path: pick("Path") || DEFAULT_MEMORY_PATH,
    gitTrackable: parseBool(pick("Git trackable"), true)
  };
}

export function resolveMemoryRoot(cwd, relativePath) {
  if (isAbsolute(relativePath)) return relativePath;
  return resolve(cwd, relativePath);
}

export function loadMemoryConfig(cwd = process.cwd()) {
  const projectPath = join(cwd, PROJECT_FILE);
  let fromProject = {
    enabled: false,
    backend: "folder",
    path: DEFAULT_MEMORY_PATH,
    gitTrackable: true
  };

  if (existsSync(projectPath)) {
    fromProject = parseProjectMemory(readFileSync(projectPath, "utf8"));
  }

  const root = resolveMemoryRoot(cwd, fromProject.path);
  const configPath = join(root, CONFIG_FILENAME);
  let fromFile = {};

  if (existsSync(configPath)) {
    try {
      fromFile = JSON.parse(readFileSync(configPath, "utf8")).persistentMemory || {};
    } catch {
      fromFile = {};
    }
  }

  const merged = {
    enabled: fromFile.enabled ?? fromProject.enabled,
    backend: fromFile.backend ?? fromProject.backend,
    path: fromFile.path ?? fromProject.path,
    gitTrackable: fromFile.gitTrackable ?? fromProject.gitTrackable
  };

  if (merged.backend !== "sqlite") merged.backend = "folder";

  const memoryRoot = resolveMemoryRoot(cwd, merged.path);

  return {
    cwd,
    projectPath,
    configPath,
    memoryRoot,
    storePath:
      merged.backend === "sqlite"
        ? join(memoryRoot, DEFAULT_SQLITE_SUBDIR)
        : join(memoryRoot, DEFAULT_FOLDER_SUBDIR),
    dbPath: join(memoryRoot, DEFAULT_SQLITE_SUBDIR, DEFAULT_DB_NAME),
    ...merged
  };
}

export function saveMemoryConfig(config, overrides = {}) {
  const next = {
    enabled: overrides.enabled ?? config.enabled,
    backend: overrides.backend ?? config.backend,
    path: overrides.path ?? config.path,
    gitTrackable: overrides.gitTrackable ?? config.gitTrackable
  };

  if (next.backend !== "sqlite") next.backend = "folder";

  const memoryRoot = resolveMemoryRoot(config.cwd, next.path);
  const configPath = join(memoryRoot, CONFIG_FILENAME);

  mkdirSync(memoryRoot, { recursive: true });
  writeFileSync(
    configPath,
    `${JSON.stringify({ schemaVersion: SCHEMA_VERSION, persistentMemory: next }, null, 2)}\n`,
    "utf8"
  );

  return loadMemoryConfig(config.cwd);
}

export function renderProjectMemorySection(settings) {
  return `## Persistent memory

- **Enabled:** ${settings.enabled ? "true" : "false"}
- **Backend:** ${settings.backend}
- **Path:** ${settings.path}
- **Git trackable:** ${settings.gitTrackable ? "true" : "false"}

Structured memory for decisions, concerns, and session notes. Folder backend uses JSON files (git-friendly). SQLite backend uses \`${DEFAULT_SQLITE_SUBDIR}/${DEFAULT_DB_NAME}\` under the path above.

CLI: \`npx pm-butler memory init\`, \`memory status\`, \`memory log\`, \`memory list\`, \`memory config\`.
`;
}

export function upsertProjectMemorySection(cwd, settings) {
  const projectPath = join(cwd, PROJECT_FILE);
  const section = renderProjectMemorySection(settings);

  if (!existsSync(projectPath)) {
    writeFileSync(projectPath, `# PROJECT.md\n\n${section}\n`, "utf8");
    return projectPath;
  }

  let content = readFileSync(projectPath, "utf8");
  if (MEMORY_SECTION.test(content)) {
    content = content.replace(MEMORY_SECTION, section.trimEnd());
  } else {
    content = `${content.trimEnd()}\n\n${section}`;
  }

  writeFileSync(projectPath, content.endsWith("\n") ? content : `${content}\n`, "utf8");
  return projectPath;
}
