---
type: pattern
title: Domain-Driven Design (DDD) & Domain Isolation
description: Architecture standard governing the decomposition of applications into autonomous business capability domain units with strict isolation.
tags:
  - architecture
  - ddd
  - patterns
  - domains
timestamp: 2026-09-12T05:00:00.000Z
category: architecture
status: active
---

# Domain-Driven Design (DDD) & Domain Isolation

Applications must be decomposed into logical domain units representing cohesive business capabilities rather than generic technical layers.

## 🧭 Core Directives

### 1. Bounded Contexts & Domain Units
- Every significant business capability belongs to an isolated domain (e.g. `billing`, `inventory`, `identity`, `telemetry`).
- Cross-domain interactions must be performed via strongly typed domain services, events, or repository interfaces, never by reaching directly into another domain's private internal state.

### 2. Ubiquitous Language
- Symbol names, class identifiers, and method signatures must mirror the business language understood by domain experts.
- Avoid artificial technical suffixes (e.g. `DataHolder`, `Manager`, `Helper`) in favor of clear domain semantics (`Invoice`, `SubscriptionTracker`, `OrderValidator`).

### 3. Isolation of Schema & Migrations
- Each domain concept owns its dedicated database tables and DDL migration scripts.
- No shared ambiguous multi-tenant tables where domains overlap indiscriminately.

## 🔗 Related Units
- [Strict Typing & Interfaces](/architecture/strict-typing-and-interfaces.md)
- [PostgreSQL DDL & Naming Standards](/backend-workers/postgresql-ddl-and-naming.md)
- [Quatrain Repository Pattern](/backend-workers/quatrain-repository-pattern.md)
