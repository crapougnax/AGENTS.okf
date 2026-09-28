---
type: standard
title: Sovereign Forge Lifecycle & CRA Patch Compliance
description: Strict sequential upgrade path and lifecycle standards for self-hosted git forges, artifact registries, and CI/CD infrastructure under the Cyber Resilience Act.
tags:
  - security
  - forgejo
  - cra
  - compliance
  - upgrade
  - sqlite
timestamp: 2026-09-28T10:00:00.000Z
category: infrastructure
status: active
---

# Sovereign Forge Lifecycle & CRA Patch Compliance

Sovereign developer infrastructure—including self-hosted git forges (`git.*`), container registries, and package hubs—represents the foundation of the software supply chain. Under the European **Cyber Resilience Act (CRA)** and stringent enterprise cyber-defense requirements, hosting repositories or publishing security advisories on unpatched or End-of-Life (EOL) infrastructure is strictly unacceptable.

---

## 🧭 Core Directives

### 1. Zero Tolerance for EOL Infrastructure (CRA Alignment)
- **Active Support Baseline:** Production forges must run strictly on active, maintained releases—prioritizing designated **Long-Term Support (LTS)** branches (e.g., Forgejo v15.0 LTS).
- **Prohibited State:** Running EOL versions (e.g., Forgejo 9.x / 10.x / 11.x) exposes critical attack surfaces (reverse proxy bypass, git-lfs path sanitization bugs, webhook forgery, CSRF) and fundamentally violates CRA compliance obligations.
- **Vulnerability Patch Horizon:** Minor and security patch releases within the active LTS track must be applied promptly via automated or verified GitOps workflows.

### 2. Strict Sequential Major Upgrades (Never Skip Major Versions)
- **Incremental Schema Migrations:** Self-hosted forges rely on embedded database schema migrations (e.g., Go `xorm` over SQLite3 or PostgreSQL). Migrations are designed to execute strictly between consecutive major versions:
  $$\text{v9} \longrightarrow \mathbf{v10} \longrightarrow \mathbf{v11} \longrightarrow \mathbf{v12} \longrightarrow \mathbf{v13} \longrightarrow \mathbf{v14} \longrightarrow \mathbf{v15}\text{ (LTS)}$$
- **Skip Prohibition:** Never jump directly across multiple major versions (e.g., from v9 straight to v15). Skipping major releases causes ORM schema divergence, missing table alterations, and unrecoverable database corruption.

### 3. Verification Protocol at Each Intermediate Step
For each sequential major version transition:
1. **Pre-Upgrade Snapshot:** Create a cold backup of the SQLite database (`forgejo.db`) and repository directories before initiating container restart.
2. **Container Image Update:** Update the deployment image tag to the intermediate major version ($N+1$).
3. **Migration Log Audit:** Inspect container startup logs (`kubectl logs`) to verify all database migration steps complete with zero errors.
4. **Health & Version Probe:** Confirm readiness via `GET /api/v1/version` and UI sanity check before advancing to the subsequent major version.

### 4. GitOps Declarative Pinning
- Once the target LTS release is validated, declare the exact pinned image tag (e.g., `codeberg.org/forgejo/forgejo:15.0.x` or `:15`) in the GitOps repository managed by ArgoCD.
- Avoid using floating unversioned tags (e.g., `:latest` or broad untracked tags) that could trigger uncontrolled major version jumps on container redeployment.

---

## 🔗 Related Units
- [Kubernetes Manifests & Deployments](k8s-manifests-and-deployments.md)
- [ArgoCD GitOps & Image Updater Automation](argocd-gitops-and-updater.md)
- [Operational Permissions Matrix](operational-permissions-matrix.md)
- [Maintainability 15-Year Horizon](../methodology/maintainability-15-year-horizon.md)
