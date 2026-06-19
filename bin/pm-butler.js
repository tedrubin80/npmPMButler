#!/usr/bin/env node

import { installSkill, checkInstall, TARGETS } from "../lib/install.mjs";

const [,, cmd, sub] = process.argv;
const flag = process.argv.find(a => a.startsWith("--"));

function usage() {
  console.log(`
pm-butler — install agent skills for Cursor and Claude Code

  npx pm-butler skills install [--cursor|--claude|--all]
  npx pm-butler skills update     (same as install)
  npx pm-butler skills check

Install paths:
  cursor ? ${TARGETS.cursor}
  claude ? ${TARGETS.claude}
`);
}

function runInstall() {
  const all = !flag || flag === "--all";
  const installed = [];

  if (all || flag === "--cursor") installed.push(installSkill("cursor"));
  if (all || flag === "--claude") installed.push(installSkill("claude"));

  console.log("\nInstalled PM Butler skill.");
  installed.forEach(p => console.log(`  ? ${p}`));
  console.log("\nNext: run init inside your agent (/pmbutler:pm-butler init or ask Cursor to run pm-butler init).");
}

if (cmd === "skills") {
  if (sub === "install" || sub === "update") runInstall();
  else if (sub === "check") {
    for (const row of checkInstall()) {
      console.log(`${row.installed ? "?" : "?"} ${row.name}: ${row.dest}`);
    }
  } else usage();
} else {
  usage();
}
