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

## 🔗 Related Units
- [SemVer & Monorepo Tagging](/workflow/semver-and-monorepo-tagging.md)
- [QA Preview Environments](/workflow/qa-preview-environments.md)
- [Kubernetes Manifests & Deployments](/infrastructure/k8s-manifests-and-deployments.md)
