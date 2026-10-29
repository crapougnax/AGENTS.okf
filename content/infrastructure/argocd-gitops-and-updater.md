---
type: pattern
title: ArgoCD GitOps & Image Updater Automation
description: Continuous delivery pipeline architecture using ArgoCD ApplicationSets, AppProjects, and automated SemVer image updates in production.
tags:
  - argocd
  - gitops
  - continuous-delivery
  - kubernetes
timestamp: 2026-09-12T05:00:00.000Z
category: infrastructure
status: active
---

# ArgoCD GitOps & Image Updater Automation

Continuous delivery across staging and production clusters relies on declarative GitOps synchronization via ArgoCD.

## 🧭 Core Directives

### 1. Git Repository as Single Source of Truth
- The state of live Kubernetes clusters must strictly mirror the Git repository.
- Manual modifications executed directly via `kubectl edit` or `kubectl apply` in production are prohibited, as they cause GitOps out-of-sync drift.

### 2. ArgoCD Image Updater
- ArgoCD Image Updater continuously tracks container registries (GHCR / Docker Hub) for new semver releases:
  - **Staging:** Tracks latest builds or release candidate tags.
  - **Production:** Tracks strict semantic versioning tags (`vX.Y.Z`) on the `main` branch.
- When a new semver tag is detected, Image Updater automatically commits the updated image tag back to Git, prompting ArgoCD to execute a rolling update without downtime.

### 3. ApplicationSets & Isolation
- Group related microservices into cohesive `AppProjects` with role-based access control (RBAC).
- Leverage `ApplicationSets` to generate multi-environment configurations (staging, production, preview PRs) from a single declarative template.

### 4. Multi-Tenant Platforms: "The Platform Hosts, the Tenant Decides"
A shared cluster (platform) hosts several products (tenants). Each tenant must be able to change its deployment **without touching the platform repository**.

- **Platform repository** (e.g. `qtrn-io/cluster`) owns only:
  - one `AppProject` per tenant, restricting `sourceRepos` to the tenant repository and `destinations` to the tenant namespaces;
  - one `ApplicationSet` per tenant, using a **git files generator** on `k8s/stacks/*/app.json` in the tenant repository, with `project: <tenant>` and `syncPolicy.preserveResourcesOnDeletion: true`;
  - shared platform services (ingress, cert-manager, LoRaWAN server, registries). A tenant consumes them, never deploys them.
- **Tenant repository** (e.g. `bradtech/brad-infra`) owns its stacks: `k8s/stacks/<stack>/{app.json, base/}`. `app.json` declares `name` and `namespace`; adding a stack is a tenant-only commit.
- **Repository credentials** are scoped to the tenant `AppProject` (`project: <tenant>` on the repo secret), never global.
- **Secrets** live in the tenant repository as SOPS-encrypted `secrets.enc.yaml` (KSOPS generator) using the platform age recipients.
- **Templating gotcha:** ApplicationSets default to fasttemplate; git files generator parameters are `{{path}}`, `{{name}}`, `{{namespace}}` (not `{{path.path}}`, which requires `goTemplate: true`).
- **Hook ordering:** resources needed by PreSync hooks (e.g. an `imagePullSecret` for a migration Job) must themselves be PreSync hooks with a lower `sync-wave` and `hook-delete-policy: BeforeHookCreation`; normal resources are applied only after PreSync hooks.
- **Pinned images over Image Updater** are acceptable for tenants with low release frequency: the release is a one-line tag bump PR in the tenant repository, reviewed like any change.
- Document the contract in the platform (`docs/TENANTS.md`) and in the tenant README.

## 🔗 Related Units
- [Production Change Impact Analysis & Staged Migration Protocol](production-change-impact-and-migration-protocol.md)
- [SemVer & Monorepo Tagging](../workflow/semver-and-monorepo-tagging.md)
- [QA Preview Environments](../workflow/qa-preview-environments.md)
- [Kubernetes Manifests & Deployments](k8s-manifests-and-deployments.md)
