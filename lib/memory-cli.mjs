import {
  initPersistentMemory,
  updateMemoryConfig,
  logMemoryEntry,
  listMemoryEntries,
  getMemoryStatus
} from "./memory/index.mjs";

function flagValue(args, name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function hasFlag(args, name) {
  return args.includes(name);
}

export function printMemoryUsage() {
  console.log(`
Persistent memory — structured decision/session storage

  npx pm-butler memory init [--enable] [--backend folder|sqlite] [--path .pm-butler|.claude/pm-butler] [--no-git]
  npx pm-butler memory status
  npx pm-butler memory config [--enable|--disable] [--backend folder|sqlite] [--path PATH] [--git|--no-git]
  npx pm-butler memory log --type decision|concern|session|note --title "..." [--body "..."] [--persona Oracle] [--severity concern]
  npx pm-butler memory list [--type decision] [--limit 10]

Backends:
  folder  JSON files under <path>/memory/ (git-friendly default)
  sqlite  Database at <path>/sqlite/pm-butler.db (Node 22+)
`);
}

export async function runMemoryCommand(sub, args) {
  const cwd = process.cwd();

  if (sub === "init") {
    const config = await initPersistentMemory(cwd, {
      enabled: hasFlag(args, "--enable") || !hasFlag(args, "--disable"),
      backend: flagValue(args, "--backend") || "folder",
      path: flagValue(args, "--path") || ".pm-butler",
      gitTrackable: !hasFlag(args, "--no-git")
    });

    console.log("\nPM Butler persistent memory initialized");
    console.log(`  Enabled:       ${config.enabled}`);
    console.log(`  Backend:       ${config.backend}`);
    console.log(`  Path:          ${config.path}`);
    console.log(`  Root:          ${config.memoryRoot}`);
    console.log(`  Store:         ${config.backend === "sqlite" ? config.dbPath : config.storePath}`);
    console.log(`  Git trackable: ${config.gitTrackable}`);
    console.log("\nUpdated PROJECT.md and config.json");
    return;
  }

  if (sub === "status") {
    const status = getMemoryStatus(cwd);
    console.log("\nPM Butler persistent memory");
    console.log(`  Enabled:       ${status.enabled}`);
    console.log(`  Backend:       ${status.backend}`);
    console.log(`  Path:          ${status.path}`);
    console.log(`  Root:          ${status.memoryRoot}`);
    console.log(`  Store ready:   ${status.storeReady ? "yes" : "no"}`);
    console.log(`  Git trackable: ${status.gitTrackable}`);
    if (!status.enabled) console.log("\n  Run: npx pm-butler memory init --enable");
    return;
  }

  if (sub === "config") {
    const overrides = {};
    if (hasFlag(args, "--enable")) overrides.enabled = true;
    if (hasFlag(args, "--disable")) overrides.enabled = false;
    if (hasFlag(args, "--git")) overrides.gitTrackable = true;
    if (hasFlag(args, "--no-git")) overrides.gitTrackable = false;
    if (flagValue(args, "--backend")) overrides.backend = flagValue(args, "--backend");
    if (flagValue(args, "--path")) overrides.path = flagValue(args, "--path");

    const config = await updateMemoryConfig(cwd, overrides);
    console.log("\nUpdated persistent memory settings");
    console.log(JSON.stringify({
      enabled: config.enabled,
      backend: config.backend,
      path: config.path,
      gitTrackable: config.gitTrackable
    }, null, 2));
    return;
  }

  if (sub === "log") {
    const type = flagValue(args, "--type") || "note";
    const title = flagValue(args, "--title");
    const body = flagValue(args, "--body") || "";
    const persona = flagValue(args, "--persona");
    const severity = flagValue(args, "--severity");

    if (!title) {
      console.error("Missing --title");
      process.exitCode = 1;
      return;
    }

    const row = await logMemoryEntry(cwd, { type, title, body, persona, severity });
    console.log(JSON.stringify(row, null, 2));
    return;
  }

  if (sub === "list") {
    const rows = await listMemoryEntries(cwd, {
      type: flagValue(args, "--type"),
      limit: Number(flagValue(args, "--limit") || 10)
    });

    if (!rows.length) {
      console.log("No memory entries yet.");
      return;
    }

    for (const row of rows) {
      console.log(`- [${row.type}] ${row.createdAt} ${row.title || row.id}`);
      if (row.body) console.log(`  ${row.body.split("\n")[0]}`);
    }
    return;
  }

  printMemoryUsage();
}
