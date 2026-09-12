---
type: standard
title: Code Documentation, JSDoc & Repository Guides
description: Strict documentation requirements mandating comprehensive JSDoc on all public symbols, plus README.md and HOWTO.md files for every domain package.
tags:
  - documentation
  - jsdoc
  - quality
  - onboarding
timestamp: 2026-09-12T05:00:00.000Z
category: methodology
status: active
---

# Code Documentation, JSDoc & Repository Guides

Code readability and developer experience depend on rigorous, synchronized documentation across packages and interfaces.

## 🧭 Core Directives

### 1. Zero Uncommented Code
- Every class, interface, method, helper function, and non-trivial constant must be accompanied by comprehensive docstrings.
- In TypeScript and JavaScript environments, format comments using structured **JSDoc blocks**:
  ```typescript
  /**
   * Hydrates a domain model instance from raw database attributes.
   *
   * @param attributes - Sanitized dictionary representing persisted columns.
   * @param options - Hydration options including relations eager loading.
   * @returns Strongly-typed domain model instance ready for business logic.
   * @throws {DomainValidationError} If required primary keys are missing or invalid.
   */
  public hydrate(attributes: RawAttributes, options?: HydrationOptions): ModelInstance {
    // ...
  }
  ```

### 2. Package Documentation: README & HOWTO
- Every standalone package or significant domain workspace must include:
  1. **`README.md`**: Provides a high-level overview, installation instructions, architecture scope, and public API export summary.
  2. **`HOWTO.md`**: Walkthrough demonstrating the most common usage scenarios, complete code examples, and troubleshooting tips.

### 3. Synchronization Rule
- When modifying an existing interface or method signature, you **MUST** update its JSDoc description, `@param` list, and corresponding usage guides immediately in the same git commit.

## 🔗 Related Units
- [International English Standard](international-english-standard.md)
- [Maintainability & 15-Year Horizon](maintainability-15-year-horizon.md)
