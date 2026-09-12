#!/usr/bin/env bun
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { resolve, join, basename } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "..");
const CONTENT_ROOT = resolve(REPO_ROOT, "content");
const DIST_DIR = resolve(REPO_ROOT, "dist");

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

interface CategorySpec {
  name: string;
  dir: string;
  files: string[];
}

interface DiscoveredFiche {
  category: string;
  categoryDir: string;
  file: string;
  title: string;
}

// ---------------------------------------------------------------------------
// Static category registry (used by consolidated build + Gist sync)
// ---------------------------------------------------------------------------

const CATEGORIES: CategorySpec[] = [
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
      "secrets-and-env-management.md",
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
    name: "7. IoT, Embedded & LoRaWAN",
    dir: "iot-embedded",
    files: [
      "embedded-cpp-standards.md",
      "lorawan-protocol-and-payload.md",
      "lorawan-deployment-architecture.md",
      "telemetry-ingestion-pipeline.md",
    ],
  },
  {
    name: "8. Knowledge & Documentation Standards",
    dir: "knowledge",
    files: ["okf-v01-open-knowledge-format.md"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripYamlFrontmatter(content: string): string {
  if (!content.startsWith("---")) return content;
  const endIdx = content.indexOf("\n---", 3);
  if (endIdx === -1) return content;
  return content.substring(endIdx + 4).trim();
}

/**
 * Auto-discover categories and their fiches from the content directory.
 * Reads each `content/<dir>/index.md` for the category description,
 * and lists all `.md` files (excluding `index.md`) as fiches.
 */
async function discoverCategories(contentRoot: string): Promise<DiscoveredFiche[]> {
  const fiches: DiscoveredFiche[] = [];
  const entries = await readdir(contentRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;

    const catDir = entry.name;
    const catPath = join(contentRoot, catDir);
    const catFiles = await readdir(catPath);

    // Read category index for the title
    let categoryTitle = catDir;
    const indexPath = join(catPath, "index.md");
    try {
      const indexContent = await readFile(indexPath, "utf-8");
      const titleMatch = indexContent.match(/^#\s+(.+)/m);
      if (titleMatch) {
        categoryTitle = titleMatch[1].trim();
      }
    } catch {
      // No index.md — use directory name
    }

    for (const file of catFiles.sort()) {
      if (file === "index.md" || !file.endsWith(".md")) continue;
      // Derive a human title from the filename
      const title = file
        .replace(".md", "")
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      fiches.push({
        category: categoryTitle,
        categoryDir: catDir,
        file,
        title,
      });
    }
  }

  return fiches;
}

/**
 * Build the topic-map table mapping common task keywords to fiches.
 * Uses a static mapping of tasks → file patterns for robust matching.
 */
const TOPIC_MAP: Array<{ task: string; pattern: string; label: string }> = [
  { task: "Git Branching, PRs, or Releases", pattern: "gitflow-protocol.md", label: "GitFlow Protocol" },
  { task: "Git Branching, PRs, or Releases", pattern: "github-cli-protocol.md", label: "GitHub CLI Protocol" },
  { task: "Commit Messages & Issue Linking", pattern: "conventional-commits.md", label: "Conventional Commits" },
  { task: "SemVer Tagging & Monorepo Releases", pattern: "semver-and-monorepo-tagging.md", label: "SemVer & Monorepo Tagging" },
  { task: "Defining Entities & Repositories", pattern: "quatrain-repository-pattern.md", label: "Quatrain Repository Pattern" },
  { task: "Database DDL Migrations & Naming", pattern: "postgresql-ddl-and-naming.md", label: "PostgreSQL DDL & Naming" },
  { task: "Backend REST APIs or Middlewares", pattern: "backend-api-architecture.md", label: "Backend API Architecture" },
  { task: "Asynchronous Event Processing", pattern: "background-workers-and-triggers.md", label: "Background Workers & Triggers" },
  { task: "Asynchronous Event Processing", pattern: "queue-and-event-streaming.md", label: "Queue Streaming" },
  { task: "Logging & Diagnostics", pattern: "structured-logging.md", label: "Structured Logging Standards" },
  { task: "Mobile UI, Sunlight, Contrast or CSS", pattern: "high-glare-mobile-ux.md", label: "High-Glare Mobile UX" },
  { task: "Mobile UI, Sunlight, Contrast or CSS", pattern: "static-css-and-interaction-hygiene.md", label: "Static CSS Hygiene" },
  { task: "Container Images & Podman", pattern: "containerfile-and-podman.md", label: "Containerfile & Podman Standards" },
  { task: "Local Stacks or On-Premise Compose", pattern: "docker-compose-deployment.md", label: "Docker Compose Recipes" },
  { task: "Kubernetes Workloads & Scaling", pattern: "k8s-manifests-and-deployments.md", label: "Kubernetes Manifests & Deployments" },
  { task: "Multi-Cloud IaC, Traefik & TLS", pattern: "k8s-multi-cloud-iac.md", label: "Multi-Cloud K8s & Terraform IaC" },
  { task: "Operational Command Permissions", pattern: "operational-permissions-matrix.md", label: "Operational Permissions Matrix" },
  { task: "Embedded C++ Firmware", pattern: "embedded-cpp-standards.md", label: "Embedded C++ Standards" },
  { task: "LoRaWAN Protocol & Payloads", pattern: "lorawan-protocol-and-payload.md", label: "LoRaWAN Protocol & Payload" },
  { task: "IoT Telemetry Ingestion", pattern: "telemetry-ingestion-pipeline.md", label: "Telemetry Ingestion Pipeline" },
];

/**
 * Resolve a fiche pattern to its full `file://` path given discovered fiches.
 */
function resolveTopicPath(
  fiches: DiscoveredFiche[],
  pattern: string,
  repoRoot: string
): string | null {
  const match = fiches.find((f) => f.file === pattern);
  if (!match) return null;
  return `file://${repoRoot}/content/${match.categoryDir}/${match.file}`;
}

// ---------------------------------------------------------------------------
// Consolidated markdown (legacy, used by sync-gist)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Gemini Router Generator
// ---------------------------------------------------------------------------

export async function buildGeminiRouter(repoRoot: string): Promise<string> {
  const fiches = await discoverCategories(join(repoRoot, "content"));
  const version = await getVersion(repoRoot);
  const commit = await getShortCommit(repoRoot);

  const lines: string[] = [];

  // Header
  lines.push(`# LLM Agent Development Principles, Architecture Standards & GitFlow Protocol (OKF Router)

> **Format**: Open Knowledge Format (OKF v0.1) | **License**: AGPL-v3  
> **Local Authority**: [AGENTS.okf Knowledge Base](file://${repoRoot}/content/index.md)  
> **GitHub Repository**: https://github.com/crapougnax/AGENTS.okf  
> **Online Gist Reference**: https://gist.github.com/crapougnax/47971b85aa73dd702f4372a89858111c  
> **Local Extensions**: Machine-specific local guidelines in [AGENTS_local.md](file://${repoRoot}/../../../.gemini/AGENTS_local.md)

> [!IMPORTANT]
> **AI Sync Requirement:** The source of truth for all rules is the modular repository [\`AGENTS.okf\`](file://${repoRoot}). Whenever updating rules, edit the corresponding atomic unit under \`content/\` and run \`bun run sync-gist\` to synchronize the personal Gist (\`47971b85aa73dd702f4372a89858111c\`, filename: \`GEMINI_personal.md\`).

---

## 🧭 1. Mandatory Progressive Disclosure Protocol

AI coding agents **MUST NOT** make blind assumptions about coding conventions, interfaces, database schemas, or deployment manifests.

### Instructions for AI Agents:
1. **Consult Before Acting:** Before creating files, writing tests, refactoring, modifying schemas, or running deployment commands, you **MUST proactively inspect** the matching atomic OKF rule unit.
2. **Start at the Index:** Use [Root Rules Index](file://${repoRoot}/content/index.md) to locate the relevant category:`);

  // Build category index — group fiches by category
  const categories = new Map<string, { dir: string; fiches: DiscoveredFiche[] }>();
  for (const fiche of fiches) {
    if (!categories.has(fiche.category)) {
      categories.set(fiche.category, { dir: fiche.categoryDir, fiches: [] });
    }
    categories.get(fiche.category)!.fiches.push(fiche);
  }

  for (const [catName, { dir, fiches: catFiches }] of categories) {
    const summary = catFiches.map((f) => f.title).slice(0, 4).join(", ");
    const ellipsis = catFiches.length > 4 ? ", ..." : "";
    lines.push(`   - [${catName}](file://${repoRoot}/content/${dir}/index.md) (${summary}${ellipsis})`);
  }

  lines.push(`3. **Context Economy:** Load **ONLY** the specific atomic document(s) matching your immediate task to preserve context window.

---

## ⚡ 2. Default Authorized Commands (Autonomous vs Gated Scope)

To maximize velocity without risking accidental outages or regressions, the AI agent is authorized to proactively run non-destructive diagnostic, audit, and local build/test commands without asking for confirmation.

### 🟢 Autonomous Scope (Allowed by Default — Immediate Execution)
- **Standard Shell Utilities (Audit & Reading):**
  - \`ls\` (\`-l\`, \`-la\`, \`-lh\`, \`-R\`), \`cat\`, \`head\`, \`tail\` (\`-n\`, \`-f\`), \`grep\` (\`-r\`, \`-i\`, \`-n\`, \`-E\`), \`rg\`, \`find\`, \`tree\`, \`diff\`, \`stat\`, \`file\`, \`wc\`, \`du\` (\`-sh\`), \`df\` (\`-h\`), \`ps aux\`, \`top -l 1\`, \`lsof -i :<port>\`, \`netstat\`, \`pwd\`, \`which\`, \`env\` (read-only), \`jq\`, \`yq\`, \`curl -I\`, \`curl -s -X GET\`.
- **Git Operations (Read-Only):**
  - \`git status\`, \`git log\`, \`git diff\`, \`git branch -a\`, \`git remote -v\`, \`git show\`, \`git tag -l\`.
- **GitHub CLI (\`gh\`):**
  - \`gh issue list/view/status\`, \`gh pr list/view/diff/checks/status\`, \`gh run list/view/watch\`, \`gh release list/view\`, \`gh repo view\`, \`gh auth status\`, \`gh gist list/view\`.
- **Kubernetes Inspection (\`kubectl\`):**
  - \`kubectl get <all|pods|svc|deploy|ingress|pvc|nodes|cm|secrets> [-n <ns>] [-o wide|yaml|json]\`, \`kubectl describe\`, \`kubectl logs [--tail=N] [-f]\`, \`kubectl top\`, \`kubectl cluster-info\`, \`kubectl kustomize\`.
- **Containers & Compose (\`podman\` / \`docker\`):**
  - \`podman ps [-a]\`, \`docker ps [-a]\`, \`podman images\`, \`docker images\`, \`podman logs\`, \`docker logs\`, \`podman inspect\`, \`docker inspect\`, \`podman stats --no-stream\`, \`docker compose ps\`, \`docker compose logs\`, \`docker compose config\`.
- **Infrastructure as Code (\`terraform\` / \`tofu\`):**
  - \`terraform fmt -check\`, \`terraform validate\`, \`terraform plan\`, \`terraform show\`, \`terraform state list/show\`.
- **Local Testing & Compilation:**
  - \`bun test\`, \`bun run build\`, \`bun run validate\`, \`yarn test\`, \`yarn lint\`, \`npm test\`, \`tsc --noEmit\`, \`poetry run pytest\`, \`cargo check/test\`.

### 🛑 Gated Scope (Explicit Human Confirmation Strictly Required)
- **Database Mutations:** \`UPDATE\`, \`DELETE\`, \`TRUNCATE\`, \`DROP TABLE\`, \`ALTER TABLE\` on production/staging databases.
- **Cluster & Cloud Mutations:** \`kubectl delete\`, \`kubectl apply/patch\` directly on live clusters, \`kubectl scale\`, \`terraform apply\`.
- **Container Cleanup:** \`podman rm -f\`, \`docker rm -f\`, \`docker system prune --volumes\`.
- **Git Modifications:** \`git push --force\`, **merging Pull Requests** (human decision), deleting remote branches/tags.

👉 *See full specification:* [Operational Permissions Matrix](file://${repoRoot}/content/infrastructure/operational-permissions-matrix.md)

---

## 🚀 3. Quick Topic Map

| If your task involves... | Consult this atomic OKF unit: |
| :--- | :--- |`);

  // Build topic map from TOPIC_MAP
  const grouped = new Map<string, string[]>();
  for (const entry of TOPIC_MAP) {
    const path = resolveTopicPath(fiches, entry.pattern, repoRoot);
    if (!path) continue;
    const link = `[${entry.label}](${path})`;
    if (!grouped.has(entry.task)) {
      grouped.set(entry.task, []);
    }
    grouped.get(entry.task)!.push(link);
  }

  for (const [task, links] of grouped) {
    lines.push(`| **${task}** | ${links.join(" & ")} |`);
  }

  // Footer
  lines.push(`
---
> *Generated by AGENTS.okf v${version} (${commit}) — \`bun run build\`*
`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Claude Router Generator
// ---------------------------------------------------------------------------

export async function buildClaudeRouter(repoRoot: string): Promise<string> {
  const fiches = await discoverCategories(join(repoRoot, "content"));
  const version = await getVersion(repoRoot);
  const commit = await getShortCommit(repoRoot);

  const lines: string[] = [];

  lines.push(`# LLM Agent Development Principles, Architecture Standards & GitFlow Protocol (OKF Router)

> **Format**: Open Knowledge Format (OKF v0.1) | **License**: AGPL-v3  
> **Local Authority**: AGENTS.okf Knowledge Base at \`${repoRoot}/content/index.md\`  
> **GitHub Repository**: https://github.com/crapougnax/AGENTS.okf

---

## 🧭 1. Mandatory Progressive Disclosure Protocol

AI coding agents **MUST NOT** make blind assumptions about coding conventions, interfaces, database schemas, or deployment manifests.

### Instructions for AI Agents:
1. **Consult Before Acting:** Before creating files, writing tests, refactoring, modifying schemas, or running deployment commands, you **MUST proactively read** the matching atomic OKF rule unit using the \`Read\` tool or \`cat\`.
2. **Start at the Index:** Read \`${repoRoot}/content/index.md\` to locate the relevant category:`);

  // Category index
  const categories = new Map<string, { dir: string; fiches: DiscoveredFiche[] }>();
  for (const fiche of fiches) {
    if (!categories.has(fiche.category)) {
      categories.set(fiche.category, { dir: fiche.categoryDir, fiches: [] });
    }
    categories.get(fiche.category)!.fiches.push(fiche);
  }

  for (const [catName, { dir, fiches: catFiches }] of categories) {
    const summary = catFiches.map((f) => f.title).slice(0, 4).join(", ");
    const ellipsis = catFiches.length > 4 ? ", ..." : "";
    lines.push(`   - **${catName}**: \`${repoRoot}/content/${dir}/index.md\` (${summary}${ellipsis})`);
  }

  lines.push(`3. **Context Economy:** Load **ONLY** the specific atomic document(s) matching your immediate task to preserve context window.

---

## ⚡ 2. Default Authorized Commands (Autonomous vs Gated Scope)

### 🟢 Autonomous Scope (Allowed by Default — Immediate Execution)
- **Shell Utilities:** \`ls\`, \`cat\`, \`head\`, \`tail\`, \`grep\`, \`rg\`, \`find\`, \`tree\`, \`diff\`, \`stat\`, \`file\`, \`wc\`, \`du\`, \`df\`, \`ps aux\`, \`jq\`, \`yq\`, \`curl -I\`, \`curl -s -X GET\`.
- **Git (Read-Only):** \`git status\`, \`git log\`, \`git diff\`, \`git branch -a\`, \`git remote -v\`, \`git show\`, \`git tag -l\`.
- **GitHub CLI:** \`gh issue list/view\`, \`gh pr list/view/diff/checks\`, \`gh run list/view\`, \`gh release list/view\`, \`gh repo view\`.
- **Kubernetes:** \`kubectl get\`, \`kubectl describe\`, \`kubectl logs\`, \`kubectl top\`, \`kubectl cluster-info\`.
- **Containers:** \`podman ps\`, \`podman images\`, \`podman logs\`, \`podman inspect\`, \`docker compose ps/logs/config\`.
- **IaC:** \`terraform fmt -check\`, \`terraform validate\`, \`terraform plan\`, \`terraform show\`, \`terraform state list/show\`.
- **Testing:** \`bun test\`, \`bun run build\`, \`bun run validate\`, \`yarn test\`, \`npm test\`, \`tsc --noEmit\`, \`cargo check/test\`.

### 🛑 Gated Scope (Explicit Human Confirmation Required)
- **Database Mutations:** \`UPDATE\`, \`DELETE\`, \`TRUNCATE\`, \`DROP TABLE\`, \`ALTER TABLE\` on production/staging.
- **Cluster Mutations:** \`kubectl delete\`, \`kubectl apply/patch\`, \`kubectl scale\`, \`terraform apply\`.
- **Container Cleanup:** \`podman rm -f\`, \`docker rm -f\`, \`docker system prune --volumes\`.
- **Git Mutations:** \`git push --force\`, merging Pull Requests, deleting remote branches/tags.

👉 *Full specification:* \`${repoRoot}/content/infrastructure/operational-permissions-matrix.md\`

---

## 🚀 3. Quick Topic Map

| If your task involves... | Read this file: |
| :--- | :--- |`);

  // Topic map with file paths instead of file:// links
  const grouped = new Map<string, string[]>();
  for (const entry of TOPIC_MAP) {
    const match = fiches.find((f) => f.file === entry.pattern);
    if (!match) continue;
    const path = `\`${repoRoot}/content/${match.categoryDir}/${match.file}\``;
    if (!grouped.has(entry.task)) {
      grouped.set(entry.task, []);
    }
    grouped.get(entry.task)!.push(path);
  }

  for (const [task, paths] of grouped) {
    lines.push(`| **${task}** | ${paths.join(" & ")} |`);
  }

  lines.push(`
---
> *Generated by AGENTS.okf v${version} (${commit}) — \`bun run build\`*
`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Version helpers
// ---------------------------------------------------------------------------

async function getVersion(repoRoot: string): Promise<string> {
  try {
    const pkg = JSON.parse(await readFile(join(repoRoot, "package.json"), "utf-8"));
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

async function getShortCommit(repoRoot: string): Promise<string> {
  try {
    const proc = Bun.spawn(["git", "rev-parse", "--short", "HEAD"], {
      cwd: repoRoot,
      stdout: "pipe",
    });
    const text = await new Response(proc.stdout).text();
    return text.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await mkdir(DIST_DIR, { recursive: true });

  // 1. Consolidated bundle (for Gist sync — backward compatible)
  const consolidated = await buildConsolidatedMarkdown();
  const consolidatedPath = resolve(DIST_DIR, "AGENTS_consolidated.md");
  await writeFile(consolidatedPath, consolidated, "utf-8");
  console.log(`📦 Consolidated bundle: ${consolidatedPath}`);

  // 2. Gemini router
  const geminiRouter = await buildGeminiRouter(REPO_ROOT);
  const geminiPath = resolve(DIST_DIR, "GEMINI.md");
  await writeFile(geminiPath, geminiRouter, "utf-8");
  console.log(`🔵 Gemini router:      ${geminiPath}`);

  // 3. Claude router
  const claudeRouter = await buildClaudeRouter(REPO_ROOT);
  const claudePath = resolve(DIST_DIR, "CLAUDE.md");
  await writeFile(claudePath, claudeRouter, "utf-8");
  console.log(`🟣 Claude router:      ${claudePath}`);

  console.log("\n✅ All distribution files generated successfully.");
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("Build failed:", err);
    process.exit(1);
  });
}
