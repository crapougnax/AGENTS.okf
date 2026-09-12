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

const tagArg = process.argv[2];
const notesArg = process.argv[3];

if (!tagArg || !tagArg.match(/^v?\d+\.\d+\.\d+$/)) {
  console.log(`
Usage: bun run release.ts <vX.Y.Z> ["<release notes>"]

Example:
  bun run release.ts v1.2.0 "Release notes describing the new features."
`);
  process.exit(1);
}

const semverTag = tagArg.startsWith("v") ? tagArg : `v${tagArg}`;
const notes = notesArg ?? `Release ${semverTag}`;

console.log(`🔍 Checking Git working tree cleanliness...`);
const status = run("git", ["status", "--porcelain"]);
if (status.length > 0) {
  console.error("❌ Working directory is dirty. Please commit or stash changes before releasing.");
  process.exit(1);
}

console.log("📥 Checking out and updating 'main' branch...");
run("git", ["checkout", "main"]);
run("git", ["pull", "origin", "main"]);

// Guard: verify develop has no unmerged commits ahead of main
console.log("🔍 Verifying 'develop' has been fully merged into 'main'...");
run("git", ["fetch", "origin", "develop"]);
const aheadCount = run("git", ["rev-list", "--count", "main..origin/develop"]);
if (parseInt(aheadCount, 10) > 0) {
  console.error(`❌ 'develop' has ${aheadCount} commit(s) not yet merged into 'main'.`);
  console.error(`   Merge the release PR first, then re-run this script.`);
  process.exit(1);
}

console.log(`🏷️ Creating annotated tag: ${semverTag}...`);
run("git", ["tag", "-a", semverTag, "-m", `Release ${semverTag} - ${notes}`]);

console.log(`📤 Pushing tag to origin...`);
run("git", ["push", "origin", "main", "--tags"]);

console.log(`🚀 Publishing GitHub Release via gh CLI...`);
const releaseUrl = run("env", [
  "-u", "GH_TOKEN",
  "-u", "GITHUB_TOKEN",
  "gh", "release", "create",
  semverTag,
  "--title", semverTag,
  "--notes", notes,
]);

console.log(`\n🎉 Release published successfully: ${releaseUrl}`);
