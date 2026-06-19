#!/usr/bin/env node
/**
 * Prints PROJECT.md for the current working directory, or instructs init.
 * Run once per agent session before PM Butler work.
 *
 * Usage: node skills/pm-butler/scripts/context.mjs
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const cwd = process.cwd();
const projectMd = join(cwd, "PROJECT.md");

if (!existsSync(projectMd)) {
  console.log(`NO_PROJECT_MD

PROJECT.md not found in ${cwd}.

Run /pmbutler:pm-butler init (Claude Code) or ask the agent to follow reference/init.md.
Use templates/PROJECT.md from the PM Butler skill as the starting structure.`);
  process.exit(0);
}

const content = readFileSync(projectMd, "utf8");
console.log(`# PROJECT CONTEXT\n\n${content}\n\n---\nUse this context for all PM Butler commands this session.`);
