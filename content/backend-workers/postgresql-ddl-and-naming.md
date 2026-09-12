---
type: standard
title: PostgreSQL DDL Migrations & Lowercase Naming Standards
description: Rules for database schemas requiring domain isolation via .sql DDL files, and strictly lowercase table and column names without quotes.
tags:
  - postgresql
  - database
  - sql
  - ddl
  - schema
timestamp: 2026-09-12T05:00:00.000Z
category: backend-workers
status: active
---

# PostgreSQL DDL Migrations & Lowercase Naming Standards

Database schemas must remain clean, predictable, and fully portable across SQL clients without relying on quoted identifiers.

## 🧭 Core Directives

### 1. Dedicated DDL `.sql` Files per Domain Concept
- Every domain concept owns its dedicated PostgreSQL table defined via a clean DDL `.sql` migration file.
- Migrations must be version-controlled, reproducible, and idempotent where appropriate (`CREATE TABLE IF NOT EXISTS`).

### 2. Strictly Lowercase Identifiers (Zero CamelCase)
- **Tables and Column Names:** All table names and column names **MUST** be strictly lowercase:
  ```sql
  -- ❌ BAD: CamelCase and quoted identifiers
  CREATE TABLE "UserAccounts" (
    "userId" VARCHAR(64) PRIMARY KEY,
    "lastSeenAt" TIMESTAMP WITH TIME ZONE
  );

  -- ✅ GOOD: Strictly lowercase
  CREATE TABLE user_accounts (
    user_id VARCHAR(64) PRIMARY KEY,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- Never use double quotes around column or table names in SQL files.
- In single-word compound columns, concatenate or use underscores (`lastseenat` or `last_seen_at`), never CamelCase.

### 3. Primary Keys & Timestamp Hygiene
- Use UUID or prefixed textual IDs (e.g. `usr_...`) for distributed scalability.
- Explicitly store timestamps with time zones: `TIMESTAMP WITH TIME ZONE` (or `TIMESTAMPTZ`).

## 🔗 Related Units
- [Quatrain Repository Pattern](quatrain-repository-pattern.md)
- [Backend API Architecture](backend-api-architecture.md)
