#!/usr/bin/env node
/**
 * Prints PROJECT.md and Project Edition doc paths for the current working directory.
 * Run once per agent session before PM Butler work.
 *
 * Usage: node skills/pm-butler/scripts/context.mjs
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Inline minimal path helpers so the skill works without npm lib at runtime.
function parseDocDir(projectContent) {
  const match = projectContent.match(/\*\*Documentation directory:\*\*\s*([^\n]+)/i);
  if (!match) return ".";
  const value = match[1].trim().replace(/^`|`$/g, "");
  if (!value || value === ".") return ".";
  return value;
}

function resolveDocDir(cwd, projectContent) {
  const relative = parseDocDir(projectContent);
  return relative === "." ? cwd : join(cwd, relative);
}

const PROJECT_EDITION_FILES = [
  "INDEX.md",
  "DECISIONS.md",
  "SCOPE.md",
  "REQUIREMENTS.md",
  "ARCHITECTURE.md",
  "CHANGELOG.md",
  "PROMPTS.md",
  "RISKS.md",
  "CONCERNS.md",
  "STATUS.md",
  "LESSONS.md"
];

function parseMemorySettings(projectContent) {
  const section = projectContent.match(/## Persistent memory\s*\n([\s\S]*?)(?=\n## |\n*$)/i);
  if (!section) return { enabled: false, backend: "folder", path: ".pm-butler" };

  const block = section[1];
  const pick = key => {
    const m = block.match(new RegExp(`\\*\\*${key}:\\*\\*\\s*([^\\n]+)`, "i"));
    return m ? m[1].trim().replace(/^`|`$/g, "") : undefined;
  };

  const enabled = (pick("Enabled") || "false").toLowerCase() === "true";
  return {
    enabled,
    backend: (pick("Backend") || "folder").toLowerCase(),
    path: pick("Path") || ".pm-butler"
  };
}

const cwd = process.cwd();
const projectMd = join(cwd, "PROJECT.md");

if (!existsSync(projectMd)) {
  console.log(`NO_PROJECT_MD

PROJECT.md not found in ${cwd}.

Run: npx pm-butler docs init
Or follow reference/init.md inside your agent session.`);
  process.exit(0);
}

const content = readFileSync(projectMd, "utf8");
const docDir = resolveDocDir(cwd, content);
const missing = PROJECT_EDITION_FILES.filter(name => !existsSync(join(docDir, name)));

let docSection = `Documentation directory: ${docDir === cwd ? "(repo root)" : docDir}\n`;

if (missing.length) {
  docSection += `\nMissing Project Edition files (${missing.length}): ${missing.join(", ")}\n`;
  docSection += `Run: npx pm-butler docs init${docDir !== cwd ? ` --dir ${parseDocDir(content)}` : ""}\n`;
} else {
  docSection += "\nProject Edition files: all present.\n";
  docSection += "Update DECISIONS.md (Oracle), SCOPE.md (Sculptor), ARCHITECTURE.md (Architect), etc. on every PM interaction.\n";
}

const memory = parseMemorySettings(content);
let memorySection = `\nPersistent memory: ${memory.enabled ? "enabled" : "disabled"}`;
if (memory.enabled) {
  const memoryRoot = memory.path === "." ? cwd : join(cwd, memory.path);
  const store =
    memory.backend === "sqlite"
      ? join(memoryRoot, "sqlite", "pm-butler.db")
      : join(memoryRoot, "memory");
  memorySection += ` (${memory.backend} at ${store})\n`;
  memorySection += "Log entries: npx pm-butler memory log --type decision --title \"...\" --body \"...\"\n";
} else {
  memorySection += "\nEnable: npx pm-butler memory init --enable --path .claude/pm-butler\n";
}

console.log(`# PROJECT CONTEXT

${content}

---
${docSection}${memorySection}
Use this context for all PM Butler commands this session.`);
