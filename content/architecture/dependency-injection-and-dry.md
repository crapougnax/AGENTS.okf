---
type: pattern
title: Dependency Injection (DI) & Maximal Factorization (DRY)
description: Principles for decoupling logic from infrastructure implementations via Dependency Injection and systematically refactoring duplicate logic.
tags:
  - architecture
  - di
  - dry
  - clean-code
timestamp: 2026-09-12T05:00:00.000Z
category: architecture
status: active
---

# Dependency Injection (DI) & Maximal Factorization (DRY)

Code reusability and architectural decoupling ensure that core domain logic remains independent of runtime adapters, cloud vendors, and transport protocols.

## 🧭 Core Directives

### 1. Dependency Injection (DI)
- Use Dependency Injection whenever a separation of concerns is needed between domain logic, persistence adapters, and deployment infrastructure.
- High-level business logic must depend on abstractions (interfaces), never on concrete third-party SDKs or database drivers:
  ```typescript
  // ✅ GOOD: Service receives interface, decoupled from AWS/GCP/MinIO
  export class DocumentService {
    constructor(private readonly storage: StorageAdapterInterface) {}

    public async store(id: string, payload: Buffer): Promise<void> {
      await this.storage.upload(`docs/${id}`, payload);
    }
  }
  ```

### 2. Don't Repeat Yourself (DRY)
- **Zero Copy-Paste:** Actively watch for duplicate logic across handlers, validators, or data mappers.
- Factorize reusable algorithms, validation pipelines, and transformations into shared domain functions or utility classes.
- If the same logic appears in two places, extract it immediately.

## 🔗 Related Units
- [Strict Typing & Interfaces](strict-typing-and-interfaces.md)
- [Fail-Fast Contracts & Configuration](fail-fast-contracts.md)
