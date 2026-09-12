---
name: ddl-schema-guard
description: Automated PostgreSQL DDL migration validation. TRIGGER when writing, altering, or reviewing database .sql schema files to enforce strictly lowercase table and column names, eliminate double quotes, and ensure timestamp timezone declarations.
---

# PostgreSQL DDL Schema Guard Skill (`ddl-schema-guard`)

This skill validates database migration scripts against strict lowercase and domain isolation naming standards.

## 🧭 Invocations

### 1. Audit DDL Migration File
```bash
bun run skills/ddl-schema-guard/scripts/lint-ddl.ts <path/to/schema.sql>
```
- Rejects quoted identifiers (`"userId"`).
- Rejects CamelCase column definitions.
- Warns on bare `TIMESTAMP` lacking `WITH TIME ZONE`.
