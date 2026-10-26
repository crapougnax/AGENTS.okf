---
type: standard
title: Code Style & Control Flow Blocks
description: Mandatory braces on every control-flow block, enforced by linters, so that code reads and diffs consistently regardless of who (human or agent) wrote it.
tags:
  - methodology
  - quality
  - code-style
  - linting
timestamp: 2026-10-26T05:45:00.000Z
category: methodology
status: active
---

# Code Style & Control Flow Blocks

Style choices are not left to the author's judgement, human or AI agent: they are fixed here and enforced by tooling.

## 🧭 Core Directives

### 1. Braces on Every Control-Flow Block
- **Always** wrap the body of `if`, `else`, `for`, `for…of`, `for…in`, `while` and `do…while` in braces, even when the body is a single statement or a `return` / `throw` / `continue`.
- No single-line brace-less forms, no "short guard clause" exception.

```typescript
// ❌ Forbidden
if (!value) return null
if (count > max) throw new Error('Too many items')
for (const item of items) process(item)

// ✅ Required
if (!value) {
   return null
}
if (count > max) {
   throw new Error('Too many items')
}
for (const item of items) {
   process(item)
}
```

- Ternaries and arrow-function expression bodies (`(x) => x * 2`) are expressions, not control-flow blocks, and stay allowed.
- The same rule applies to C/C++ firmware (`if`, `for`, `while`, `switch` cases with scoped declarations).

### 2. Enforce With Tooling, Not Reviews
- **TypeScript / JavaScript**: ESLint `curly: ["error", "all"]`, or Biome `style/useBlockStatements` at `error` level.
- **C / C++**: clang-tidy `readability-braces-around-statements`.
- Existing code is fixed with the tool's autofix (`eslint --fix`, `biome lint --write --unsafe` limited to that rule) in a dedicated `style:` commit, separate from functional changes.
