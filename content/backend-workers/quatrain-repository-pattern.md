---
type: pattern
title: Quatrain Repository Pattern & Model Definitions
description: Rules for defining persisted entities using .TYPE constants, camelCase relation properties, Core.addClass registry, and soft-delete filtering.
tags:
  - quatrain
  - repository
  - models
  - persistence
  - orm
timestamp: 2026-09-12T05:00:00.000Z
category: backend-workers
status: active
---

# Quatrain Repository Pattern & Model Definitions

Applications built on the Quatrain ecosystem declare domain entities using strongly-typed property schemas and access persistence through pre-bound repositories.

## 🧭 Core Directives

### 1. Model Property Definitions (`PROPS_DEFINITION`)
- Always use the static `.TYPE` properties from imported property classes. Never use raw string literals.
  ```typescript
  // ❌ BAD
  export const UserModelDef = [
    { name: 'isActive', type: 'BooleanProperty' }
  ];

  // ✅ GOOD
  import { BooleanProperty, StringProperty } from '@quatrain/core';

  export const UserModelDef = [
    { name: 'isActive', type: BooleanProperty.TYPE },
    { name: 'email', type: StringProperty.TYPE },
  ];
  ```

### 2. Relational Property Naming
- Properties referencing another model must be named exactly as the **camelCase** version of the target model's class name, without any `"Id"` or `"_id"` suffix:
  ```typescript
  // ❌ BAD
  { name: 'organizationId', type: ObjectProperty.TYPE, instanceOf: 'Organization' }

  // ✅ GOOD
  { name: 'organization', type: ObjectProperty.TYPE, instanceOf: 'Organization' }
  ```

### 3. Circular Reference Resolution (`Core.addClass`)
- Register every model class inside Quatrain's central registry at the bottom of the model file to allow circular relationships to resolve cleanly at runtime:
  ```typescript
  import { Core, PersistedBaseObject } from '@quatrain/core';

  export class Invoice extends PersistedBaseObject { /* ... */ }

  Core.addClass('Invoice', Invoice);
  ```

### 4. Repository Access & Soft-Deletes
- Retrieve the pre-bound repository instance via `Model.repository()`:
  ```typescript
  const invoiceRepo = Invoice.repository();
  const invoice = await invoiceRepo.read('inv-2026-001');
  ```
- **Soft Delete Handling:** Quatrain sets `status = 'deleted'` upon `.delete()`. When running manual raw queries outside the repository, explicitly filter out deleted items (`filters: { 'status:neq': 'deleted' }`).

## 🔗 Related Units
- [PostgreSQL DDL & Naming Standards](/backend-workers/postgresql-ddl-and-naming.md)
- [Headless Controllers & MVC Separation](/backend-workers/headless-controllers-and-mvc.md)
