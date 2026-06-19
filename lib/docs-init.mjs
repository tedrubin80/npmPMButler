import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { PROJECT_FILE, PROJECT_EDITION_FILES } from "./doc-paths.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(__dirname, "..");
const TEMPLATES_ROOT = join(PACKAGE_ROOT, "templates");
const PROJECT_TEMPLATE = join(TEMPLATES_ROOT, "PROJECT.md");
const EDITION_TEMPLATES = join(TEMPLATES_ROOT, "project-edition");

function today() {
  return new Date().toISOString().slice(0, 10);
}

function writeIfAllowed(path, content, force) {
  if (existsSync(path) && !force) {
    return { path, action: "skipped" };
  }
  const action = existsSync(path) ? "updated" : "created";
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
  return { path, action };
}

function loadTemplate(name) {
  const path = join(EDITION_TEMPLATES, name);
  if (!existsSync(path)) throw new Error(`Missing template: ${path}`);
  return readFileSync(path, "utf8").replaceAll("{{TODAY}}", today());
}

function buildProjectTemplate(docDir) {
  let content = readFileSync(PROJECT_TEMPLATE, "utf8");
  content = content.replace("{{DOC_DIR}}", docDir === "." ? "." : docDir);
  content = content.replaceAll("{{TODAY}}", today());
  return content;
}

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {string} [options.dir] - relative path for Project Edition markdown files
 * @param {boolean} [options.force]
 */
export function initProjectDocs({ cwd, dir = ".", force = false }) {
  const docDirRelative = dir === "." ? "." : dir.replace(/^\.\//, "");
  const docDirAbsolute = docDirRelative === "." ? cwd : join(cwd, docDirRelative);

  const results = [];

  const projectPath = join(cwd, PROJECT_FILE);
  results.push(
    writeIfAllowed(projectPath, buildProjectTemplate(docDirRelative), force)
  );

  mkdirSync(docDirAbsolute, { recursive: true });

  for (const name of PROJECT_EDITION_FILES) {
    const dest = join(docDirAbsolute, name);
    let content = loadTemplate(name);

    if (name === "INDEX.md") {
      content = content.replace("{{DOC_DIR}}", docDirRelative === "." ? "repo root" : docDirRelative);
    }

    results.push(writeIfAllowed(dest, content, force));
  }

  return {
    cwd,
    docDir: docDirAbsolute,
    docDirRelative,
    results
  };
}

export function copyTemplatesTo(destRoot, force = false) {
  mkdirSync(destRoot, { recursive: true });
  cpSync(TEMPLATES_ROOT, destRoot, { recursive: true, force });
}
