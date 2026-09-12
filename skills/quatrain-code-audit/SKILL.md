---
name: quatrain-code-audit
description: Validates TypeScript code examples in OKF markdown fiches against the real Quatrain Core and bradtech-oss package registries, catching incorrect import paths, non-existent packages, and wrong exported symbol names.
triggers:
  - import validation
  - code example audit
  - quatrain import
  - package name check
  - TypeScript example
  - code snippet
---

# Quatrain Code Example Audit Skill (`quatrain-code-audit`)

This skill extracts TypeScript and JavaScript code blocks from OKF markdown fiches and validates that all `import` statements reference packages that actually exist in the Quatrain Core and bradtech-oss monorepos.

## 🧭 Invocations

### 1. Audit All OKF Fiches
```bash
bun run skills/quatrain-code-audit/scripts/audit-imports.ts
```
- Scans all `.md` files under `content/` for fenced TypeScript/JavaScript code blocks.
- Extracts all `import { ... } from '...'` statements.
- Validates each package specifier against the known registry of real packages.
- Reports mismatches with file path, line number, and suggested correction.

### 2. Audit a Single Fiche
```bash
bun run skills/quatrain-code-audit/scripts/audit-imports.ts content/architecture/queue-and-event-streaming.md
```

## 📦 Known Package Registries

The script builds a registry from two sources:

1. **Quatrain Core** (`@quatrain/*`): All workspace packages in `../QUATRAIN/Core/packages/*/package.json`
2. **bradtech-oss** (`@bradtech/*`, `@bradtech-oss/*`): All workspace packages in `../BRAD2026/bradtech-oss/packages/*/package.json`

Any `import from '@quatrain/...'` or `import from '@bradtech/...'` that does not match a known package name will be reported as an error.

## ⚠️ Limitations

- This skill validates **package names** only, not individual exported symbols (class names, function names).
- Third-party imports (e.g. `dotenv`, `mqtt`) are skipped.
- Relative imports (`./`, `../`) are skipped.
