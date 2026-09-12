---
type: standard
title: Strict Typing, Interfaces & Zero-Any Policy
description: Rules enforcing strict TypeScript typing, exported interface contracts with *Interface suffix, zero unused variables, and total prohibition of as any.
tags:
  - typescript
  - typing
  - quality
  - interfaces
timestamp: 2026-09-12T05:00:00.000Z
category: architecture
status: active
---

# Strict Typing, Interfaces & Zero-Any Policy

Type safety is a structural requirement. Type assertions and compiler bypasses compromise codebase integrity and undermine refactoring.

## 🧭 Core Directives

### 1. Total Prohibition of Type Bypasses
- **Zero `as any`:** Never use `as any`, `(value as any)`, or arbitrary casts to silence compiler errors.
- **Zero Suppression Directives:** `@ts-ignore` and `@ts-nocheck` are strictly prohibited. Construct strongly-typed objects that satisfy the target schemas.

### 2. Exported Interfaces & Naming Convention
- **Accessible Types:** Every interface must be exported so that external consumers, adapters, and packages can import and rely on it cleanly.
- **Interface Suffix:** Interfaces must use the `*Interface` suffix convention (e.g. `StorageAdapterInterface`, `QueueAdapterInterface`).
- **Zero Hungarian Notation:** Never use the `I...` prefix (e.g. ❌ `IStorageAdapter`).

### 3. Zero TypeScript Errors Policy & TS6133
- A development task is never complete until `tsc` compiles with **zero errors**.
- **Unused Imports & Variables (`TS6133`):** Unused symbols are treated as errors. Systematically clean up all imports post-refactoring.

### 4. Explicit Variable Initialization
- Never declare uninitialized variables without an explicit type:
  ```typescript
  // ❌ BAD
  let record;
  // ✅ GOOD
  let record: UserRecord | null = null;
  ```

## 🔗 Related Units
- [Fail-Fast Contracts & Configuration](/architecture/fail-fast-contracts.md)
- [SonarQube Quality Gates](/methodology/sonarqube-quality-gates.md)
