---
name: agents-okf
description: Enforces Open Knowledge Format (OKF v0.1) development standards, GitFlow lifecycle, operational command permissions, DDD, REST API architecture, and Quatrain patterns. TRIGGER this skill whenever starting any software task: creating git branches, writing commits, opening PRs, designing domain models, writing unit tests, building APIs, setting up background workers, configuring Kubernetes manifests, writing Containerfiles, or checking command permissions.
triggers:
  - git branch
  - commit
  - pull request
  - domain model
  - unit test
  - REST API
  - background worker
  - kubernetes
  - containerfile
  - permissions
---

# AGENTS.okf — Progressive Rules Router Skill

This skill enforces the architecture standards, quality gates, and GitFlow protocol defined in the centralized **`AGENTS.okf`** repository.

## 🧭 Progressive Disclosure Directive

Before taking creative or architectural actions, **PROACTIVELY LOAD** the matching atomic OKF unit using the `view_file` tool.

Root Index: [Root Rules Index](../../content/index.md)

### 1. Workflow, Git & GitHub
- **GitFlow Branching**: [gitflow-protocol.md](../../content/workflow/gitflow-protocol.md)
  - Always branch from `develop`: `feat/<issue>-<short-description>` or `fix/...`
  - PR targets `develop` with issue closing keyword (`Closes #X`).
  - Staging verification before PR to `main` with SemVer tag.
- **Commit Format**: [conventional-commits.md](../../content/workflow/conventional-commits.md)
  - Format: `<type>(<scope>): <present imperative> (#<issue>)`
- **GitHub CLI Operations**: [github-cli-protocol.md](../../content/workflow/github-cli-protocol.md)
  - Required flags: `--assignee @me`, `--milestone`, `--base develop`.
  - Token conflict fallback: `env -u GH_TOKEN -u GITHUB_TOKEN gh ...`
- **SemVer Tagging**: [semver-and-monorepo-tagging.md](../../content/workflow/semver-and-monorepo-tagging.md)
  - Monorepo scoped tags: `@quatrain/core@1.2.4`, standalone app tags: `v1.2.0`.
- **Preview QA**: [qa-preview-environments.md](../../content/workflow/qa-preview-environments.md)

### 2. Architecture & Design Patterns
- **Domain-Driven Design**: [domain-driven-design.md](../../content/architecture/domain-driven-design.md)
- **Strict Typing**: [strict-typing-and-interfaces.md](../../content/architecture/strict-typing-and-interfaces.md)
  - Zero `as any`, `@ts-ignore`, `@ts-nocheck`. Interfaces use `*Interface` suffix (no `I...`).
- **Fail-Fast Contracts**: [fail-fast-contracts.md](../../content/architecture/fail-fast-contracts.md)
  - Base class constructor validation. Zero silent fallback URLs (`|| 'http://...'`).
- **State Machines**: [finite-state-machines.md](../../content/architecture/finite-state-machines.md)
- **Queue Streaming & Logging**: [queue-and-event-streaming.md](../../content/architecture/queue-and-event-streaming.md) & [structured-logging.md](../../content/architecture/structured-logging.md)
  - `@quatrain/queue-*`, `queue.listen(topic, handler)`. Structured logs (`Backend/Queue.info`), no raw `console.log`.

### 3. Backend & Workers
- **REST APIs**: [backend-api-architecture.md](../../content/backend-workers/backend-api-architecture.md)
- **Background Triggers**: [background-workers-and-triggers.md](../../content/backend-workers/background-workers-and-triggers.md)
- **Quatrain Repository Pattern**: [quatrain-repository-pattern.md](../../content/backend-workers/quatrain-repository-pattern.md)
  - `.TYPE` in definitions, camelCase relations without `Id`, `Core.addClass`, soft-deletes.
- **PostgreSQL DDL**: [postgresql-ddl-and-naming.md](../../content/backend-workers/postgresql-ddl-and-naming.md)
  - Dedicated DDL `.sql` per domain. Strictly lowercase column/table names without quotes.
- **Headless MVC**: [headless-controllers-and-mvc.md](../../content/backend-workers/headless-controllers-and-mvc.md)

### 4. Frontend & UX Design
- **High-Glare Mobile UX**: [high-glare-mobile-ux.md](../../content/frontend-ux/high-glare-mobile-ux.md)
  - 540px container, 76px action targets, 96px bottom navs, Space Grotesk / Nunito typography.
- **Contrast & Status Tokens**: [contrast-and-status-tokens.md](../../content/frontend-ux/contrast-and-status-tokens.md)
  - Dark muted card backgrounds, vivid status badges, dark navy text on yellow.
- **Static CSS Hygiene**: [static-css-and-interaction-hygiene.md](../../content/frontend-ux/static-css-and-interaction-hygiene.md)
  - Zero dynamic inline styles. Compositor-driven native CSS interactions (`:hover`, `:has()`).
- **React Memoization**: [react-performance-and-memoization.md](../../content/frontend-ux/react-performance-and-memoization.md)

### 5. Infrastructure & Operations
- **Containerfile & Podman**: [containerfile-and-podman.md](../../content/infrastructure/containerfile-and-podman.md)
  - `Containerfile` naming, non-root `USER`, multi-arch `amd64/arm64`, standard OCI labels.
- **Docker Compose**: [docker-compose-deployment.md](../../content/infrastructure/docker-compose-deployment.md)
- **Kubernetes Workloads**: [k8s-manifests-and-deployments.md](../../content/infrastructure/k8s-manifests-and-deployments.md)
- **Multi-Cloud IaC (Tycho)**: [k8s-multi-cloud-iac.md](../../content/infrastructure/k8s-multi-cloud-iac.md)
  - Modular Terraform, Traefik v3 HTTP-01 ACME pass-through, isolated domain certs.
- **ArgoCD GitOps**: [argocd-gitops-and-updater.md](../../content/infrastructure/argocd-gitops-and-updater.md)
- **Operational Permissions Matrix**: [operational-permissions-matrix.md](../../content/infrastructure/operational-permissions-matrix.md)
  - Autonomous: `ls`, `grep`, `cat`, `kubectl get/logs`, `podman ps/logs`, `bun test`.
  - Gated (Confirm First): DB mutations, `kubectl delete/apply`, `git push --force`, merging PRs.

---

## 🛠️ 6. Companion Operational Skills

To assist agents in executing compliant operations, use the companion operational skills installed in `~/.gemini/config/skills/`:

1. **`gitflow-ops`** ([SKILL.md](../gitflow-ops/SKILL.md)):
   - Automated GitFlow branch branching (`scripts/branch.ts`), PR opening with closing keywords (`scripts/pr.ts`), and release tagging (`scripts/release.ts`).
2. **`k8s-guard`** ([SKILL.md](../k8s-guard/SKILL.md)):
   - Read-only cluster triage (`scripts/triage.ts`) and safe log inspection with automatic tailing (`scripts/safe-logs.ts`). Gated against accidental mutations.
3. **`podman-container-audit`** ([SKILL.md](../podman-container-audit/SKILL.md)):
   - Linter for `Containerfile` non-root compliance, multi-arch labels, healthchecks (`scripts/lint-containerfile.ts`), and active compose audits (`scripts/local-stack-audit.ts`).
4. **`ddl-schema-guard`** ([SKILL.md](../ddl-schema-guard/SKILL.md)):
   - PostgreSQL schema linter checking lowercase conventions, zero quoted identifiers, and standard timestamps (`scripts/lint-ddl.ts`).
