---
type: standard
title: Conventional Commits & Atomic Commit Standards
description: Semantic commit formatting guidelines mandating conventional commit prefixes, atomic change scopes, and explicit issue closing references.
tags:
  - git
  - commits
  - semver
  - workflow
timestamp: 2026-09-12T05:00:00.000Z
category: workflow
status: active
---

# Conventional Commits & Atomic Commit Standards

Git commit history provides the chronological, auditable record of software evolution. All commits must be descriptive, atomic, and properly structured.

## 🧭 Core Directives

### 1. Semantic Commit Format
Every commit message must follow the Conventional Commits specification:
```text
<type>(<scope>): <short description in present imperative> (#<issue>)

[optional body providing technical context and rationale]

[optional footer: Closes #<issue>]
```

Supported types:
- `feat`: A new user-facing or API feature.
- `fix`: A bug fix or defect correction.
- `refactor`: Code restructuring without changing behavior.
- `perf`: Performance optimization.
- `security`: Vulnerability resolution or permission hardening.
- `test`: Adding or correcting tests without production code changes.
- `docs`: Documentation, README, or JSDoc updates.
- `chore`: Tooling, dependency bumps, or CI/CD configuration.

### 2. Atomic Commits
- Commit at each validated logical milestone.
- Do not accumulate large, multi-file monolithic changes that mix unrelated fixes, features, or formatting adjustments.
- A commit must compile cleanly and pass tests on its own.

### 3. Strict International English
- All commit titles and descriptions **MUST** be written in International English.

## 🔗 Related Units
- [GitHub CLI Protocol](/workflow/github-cli-protocol.md)
- [GitFlow Protocol](/workflow/gitflow-protocol.md)
