import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

export const PROJECT_FILE = "PROJECT.md";

export const PROJECT_EDITION_FILES = [
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

/** Parse Project Edition doc directory from PROJECT.md (default: repo root). */
export function parseDocDir(projectContent) {
  const match = projectContent.match(/\*\*Documentation directory:\*\*\s*([^\n]+)/i);
  if (!match) return ".";

  const value = match[1].trim().replace(/^`|`$/g, "");
  if (!value || value === ".") return ".";
  return value;
}

export function resolveDocDir(cwd, projectContent) {
  const relative = parseDocDir(projectContent);
  return relative === "." ? cwd : resolve(cwd, relative);
}

export function readProjectFile(cwd) {
  const path = join(cwd, PROJECT_FILE);
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8");
}

export function projectEditionStatus(cwd) {
  const projectContent = readProjectFile(cwd);
  if (!projectContent) {
    return { hasProject: false, docDir: cwd, files: [] };
  }

  const docDir = resolveDocDir(cwd, projectContent);
  const files = PROJECT_EDITION_FILES.map(name => {
    const path = join(docDir, name);
    return { name, path, exists: existsSync(path) };
  });

  return {
    hasProject: true,
    docDir,
    projectPath: join(cwd, PROJECT_FILE),
    files
  };
}
