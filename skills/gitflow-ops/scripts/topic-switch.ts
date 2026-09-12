#!/usr/bin/env bun
/**
 * topic-switch.ts — Safely pause the current task, stash uncommitted work,
 * and switch to a clean develop base for a new topic branch.
 *
 * Usage:
 *   bun run topic-switch.ts "<brief-task-description>"
 *
 * Example:
 *   bun run topic-switch.ts "fix payment webhook validation"
 *   -> Stashes WIP under 'wip/<branch>-<timestamp>', checks out develop, pulls latest.
 */
import { spawnSync } from "node:child_process";

function run(cmd: string, args: string[], exitOnError = true): string {
  const res = spawnSync(cmd, args, { encoding: "utf-8", shell: false });
  if (res.status !== 0 && exitOnError) {
    console.error(`❌ Command failed: ${cmd} ${args.join(" ")}`);
    if (res.stderr) console.error(res.stderr.trim());
    process.exit(res.status ?? 1);
  }
  return (res.stdout ?? "").trim();
}

const taskDesc = process.argv[2];
if (!taskDesc) {
  console.log(`
Usage: bun run topic-switch.ts "<brief-description-of-current-task>"

This script safely parks your current work-in-progress before switching to a new topic:
  1. Creates a named WIP stash of any uncommitted changes.
  2. Pushes the current feature branch to origin (if any commits exist).
  3. Checks out and pulls the latest 'develop' branch.
  4. Prints a summary with the stash name for later resumption.

Example:
  bun run topic-switch.ts "add invoice PDF export"
`);
  process.exit(1);
}

const currentBranch = run("git", ["branch", "--show-current"]);
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
const stashLabel = `wip/${currentBranch}-${timestamp}`;

// 1. Check for uncommitted changes
const dirtyStatus = run("git", ["status", "--porcelain"]);
let stashCreated = false;

if (dirtyStatus.length > 0) {
  console.log(`📦 Stashing uncommitted work on '${currentBranch}' as: "${stashLabel}"...`);
  run("git", ["stash", "push", "-u", "-m", stashLabel]);
  stashCreated = true;
  console.log(`✅ WIP stashed successfully.`);
} else {
  console.log(`ℹ️ Working directory is clean — no stash needed.`);
}

// 2. Push the current branch if it has unpushed commits (non-blocking)
if (currentBranch !== "develop" && currentBranch !== "main") {
  const unpushed = run("git", ["log", `origin/${currentBranch}..HEAD`, "--oneline"], false);
  if (unpushed.length > 0) {
    console.log(`📤 Pushing branch '${currentBranch}' to origin to preserve remote state...`);
    run("git", ["push", "-u", "origin", currentBranch], false);
  }
}

// 3. Switch to develop and pull
console.log(`\n🔄 Switching to 'develop' and pulling latest commits...`);
run("git", ["checkout", "develop"]);
run("git", ["pull", "origin", "develop"]);

// 4. Summary
console.log(`
✅ Topic switch complete.

━━━ Paused Task Summary ━━━━━━━━━━━━━━━━━━━━━━
  Branch  : ${currentBranch}
  Task    : ${taskDesc}
  Stash   : ${stashCreated ? `"${stashLabel}"` : "None (working tree was clean)"}

  To resume this task later:
    git checkout ${currentBranch}
    ${stashCreated ? `git stash pop  # or: git stash list | grep "${stashLabel}"` : ""}

━━━ Ready for New Topic ━━━━━━━━━━━━━━━━━━━━━━
  Now on: develop (latest)
  Next: bun run branch.ts <type> <issue-number> <description>
`);
