#!/usr/bin/env bun
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "..");
const CONTENT_ROOT = resolve(REPO_ROOT, "content");
const DIST_DIR = resolve(REPO_ROOT, "dist");
const OUTPUT_FILE = resolve(DIST_DIR, "AGENTS_consolidated.md");

const CATEGORIES = [
  {
    name: "1. Methodology, Philosophy & Quality Standards",
    dir: "methodology",
    files: [
      "maintainability-15-year-horizon.md",
      "tdd-and-test-co-location.md",
      "documentation-and-jsdoc.md",
      "international-english-standard.md",
      "sonarqube-quality-gates.md",
    ],
  },
  {
    name: "2. Workflow, GitFlow Protocol & Release Lifecycle",
    dir: "workflow",
    files: [
      "gitflow-protocol.md",
      "branch-isolation-and-topic-switch.md",
      "conventional-commits.md",
      "github-cli-protocol.md",
      "semver-and-monorepo-tagging.md",
      "qa-preview-environments.md",
      "three-tier-forking-model.md",
    ],
  },
  {
    name: "3. Architecture & Core Design Patterns",
    dir: "architecture",
    files: [
      "domain-driven-design.md",
      "strict-typing-and-interfaces.md",
      "fail-fast-contracts.md",
      "finite-state-machines.md",
      "dependency-injection-and-dry.md",
      "queue-and-event-streaming.md",
      "structured-logging.md",
      "local-first-architecture.md",
    ],
  },
  {
    name: "4. Backend Architecture & Background Workers",
    dir: "backend-workers",
    files: [
      "backend-api-architecture.md",
      "background-workers-and-triggers.md",
      "quatrain-repository-pattern.md",
      "postgresql-ddl-and-naming.md",
      "headless-controllers-and-mvc.md",
    ],
  },
  {
    name: "5. Frontend & High-Glare Ergonomics",
    dir: "frontend-ux",
    files: [
      "high-glare-mobile-ux.md",
      "contrast-and-status-tokens.md",
      "static-css-and-interaction-hygiene.md",
      "react-performance-and-memoization.md",
    ],
  },
  {
    name: "6. Infrastructure, Containers & Kubernetes",
    dir: "infrastructure",
    files: [
      "containerfile-and-podman.md",
      "docker-compose-deployment.md",
      "k8s-manifests-and-deployments.md",
      "k8s-multi-cloud-iac.md",
      "argocd-gitops-and-updater.md",
      "operational-permissions-matrix.md",
    ],
  },
  {
    name: "7. Knowledge & Documentation Standards",
    dir: "knowledge",
    files: ["okf-v01-open-knowledge-format.md"],
  },
];

function stripYamlFrontmatter(content: string): string {
  if (!content.startsWith("---")) return content;
  const endIdx = content.indexOf("\n---", 3);
  if (endIdx === -1) return content;
  return content.substring(endIdx + 4).trim();
}

export async function buildConsolidatedMarkdown(): Promise<string> {
  const parts: string[] = [];

  parts.push(`# LLM Agent Development Principles, Architecture Standards & GitFlow Protocol

This document outlines the core development philosophy, architectural standards, and structured GitFlow lifecycle that MUST be strictly followed across all projects and AI coding sessions.

> **Knowledge Base**: Generated from modular Open Knowledge Format (OKF v0.1) units in [\`AGENTS.okf\`](https://github.com/crapougnax/AGENTS.okf).
> **Online Reference**: https://gist.github.com/crapougnax/47971b85aa73dd702f4372a89858111c
`);

  for (const cat of CATEGORIES) {
    parts.push(`\n---\n\n## ${cat.name}\n`);

    for (const file of cat.files) {
      const filePath = resolve(CONTENT_ROOT, cat.dir, file);
      const raw = await readFile(filePath, "utf-8");
      const body = stripYamlFrontmatter(raw);
      parts.push(`\n### ${file.replace(".md", "")}\n\n${body}\n`);
    }
  }

  return parts.join("\n");
}

async function main() {
  await mkdir(DIST_DIR, { recursive: true });
  const consolidated = await buildConsolidatedMarkdown();
  await writeFile(OUTPUT_FILE, consolidated, "utf-8");
  console.log(`📦 Consolidated bundle successfully compiled to: ${OUTPUT_FILE}`);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("Build failed:", err);
    process.exit(1);
  });
}
