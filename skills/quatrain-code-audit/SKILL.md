---
name: quatrain-code-audit
description: Validates TypeScript code examples in OKF markdown fiches against the Quatrain Core, CoreUX, and bradtech-oss package registries using a committed static registry. No local monorepo checkout required at audit time.
triggers:
  - import validation
  - code example audit
  - quatrain import
  - package name check
  - TypeScript example
  - code snippet
---

# Quatrain Code Example Audit Skill (`quatrain-code-audit`)

This skill extracts TypeScript and JavaScript code blocks from OKF markdown fiches and validates that all `import` statements reference packages that actually exist in the Quatrain and bradtech ecosystems.

## 🧭 Invocations

### 1. Audit All OKF Fiches
```bash
bun run skills/quatrain-code-audit/scripts/audit-imports.ts
```
- Scans all `.md` files under `content/` for fenced TypeScript/JavaScript code blocks.
- Extracts all `import { ... } from '...'` statements.
- Validates each package specifier against the committed `known-packages.json` registry.
- Reports mismatches with file path, line number, and suggested correction.

### 2. Audit a Single Fiche
```bash
bun run skills/quatrain-code-audit/scripts/audit-imports.ts content/architecture/queue-and-event-streaming.md
```

### 3. Refresh the Package Registry
```bash
bun run skills/quatrain-code-audit/scripts/update-registry.ts
```
Run this when packages are added, removed, or renamed in the source monorepos. Requires local checkout of:
- `Quatrain/Core` (70 `@quatrain/*` packages)
- `Quatrain/CoreUX` (13 `@quatrain/ux-*` packages)
- `bradtech-oss` (12 `@bradtech/*` packages)

Override paths with env vars: `QUATRAIN_CORE_PATH`, `QUATRAIN_COREUX_PATH`, `BRADTECH_OSS_PATH`.

## 📦 Architecture

```
skills/quatrain-code-audit/
├── SKILL.md                          # This file
├── known-packages.json               # Static registry (committed, 95 packages)
└── scripts/
    ├── audit-imports.ts              # Reads known-packages.json, validates fiches
    └── update-registry.ts            # Scans local monorepos → regenerates JSON
```

**Key design:** The audit script (`audit-imports.ts`) reads only the committed `known-packages.json` file — it has **zero dependency on local monorepo checkouts**. This means it works on CI, on other developers' machines, and in any environment where the AGENTS.okf repo is cloned.

The registry updater (`update-registry.ts`) is a separate maintenance script that scans local monorepo directories and regenerates the JSON. Run it periodically when the ecosystem evolves.

## ⚠️ Limitations

- Validates **package names** only, not individual exported symbols (class names, function names).
- Third-party imports (e.g. `dotenv`, `mqtt`) are skipped.
- Relative imports (`./`, `../`) are skipped.
- Only `@quatrain/*` and `@bradtech*` scoped imports are validated.
