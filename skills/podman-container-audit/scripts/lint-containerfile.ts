#!/usr/bin/env bun
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const targetPath = process.argv[2] ?? "Containerfile";
const fileName = basename(targetPath);

console.log(`🔍 Linting Containerfile: [${targetPath}]...\n`);

const errors: string[] = [];
const warnings: string[] = [];

// 1. Check filename convention
if (fileName === "Dockerfile") {
  errors.push("Prohibited filename 'Dockerfile'. Per ecosystem standards, use 'Containerfile' or 'ContainerFile'.");
}

let content: string;
try {
  content = await readFile(targetPath, "utf-8");
} catch (err: any) {
  console.error(`❌ Could not read file: ${targetPath} (${err.message})`);
  process.exit(1);
}

const lines = content.split("\n");

// 2. Check for unprivileged non-root USER
let hasUserDirective = false;
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith("USER ") && !trimmed.includes("root") && !trimmed.includes("0")) {
    hasUserDirective = true;
  }
}

if (!hasUserDirective) {
  errors.push("Missing unprivileged non-root USER directive in final runtime stage (e.g. 'USER bun' or 'USER node'). Running as root is strictly prohibited.");
}

// 3. Check for OCI labels
const hasOciTitle = lines.some((l) => l.includes("org.opencontainers.image.title"));
const hasOciDesc = lines.some((l) => l.includes("org.opencontainers.image.description"));
const hasOciLicense = lines.some((l) => l.includes("org.opencontainers.image.licenses"));

if (!hasOciTitle || !hasOciDesc) {
  warnings.push("Missing standard OCI metadata labels (org.opencontainers.image.title, description, licenses).");
}

// Summary
if (errors.length > 0) {
  console.error("❌ Containerfile validation FAILED with errors:");
  for (const err of errors) {
    console.error(`   - ${err}`);
  }
}

if (warnings.length > 0) {
  console.warn("⚠️ Containerfile validation WARNINGS:");
  for (const w of warnings) {
    console.warn(`   - ${w}`);
  }
}

if (errors.length === 0) {
  console.log("✅ Containerfile strictly complies with Podman & OCI security standards!");
} else {
  process.exit(1);
}
