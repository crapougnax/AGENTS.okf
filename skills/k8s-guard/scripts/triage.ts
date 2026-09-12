#!/usr/bin/env bun
import { spawnSync } from "node:child_process";

function run(cmd: string, args: string[]): string {
  const res = spawnSync(cmd, args, { encoding: "utf-8", shell: false });
  if (res.status !== 0) {
    if (res.stderr) console.error(res.stderr.trim());
    return "";
  }
  return (res.stdout ?? "").trim();
}

const namespace = process.argv[2] ?? "default";

console.log(`🏥 Running safe Kubernetes triage for namespace: [${namespace}]...\n`);

// 1. Pod Overview
console.log("=== 1. Pod Health & Restart Overview ===");
const podsOutput = run("kubectl", [
  "get", "pods",
  "-n", namespace,
  "-o", "custom-columns=NAME:.metadata.name,STATUS:.status.phase,RESTARTS:.status.containerStatuses[0].restartCount,READY:.status.containerStatuses[0].ready,NODE:.spec.nodeName",
]);
console.log(podsOutput || "No pods found.");

// 2. Unhealthy Pods Filter
console.log("\n=== 2. Unhealthy Pods (Pending / CrashLoopBackOff / Error) ===");
const unhealthy = run("kubectl", [
  "get", "pods",
  "-n", namespace,
  "--field-selector", "status.phase!=Running,status.phase!=Succeeded",
  "-o", "wide",
]);
if (unhealthy && !unhealthy.includes("No resources found")) {
  console.log(unhealthy);
} else {
  console.log("✅ All pods are running nominally or succeeded.");
}

// 3. Recent Warning Events
console.log("\n=== 3. Recent Warning Events (Last 10) ===");
const warnings = run("kubectl", [
  "get", "events",
  "-n", namespace,
  "--field-selector", "type=Warning",
  "--sort-by=.metadata.creationTimestamp",
]);
if (warnings && !warnings.includes("No resources found")) {
  const lines = warnings.split("\n");
  console.log(lines.slice(-11).join("\n"));
} else {
  console.log("✅ Zero warning events recorded in this namespace.");
}

// 4. Ingress & TLS Status
console.log("\n=== 4. Ingress & Routing Endpoints ===");
const ingresses = run("kubectl", ["get", "ingresses", "-n", namespace, "-o", "custom-columns=NAME:.metadata.name,CLASS:.spec.ingressClassName,HOSTS:.spec.rules[*].host,ADDRESS:.status.loadBalancer.ingress[0].ip"]);
console.log(ingresses || "No ingresses found.");

console.log("\n🔒 Note: k8s-guard is strictly read-only. Destructive operations (delete, apply, patch) require explicit human confirmation.");
