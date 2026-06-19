import { cpSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(__dirname, "..");
const SKILL_SRC = join(PACKAGE_ROOT, "skills", "pm-butler");

export const TARGETS = {
  cursor: join(homedir(), ".cursor", "skills", "pm-butler"),
  claude: join(homedir(), ".claude", "skills", "pm-butler")
};

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    if (statSync(s).isDirectory()) copyDir(s, d);
    else cpSync(s, d);
  }
}

export function installSkill(harness) {
  const dest = TARGETS[harness];
  if (!dest) throw new Error(`Unknown harness: ${harness}`);
  if (!existsSync(SKILL_SRC)) throw new Error(`Skill source missing: ${SKILL_SRC}`);
  copyDir(SKILL_SRC, dest);
  return dest;
}

export function checkInstall() {
  return Object.entries(TARGETS).map(([name, dest]) => ({
    name,
    dest,
    installed: existsSync(join(dest, "SKILL.md"))
  }));
}
