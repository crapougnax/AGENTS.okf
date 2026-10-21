---
type: standard
title: Code Serves Data — Zero Hardcoded Business Data
description: Fundamental engineering rule mandating that code must strictly serve business data and never substitute for missing data with hardcoded hacks or arbitrary heuristics.
tags:
  - methodology
  - architecture
  - quality
  - data-integrity
  - fail-fast
timestamp: 2026-10-21T07:22:00.000Z
category: methodology
status: active
---

# Code Serves Data — Zero Hardcoded Business Data

> **Pillar**: I. Usine Logicielle (Software Factory & Development)  
> **Category**: Methodology & Quality Standards  
> **Cardinal Principle**: *The code serves the data; it never substitutes for it.*

---

## 🧭 Core Axiom: Code Serves Data

Code is an execution engine designed to manipulate, validate, transform, and project business data. **Under no circumstances may code substitute for missing, incomplete, or corrupted business data through hardcoded workarounds, magic strings, or artificial heuristics.**

When business data is missing from the database, API, or domain model, **you must STOP immediately**:
1. **HALT**: Do not invent fallback values, magic IDs, hardware name regexes, or fake database records directly in application code.
2. **ANALYZE**: Identify the exact domain gap — which table, schema, DDL migration, seed data, or API contract is missing the required fields or records.
3. **PROPOSE**: Frame actionable solutions (e.g., DDL migration to add missing columns, SQL backfill migration, configuration schema updates, or operational data entry).
4. **RESOLVE AT SOURCE**: Fix the data model and populate the authoritative data store first before writing the code that consumes it.

---

## 🛑 Prohibited Anti-Patterns (The "Code Hacks" Trap)

| Anti-Pattern | Why It Is Dangerous | Correct Architecture Pattern |
| :--- | :--- | :--- |
| **Hardcoding Domain Entities in Code** (e.g. `if (device.name === 'device-sample-01') return 'operator-a'`) | Fragile, unmaintainable, introduces phantom domain logic outside the database, breaks multi-tenancy, and fails as soon as an entity is renamed or added. | Store explicit attribution in the authoritative database column (e.g. `devices.operator = 'operator-a'`). |
| **Heuristic Fallbacks for Missing Columns** (e.g. guessing an operator, role, or tier from entity name prefixes) | Silent failures, inaccurate state transitions, unpredictable edge cases in production. | Enforce fail-fast contracts: if the data is required, validate its presence and fail immediately with an actionable error. |
| **Hardcoded UUIDs in Business Logic** (e.g. `if (id === '00000000-0000-0000-0000-000000000001')`) | Bypasses database constraints and relationships, opaque to other developers and audits. | Reference static domain adapter constants or resolve foreign keys through the domain repository. |
| **"Temporary" Quick-Fixes to Pass Tests** | Technical debt that lingers for years, masking fundamental database schema deficiencies. | Fix the test fixtures or database migrations to provide the required domain data. |

---

## 🔒 Confidentiality & Generic Didactic Examples

To protect privacy and ensure universal readability:
- **Zero Real-World Data in Examples:** Never use real customer names, live infrastructure hostnames, production serial numbers, or actual production UUIDs in documentation, tests, or rule files.
- **Fictional & Accessible Identifiers:** Always use generic, didactic placeholders (e.g. `gateway-alpha-01`, `probe-site-a`, `tenant-example`, `00000000-0000-0000-0000-000000000001`). Real-world values create privacy leaks and confuse developers unfamiliar with specific client deployments.

---

## 📋 The 4-Step Protocol for Missing Business Data

When an AI coding agent or human engineer discovers that business data required for a feature is absent:

### Step 1: Immediate Stop & Diagnostic
- Do **NOT** write an `if (obj.field === undefined) { /* hardcoded fallback */ }` that embeds specific business instances.
- Quantify the extent of the missing data:
  - Is the column missing from the schema (DDL)?
  - Is the column present but `NULL` across existing rows?
  - Are foreign key reference records missing from reference tables?

### Step 2: Gap Analysis & Technical Assessment
- Document clearly:
  - What the domain model expects.
  - What the current database or API provides.
  - Why the absence of this data blocks clean implementation.

### Step 3: Propose Remediation Strategies
Present explicit architectural solutions:
- **Solution A: Schema Migration (DDL)** — Add the missing column with appropriate constraints (e.g. `NOT NULL`, foreign keys, defaults).
- **Solution B: Data Backfill Script** — Write a one-time migration script (e.g. `scripts/migrate-*.ts`) to populate the authoritative database rows with correct business values.
- **Solution C: Admin / Provisioning UI Update** — Ensure creation forms and APIs mandate the field on future insertions.

### Step 4: Validate Data-First, Code-Second
- Execute the migration or obtain human confirmation for data updates.
- Write clean, generic, declarative code that consumes the authoritative data fields without any specific hardcoded values.

---

## 🔗 Related Standards
- [Long-Term Maintainability & 15-Year Horizon](maintainability-15-year-horizon.md)
- [Public Repository Confidentiality](../workflow/public-repository-confidentiality.md)
- [Fail-Fast Contracts](../architecture/fail-fast-contracts.md)
- [PostgreSQL DDL & Naming Standards](../backend-workers/postgresql-ddl-and-naming.md)
- [Quatrain Repository Pattern](../backend-workers/quatrain-repository-pattern.md)
