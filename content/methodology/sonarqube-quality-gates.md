---
type: standard
title: SonarQube Code Quality & Linter Compliance
description: Static code analysis rules enforcing radix parsing, accessibility semantics, defensive process execution, and elimination of object literals in default parameters.
tags:
  - sonarqube
  - linter
  - security
  - typescript
timestamp: 2026-09-12T05:00:00.000Z
category: methodology
status: active
---

# SonarQube Code Quality & Linter Compliance

All code committed across monorepos and packages must pass automated quality gates (SonarQube, ESLint, TypeScript compiler) with zero warnings or security hotspots.

## 🧭 Core Directives

### 1. Number Utilities & Explicit Radix
- Always prefer `Number.parseInt` over global `parseInt`, specifying the radix explicitly:
  ```typescript
  // ❌ BAD
  const port = parseInt(process.env.PORT);
  // ✅ GOOD
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  ```
- Always prefer `Number.isNaN` over global `isNaN` to prevent silent type coercion bugs:
  ```typescript
  // ❌ BAD
  if (isNaN(value)) { /* ... */ }
  // ✅ GOOD
  if (Number.isNaN(value)) { /* ... */ }
  ```

### 2. Default Parameters & Object Literals (`typescript:S7737`)
- Never use an object literal as a default parameter value in function or method signatures:
  ```typescript
  // ❌ BAD: Recreates a new object reference on every invocation
  public async search(query: string, options: QueryOptions = {}) { /* ... */ }

  // ✅ GOOD: Parameter is optional or undefined, initialized defensively
  public async search(query: string, options?: QueryOptions) {
    const opts = options ?? {};
    // ...
  }
  ```

### 3. Interactive Elements & HTML5 Accessibility (`typescript:S6848`)
- Non-interactive DOM elements (`<div>`, `<span>`, `<td>`) must never be assigned interactive handlers (`onClick`, `onKeyDown`) unless they are converted to appropriate native interactive tags (e.g. `<button>`).
- If an element must remain non-native, provide an explicit WAI-ARIA `role`, a valid `tabIndex={0}`, and handle keyboard events (`Enter`, `Space`).

### 4. Secure Process Execution (`shell: false`)
- When invoking Node.js/Bun `child_process` methods (`spawn`, `exec`, `spawnSync`), explicitly set `{ shell: false }` to prevent command injection vulnerabilities.

## 🔗 Related Units
- [Test-Driven Development (TDD)](tdd-and-test-co-location.md)
- [Strict Typing & Interfaces](../architecture/strict-typing-and-interfaces.md)
