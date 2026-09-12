#!/usr/bin/env bun
import { spawnSync } from "node:child_process";

function run(cmd: string, args: string[]): string {
  const res = spawnSync(cmd, args, { encoding: "utf-8", shell: false });
  if (res.status !== 0) return "";
  return (res.stdout ?? "").trim();
}

console.log("🐳 Auditing local container engine (Podman / Docker)...\n");

const hasPodman = run("which", ["podman"]).length > 0;
const hasDocker = run("which", ["docker"]).length > 0;

const engine = hasPodman ? "podman" : hasDocker ? "docker" : null;

if (!engine) {
  console.log("ℹ️ Neither Podman nor Docker is installed on this machine.");
  process.exit(0);
}

console.log(`Using active container engine: [${engine}]`);

console.log("\n=== Active Containers ===");
const psOut = run(engine, ["ps", "--format", "table {{.Names}}\t{{.Status}}\t{{.Ports}}"]);
console.log(psOut || "No running containers.");

console.log("\n=== Local Container Images ===");
const imagesOut = run(engine, ["images", "--format", "table {{.Repository}}:{{.Tag}}\t{{.Size}}"]);
console.log(imagesOut || "No local images found.");

console.log("\n🔒 Note: Local stack audit is strictly read-only. Destructive volume pruning is prohibited without confirmation.");
