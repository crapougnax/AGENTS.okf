---
type: standard
title: Secrets & Environment Variable Management
description: Rules governing .env file conventions, secret confidentiality in logs and code, bootstrap fail-fast validation, and mandatory gitignore exclusions for AI agents and developers.
tags:
  - security
  - secrets
  - environment
  - configuration
  - fail-fast
timestamp: 2026-09-12T06:00:00.000Z
category: architecture
status: active
---

# Secrets & Environment Variable Management

Secrets must never leak into logs, version control, or agent outputs. Environment variables must be validated at bootstrap with fail-fast behavior.

## 🧭 Core Directives

### 1. File Naming Conventions

| File | Purpose | Committed? |
| :--- | :--- | :--- |
| `.env.dist` or `.env.example` | Template listing all required variable names with placeholder values or empty values | ✅ Yes — always committed |
| `.env` | Actual runtime values (may contain real secrets) | ❌ Never — must be in `.gitignore` |
| `.env.test` | Test environment values (no production credentials) | ⚠️ Case-by-case |

```bash
# .gitignore — mandatory entries
.env
.env.local
.env.*.local
*.pem
*.key
```

### 2. Zero Secret Leakage in Logs & Agent Outputs

**AI agents and developers MUST NEVER log, print, or display secret values.**

```typescript
// ❌ STRICTLY FORBIDDEN — leaks the actual secret value
console.log(`API key: ${process.env.STRIPE_SECRET_KEY}`);

// ✅ CORRECT — only checks presence, never reveals value
if (!process.env.STRIPE_SECRET_KEY) {
  throw new ConfigurationError('STRIPE_SECRET_KEY is not set.');
}
console.log(`STRIPE_SECRET_KEY: ${!!process.env.STRIPE_SECRET_KEY ? 'configured ✓' : 'MISSING ✗'}`);
```

The same rule applies to:
- `curl` commands displaying auth headers or tokens
- `kubectl get secret` outputs (use `-o jsonpath` carefully and never echo full decoded values)
- `docker inspect` outputs containing `ENV` blocks with secrets

### 3. Fail-Fast Bootstrap Validation

All required environment variables must be validated **before any service starts accepting connections**, throwing explicit, actionable errors:

```typescript
// ✅ Bootstrap validation pattern
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'JWT_SECRET',
  'SMTP_HOST',
] as const;

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(
      `[Bootstrap] Missing required environment variable: '${key}'. ` +
      `Check your .env file against .env.dist and update your deployment ConfigMap/Secret.`
    );
  }
}
```

**Zero implicit fallbacks** — the following pattern is strictly forbidden:
```typescript
// ❌ Silent fallback masks misconfiguration in staging/production
const apiUrl = process.env.API_URL || 'http://internal-service:8080';
```

### 4. Agent-Specific Obligations

When an AI agent encounters secrets-related tasks:

- **Reading `.env`**: Allowed for inspection. Must never echo secret values in its own responses.
- **Creating `.env.dist`**: Always use placeholder values (e.g. `STRIPE_SECRET_KEY=sk_live_REPLACE_ME`).
- **Suggesting values**: Only suggest non-sensitive defaults. For secrets, instruct the user to provide the value manually.
- **Committing secrets**: Immediately abort if any file added to a commit appears to contain live secret values. Check with: `git diff --cached | grep -E '(sk_live|pk_live|ghp_|Bearer |password\s*=)'`.

### 5. Kubernetes Secrets Hygiene

- Never commit raw Kubernetes `Secret` manifests containing base64-encoded values.
- Use **Sealed Secrets**, **External Secrets Operator**, or **Vault** for secrets at rest.
- When fetching secrets for debugging: `kubectl get secret <name> -o jsonpath='{.data.<key>}' | base64 -d` — use only in approved diagnostic contexts and never log the output.

## 🔗 Related Units
- [Fail-Fast Contracts & Configuration Validation](fail-fast-contracts.md)
- [Operational Permissions Matrix](../infrastructure/operational-permissions-matrix.md)
- [Containerfile & Podman Standards](../infrastructure/containerfile-and-podman.md)
