---
type: standard
title: SemVer & Monorepo Tagging Standards
description: Versioning and Git tag naming standards distinguishing standalone applications (vX.Y.Z) from multi-package monorepos (@scope/pkg@X.Y.Z).
tags:
  - git
  - semver
  - monorepo
  - release
  - tags
timestamp: 2026-09-12T05:00:00.000Z
category: workflow
status: active
---

# SemVer & Monorepo Tagging Standards

Semantic versioning must be strictly observed to maintain dependable dependency trees and trigger automated GitOps deployment pipelines.

## 🧭 Tagging Standards

### 1. Standalone Repositories / Single Applications
For standalone services, command-line utilities, or single-app repositories, use standard SemVer prefixing:
```bash
# Format: v<Major>.<Minor>.<Patch>
git tag -a v1.2.0 -m "Release v1.2.0 - Add structured logging and metrics"
git push origin main --tags
```
Automated tools (like ArgoCD Image Updater or GitHub Actions release workflows) track this semver pattern on `main`.

### 2. Multi-Package Monorepos (Mandatory Scoped Tags)
To prevent tag namespace collisions across independent packages within a monorepo, Git tags **MUST** explicitly declare the package scope and name:
```bash
# Format: @<scope>/<package-name>@<version> (or <package-name>@<version>)
git tag -a @quatrain/auth-rbac@1.0.0 -m "Release @quatrain/auth-rbac@1.0.0"
git tag -a @quatrain/core@1.2.4 -m "Release @quatrain/core@1.2.4"
git push origin main --tags
```

### 3. Registry Dist-Tags
- Package managers (NPM, GitHub Packages) distribute releases under specific dist-tags (`latest`, `beta`, `latest-dev`, `prXX`).
- Dist-tags must be isolated per package identifier and never applied globally across unrelated monorepo packages.

## 🔗 Related Units
- [GitFlow Protocol](gitflow-protocol.md)
- [Conventional Commits Protocol](conventional-commits.md)
- [GitHub CLI Protocol](github-cli-protocol.md)
- [QA Preview Environments](qa-preview-environments.md)
- [ArgoCD GitOps & Image Updater](../infrastructure/argocd-gitops-and-updater.md)
