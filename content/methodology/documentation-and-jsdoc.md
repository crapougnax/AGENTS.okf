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
- Every class, interface (**including each property**), type alias, enum, method, constructor, helper function (including named arrow functions and private helpers), and non-trivial constant must be accompanied by comprehensive docstrings.
- Every block states a description, then `@param` for each parameter (destructured props as `@param props.<name>`), `@returns` for every non-void function, and `@throws` for every error the caller may receive.
- Prefer named, documented interfaces over inline object types (`{ a: string; b: number }`) in signatures and properties: inline types cannot carry per-field documentation.
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

### 4. Mechanical Enforcement
- Documentation is a quality gate, not a review comment. TypeScript repositories enforce it with `eslint-plugin-jsdoc` in CI (tests excluded):
  ```javascript
  // eslint.config.mjs — JSDoc rules only; style rules live in the formatter/linter of the repository.
  rules: {
     'jsdoc/require-jsdoc': ['error', {
        publicOnly: false,
        require: { FunctionDeclaration: true, MethodDefinition: true, ClassDeclaration: true },
        contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSEnumDeclaration', 'TSPropertySignature',
                   'VariableDeclaration > VariableDeclarator > ArrowFunctionExpression'],
     }],
     'jsdoc/require-description': ['error', { contexts: ['any'] }],
     'jsdoc/require-param': 'error',
     'jsdoc/require-returns': 'error',
     'jsdoc/require-throws': 'error',
     'jsdoc/check-param-names': 'error',
     'jsdoc/no-types': 'error',
  }
  ```
- Legacy repositories without the gate: AI agents **MUST** still lint the files they create or modify (scoped run) and leave zero JSDoc findings in their diff.

### 5. Agent Pre-Commit Checklist
Before every commit, an AI agent verifies on its own diff:
1. Every new or modified symbol has a JSDoc block with description, `@param`, `@returns`, `@throws`.
2. Every new package has `README.md` and `HOWTO.md`; existing guides reflect the change.
3. The JSDoc lint (or the scoped run) reports zero findings.

## 🔗 Related Units
- [International English Standard](international-english-standard.md)
- [Maintainability & 15-Year Horizon](maintainability-15-year-horizon.md)
- [Code Style & Control Flow](code-style-and-control-flow.md)
