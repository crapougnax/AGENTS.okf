#!/usr/bin/env bun
import { spawn } from "node:child_process";

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log(`
Usage: bun run safe-logs.ts <pod-or-app> [namespace] [tail-lines]

Example:
  bun run safe-logs.ts api-express staging 150
`);
  process.exit(1);
}

const target = args[0];
const namespace = args[1] ?? "default";
const tail = args[2] ?? "100";

console.log(`📋 Streaming logs for target [${target}] in namespace [${namespace}] (tail: ${tail})...\n`);

// Determine if target is full pod name or deployment/label
const isFullPod = target.includes("-") && target.split("-").length >= 3;
const cmdArgs = ["logs", "-n", namespace, `--tail=${tail}`, "-f"];

if (isFullPod) {
  cmdArgs.push(target);
} else {
  cmdArgs.push(`deployment/${target}`);
}

const proc = spawn("kubectl", cmdArgs, { stdio: "inherit", shell: false });

proc.on("error", (err) => {
  console.error("❌ Failed to stream logs:", err);
  process.exit(1);
});
