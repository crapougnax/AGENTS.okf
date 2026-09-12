---
type: standard
title: Test-Driven Development (TDD) & Test Co-Location
description: Mandatory testing hygiene requiring zero untested code, co-located unit tests, dedicated integration suites, and exclusion of test files from published packages.
tags:
  - testing
  - tdd
  - bun
  - npm
  - quality
timestamp: 2026-09-12T05:00:00.000Z
category: methodology
status: active
---

# Test-Driven Development (TDD) & Test Co-Location

Reliability is non-negotiable. Code that is not verified by automated tests does not exist in production.

## 🧭 Core Directives

### 1. Zero Untested Code
- **Never push untested logic:** All new business logic, domain methods, data parsers, and utility functions must have automated test coverage.
- **TDD Workflow:** Define expected behavior and interface contracts through tests first, then write the implementation until all assertions pass cleanly.

### 2. Unit Test Co-Location
- **Co-locate Unit Tests:** Unit test files (`*.test.ts` or `*.spec.ts`) must reside directly adjacent to their implementation file within `src/`:
  ```text
  packages/my-package/src/
  ├── MyService.ts
  └── MyService.test.ts          # ✅ Co-located unit test
  ```
- This structure enables fast navigation, atomic git diffs, and tight coupling during refactoring.

### 3. Dedicated Integration & E2E Suites
- Integration tests involving databases, network services, or multiple subsystems must be grouped in dedicated directories outside `src/` (e.g. `tests/` or `__tests__/` at the package or monorepo root level).

### 4. Clean Package Distribution (Publish Hygiene)
- To support native Bun, Deno, and Node environments, packages often distribute both compiled bundles and raw `src/` files.
- **Mandatory Exclusion on Publish:** Test files, mocks, fixtures, and runner configs must **never** leak into published registry bundles (NPM / GitHub Packages).
- Enforce strict exclusion via `.npmignore` and the `"files"` whitelist in `package.json`:
  ```ignore
  # .npmignore
  **/*.test.ts
  **/*.spec.ts
  **/__tests__/
  **/tests/
  **/mocks/
  jest.config.js
  ```

## 🔗 Related Units
- [SonarQube Quality Gates](/methodology/sonarqube-quality-gates.md)
- [Strict Typing & Interfaces](/architecture/strict-typing-and-interfaces.md)
