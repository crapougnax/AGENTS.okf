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

### 3. Registry Dist-Tags & Pre-Release Lifecycle
- Package managers (NPM, GitHub Packages) distribute releases under standard ecosystem dist-tags:
  - **`latest`**: Production stable releases issued strictly from `main` (e.g. `@quatrain/core@1.2.20`).
  - **`beta`**: Active integration pre-releases issued strictly from `develop`. Every package published from `develop` **MUST** carry a SemVer pre-release mention (`-beta.N`, e.g. `@quatrain/core@1.2.20-beta.0`, incrementing to `-beta.1` on subsequent updates until merged to `main`).
  - **`prXX`**: Ephemeral on-demand QA preview releases generated from Pull Requests.
- Non-standard tags (such as `latest-dev`) are strictly avoided in favor of ecosystem-standard `beta`.
- Dist-tags must be isolated per package identifier and never applied globally across unrelated monorepo packages.

### 4. Version Increment Decision Matrix

The version increment **MUST** be determined based on the nature of changes being released, not arbitrarily chosen:

| Increment | Condition | Examples |
| :--- | :--- | :--- |
| **Patch** (`X.Y.Z+1`) | **Bugfixes only** — no new features, no API changes, no new files introducing new capabilities | Fix milestone sort order, fix regex false positive, correct typo in documentation |
| **Minor** (`X.Y+1.0`) | **New features or capabilities** — new scripts, new governance fiches, new configuration options, extended functionality | Add new skill, add new OKF content fiche, extend validator to cover new file types |
| **Major** (`X+1.0.0`) | **Breaking changes** — removed or renamed APIs, incompatible schema changes, dropped support for a major dependency | Restructure content directory hierarchy, change YAML frontmatter schema, rename mandatory fields |

> [!IMPORTANT]
> **When in doubt, always ask the user.** An AI agent MUST NOT unilaterally decide between minor and major bumps. Present the changelog summary and ask the user to confirm the appropriate increment level before tagging.

**Decision flow for AI agents:**
1. List all commits since the last tag: `git log $(git describe --tags --abbrev=0)..HEAD --oneline`
2. Classify each commit as `fix`, `feat`, `refactor`, `docs`, `chore`, etc.
3. If **any** commit is `feat` → minimum **minor** bump.
4. If **all** commits are `fix`/`docs`/`chore` → **patch** bump.
5. If **any** commit introduces breaking changes → **major** bump. Always confirm with user.
6. Present the classification to the user and request explicit approval of the version number.

## 🔗 Related Units
- [GitFlow Protocol](gitflow-protocol.md)
- [Conventional Commits Protocol](conventional-commits.md)
- [GitHub CLI Protocol](github-cli-protocol.md)
- [QA Preview Environments](qa-preview-environments.md)
- [ArgoCD GitOps & Image Updater](../infrastructure/argocd-gitops-and-updater.md)
