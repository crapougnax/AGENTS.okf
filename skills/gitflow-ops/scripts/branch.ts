#!/usr/bin/env bun
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

const args = process.argv.slice(2);
if (args.length < 3) {
  console.log(`
Usage: bun run branch.ts <type> <issue-number> <description>

Arguments:
  type          feat | fix | refactor | docs | chore | security
  issue-number  Numeric GitHub issue ID (e.g. 12)
  description   Slugified task description (e.g. user-auth)

Example:
  bun run branch.ts feat 12 user-auth
  -> Creates and checks out branch: feat/12-user-auth from develop
`);
  process.exit(1);
}

const [type, issueNum, desc] = args;
const allowedTypes = ["feat", "fix", "refactor", "docs", "chore", "security", "test", "perf"];
if (!allowedTypes.includes(type)) {
  console.error(`❌ Invalid type '${type}'. Allowed types: ${allowedTypes.join(", ")}`);
  process.exit(1);
}

const cleanDesc = desc
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const branchName = `${type}/${issueNum}-${cleanDesc}`;

console.log("🔍 Checking Git working tree cleanliness...");
const status = run("git", ["status", "--porcelain"]);
if (status.length > 0) {
  console.error("❌ Working directory is dirty. Please commit or stash changes before branching.");
  console.error(status);
  process.exit(1);
}

console.log("📥 Checking out and updating 'develop' branch...");
run("git", ["checkout", "develop"]);
run("git", ["pull", "origin", "develop"]);

console.log(`🚀 Creating dedicated branch: ${branchName}`);
run("git", ["checkout", "-b", branchName]);

console.log(`\n✅ Successfully switched to dedicated branch '${branchName}'!`);
console.log(`👉 Implement your solution, run unit tests, and create atomic conventional commits.`);
