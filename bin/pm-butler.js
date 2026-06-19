#!/usr/bin/env node

import { initProjectDocs } from "../lib/docs-init.mjs";
import { installSkill, checkInstall, TARGETS } from "../lib/install.mjs";
import { projectEditionStatus } from "../lib/doc-paths.mjs";
import { printMemoryUsage, runMemoryCommand } from "../lib/memory-cli.mjs";

const args = process.argv.slice(2);
const cmd = args[0];
const sub = args[1];

function flagValue(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function hasFlag(name) {
  return args.includes(name);
}

function usage() {
  console.log(`
pm-butler — agent skills, Project Edition docs, and persistent memory

Skills:
  npx pm-butler skills install [--cursor|--claude|--all]
  npx pm-butler skills update
  npx pm-butler skills check

Project Edition docs:
  npx pm-butler docs init [--dir docs/pm] [--force]
  npx pm-butler docs check

Persistent memory:
  npx pm-butler memory init [--enable] [--backend folder|sqlite] [--path .pm-butler]
  npx pm-butler memory status | config | log | list

Install paths:
  cursor ? ${TARGETS.cursor}
  claude ? ${TARGETS.claude}
`);
}

function runInstall() {
  const flag = args.find(a => a.startsWith("--"));
  const all = !flag || flag === "--all";
  const installed = [];

  if (all || flag === "--cursor") installed.push(installSkill("cursor"));
  if (all || flag === "--claude") installed.push(installSkill("claude"));

  console.log("\nInstalled PM Butler skill.");
  installed.forEach(p => console.log(`  ? ${p}`));
  console.log("\nNext:");
  console.log("  npx pm-butler docs init");
  console.log("  npx pm-butler memory init --enable --path .claude/pm-butler");
}

function runDocsInit() {
  const dir = flagValue("--dir") || ".";
  const force = hasFlag("--force");
  const cwd = process.cwd();

  const { docDirRelative, results } = initProjectDocs({ cwd, dir, force });

  console.log("\nPM Butler Project Edition scaffold");
  console.log(`  Project root:  ${cwd}`);
  console.log(`  Doc directory: ${docDirRelative === "." ? "(repo root)" : docDirRelative}`);

  const created = results.filter(r => r.action === "created").length;
  const updated = results.filter(r => r.action === "updated").length;
  const skipped = results.filter(r => r.action === "skipped").length;

  for (const row of results) {
    const label = row.action === "skipped" ? "skip" : row.action === "updated" ? "update" : "create";
    console.log(`  [${label}] ${row.path}`);
  }

  console.log(`\nSummary: ${created} created, ${updated} updated, ${skipped} skipped.`);
  console.log("\nOptional: npx pm-butler memory init --enable --path .claude/pm-butler");
}

function runDocsCheck() {
  const status = projectEditionStatus(process.cwd());

  if (!status.hasProject) {
    console.log("? PROJECT.md not found in this directory.");
    console.log("  Run: npx pm-butler docs init");
    process.exitCode = 1;
    return;
  }

  console.log(`? PROJECT.md  ${status.projectPath}`);
  console.log(`  Doc directory: ${status.docDir}`);

  for (const file of status.files) {
    console.log(`${file.exists ? "?" : "?"} ${file.name}`);
  }

  const missing = status.files.filter(f => !f.exists).length;
  if (missing) {
    console.log(`\n${missing} Project Edition file(s) missing. Run: npx pm-butler docs init`);
    process.exitCode = 1;
  }
}

async function main() {
  if (cmd === "skills") {
    if (sub === "install" || sub === "update") runInstall();
    else if (sub === "check") {
      for (const row of checkInstall()) {
        console.log(`${row.installed ? "?" : "?"} ${row.name}: ${row.dest}`);
      }
    } else usage();
    return;
  }

  if (cmd === "docs") {
    if (sub === "init") runDocsInit();
    else if (sub === "check") runDocsCheck();
    else usage();
    return;
  }

  if (cmd === "memory") {
    if (!sub) printMemoryUsage();
    else await runMemoryCommand(sub, args.slice(2));
    return;
  }

  usage();
}

main().catch(err => {
  console.error(err.message || err);
  process.exitCode = 1;
});
