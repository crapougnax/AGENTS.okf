#!/usr/bin/env bun
import { spawnSync, spawn } from "node:child_process";

function run(cmd: string, args: string[], exitOnError = true): string {
  const res = spawnSync(cmd, args, { encoding: "utf-8", shell: false });
  if (res.status !== 0 && exitOnError) {
    console.error(`❌ Command failed: ${cmd} ${args.join(" ")}`);
    if (res.stderr) console.error(res.stderr.trim());
    process.exit(res.status ?? 1);
  }
  return (res.stdout ?? "").trim();
}

const currentBranch = run("git", ["branch", "--show-current"]);
if (currentBranch === "develop" || currentBranch === "main") {
  console.error(`❌ Cannot open a feature PR directly from '${currentBranch}'. Please create a dedicated branch first.`);
  process.exit(1);
}

const titleArg = process.argv[2];
const bodyArg = process.argv[3];

if (!titleArg) {
  console.log(`
Usage: bun run pr.ts "<title>" ["<body>"]

Example:
  bun run pr.ts "feat(auth): add session validation" "Implements fail-fast session token checks."
`);
  process.exit(1);
}

// Extract issue number from branch name (e.g. feat/12-user-auth -> 12)
const issueMatch = currentBranch.match(/^(?:feat|fix|refactor|docs|chore|security)\/(\d+)-/);
const issueNum = issueMatch ? issueMatch[1] : null;

let finalTitle = titleArg;
if (issueNum && !finalTitle.includes(`#${issueNum}`)) {
  finalTitle = `${finalTitle} (#${issueNum})`;
}

let finalBody = bodyArg ?? `## Summary\nImplementation on branch \`${currentBranch}\`.\n\n### Changes\n- Atomic commits verified with local tests.\n`;
if (issueNum && !finalBody.includes(`Closes #${issueNum}`) && !finalBody.includes(`Resolves #${issueNum}`)) {
  finalBody += `\nCloses #${issueNum}\n`;
}

console.log(`📤 Pushing branch '${currentBranch}' to origin...`);
run("git", ["push", "-u", "origin", currentBranch]);

console.log("🔍 Checking active milestones...");
const milestonesRaw = run("env", ["-u", "GH_TOKEN", "-u", "GITHUB_TOKEN", "gh", "api", "repos/:owner/:repo/milestones", "--jq", ".[0].title"], false);
const activeMilestone = milestonesRaw ? milestonesRaw.trim() : "";

const prArgs = [
  "-u", "GH_TOKEN",
  "-u", "GITHUB_TOKEN",
  "gh", "pr", "create",
  "--base", "develop",
  "--head", currentBranch,
  "--assignee", "@me",
  "--title", finalTitle,
  "--body", finalBody,
];

if (activeMilestone) {
  prArgs.push("--milestone", activeMilestone);
}

console.log(`🚀 Creating Pull Request targeting 'develop'...`);
const prUrl = run("env", prArgs);
console.log(`✅ Pull Request created: ${prUrl}`);

// Immediately monitor triggered CI run
console.log("\n🔄 Querying triggered GitHub Actions CI run...");
spawnSync("sleep", ["2"], { shell: false });

const runId = run("env", ["-u", "GH_TOKEN", "-u", "GITHUB_TOKEN", "gh", "run", "list", "--limit", "1", "--json", "databaseId", "--jq", ".[0].databaseId"], false);

if (runId) {
  console.log(`👀 Watching GitHub Actions CI run #${runId} until completion...\n`);
  const watchProc = spawn("env", ["-u", "GH_TOKEN", "-u", "GITHUB_TOKEN", "gh", "run", "watch", runId], {
    shell: false,
    stdio: "inherit",
  });

  watchProc.on("close", (code) => {
    if (code === 0) {
      console.log("\n🎉 CI Quality Gate passed successfully!");
    } else {
      console.error(`\n⚠️ CI Quality Gate failed with exit code ${code}. Check logs with: gh run view ${runId} --log`);
    }
  });
} else {
  console.log("ℹ️ No immediate CI run detected. Check manually with: gh run list");
}
