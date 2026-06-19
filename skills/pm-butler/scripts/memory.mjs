#!/usr/bin/env node
/**
 * Agent-facing memory helper. Delegates to the pm-butler CLI when available.
 *
 * Usage:
 *   node memory.mjs status
 *   node memory.mjs log decision "Title" "Body"
 *   node memory.mjs list decision 10
 */

import { spawnSync } from "child_process";

const [,, action, ...rest] = process.argv;

function runPmButler(args) {
  const result = spawnSync("pm-butler", ["memory", ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (result.status === 0) {
    process.stdout.write(result.stdout);
    return;
  }

  const npx = spawnSync("npx", ["--yes", "pm-butler", "memory", ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (npx.status === 0) {
    process.stdout.write(npx.stdout);
    return;
  }

  console.error(npx.stderr || result.stderr || "Could not run pm-butler memory CLI.");
  process.exit(npx.status || result.status || 1);
}

if (action === "status") {
  runPmButler(["status"]);
} else if (action === "log") {
  const [type, title, ...bodyParts] = rest;
  if (!type || !title) {
    console.error("Usage: memory.mjs log <decision|concern|session|note> <title> [body]");
    process.exit(1);
  }
  runPmButler(["log", "--type", type, "--title", title, "--body", bodyParts.join(" ") || ""]);
} else if (action === "list") {
  const [type, limit] = rest;
  const args = ["list"];
  if (type) args.push("--type", type);
  if (limit) args.push("--limit", limit);
  runPmButler(args);
} else {
  console.log(`PM Butler memory helper

  node memory.mjs status
  node memory.mjs log decision "Use folder backend" "Git-trackable JSON files"
  node memory.mjs list decision 10

Prefer: npx pm-butler memory init --enable --path .claude/pm-butler
`);
}
