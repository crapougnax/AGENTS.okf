---
type: pattern
title: Fail-Fast Contracts & Configuration Validation
description: Architectural contract enforcement requiring validation in abstract base class constructors and bootstrap failure on missing environment parameters.
tags:
  - architecture
  - fail-fast
  - configuration
  - contracts
timestamp: 2026-09-12T05:00:00.000Z
category: architecture
status: active
---

# Fail-Fast Contracts & Configuration Validation

Systems must fail immediately, loudly, and with actionable diagnostics rather than decaying into unpredictable runtime states.

## 🧭 Core Directives

### 1. Abstract Base Class Constructor Validation
- When an abstract class depends on configuration parameters (e.g. `bucketName`, `endpointUrl`, `timeoutMs`), parameter validation and error throwing **MUST** take place inside the abstract class's constructor, not in child implementations.
  ```typescript
  export abstract class AbstractStorageAdapter implements StorageAdapterInterface {
    protected readonly bucket: string;

    constructor(config: StorageConfig) {
      if (!config.bucket || config.bucket.trim() === '') {
        throw new ConfigurationError('AbstractStorageAdapter: "bucket" property is required and cannot be empty.');
      }
      this.bucket = config.bucket;
    }
  }
  ```

### 2. Zero Silent Hardcoded Fallbacks
- Never rely on implicit code fallbacks or internal cluster URLs:
  ```typescript
  // ❌ STRICTLY FORBIDDEN: Silent fallback masking configuration mistakes
  const apiUrl = process.env.API_URL || 'http://internal-cluster-service:8080';
  ```
- **Fail-Fast on Bootstrap:** Missing required environment variables must be caught during initialization, throwing an explicit error that identifies the missing key.
- All infrastructure parameters must be declared explicitly in deployment files (ConfigMaps, Secrets, `.env.dist`).

## 🔗 Related Units
- [Strict Typing & Interfaces](/architecture/strict-typing-and-interfaces.md)
- [Containerfile & Podman Standards](/infrastructure/containerfile-and-podman.md)
