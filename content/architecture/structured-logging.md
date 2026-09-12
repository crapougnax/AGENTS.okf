---
type: standard
title: Structured Logging Standards (Backend & Queue Loggers)
description: Logging requirements deprecating raw console.log and enforcing structured log levels (info, warn, error, debug) with metadata.
tags:
  - logging
  - observability
  - quality
  - telemetry
timestamp: 2026-09-12T05:00:00.000Z
category: architecture
status: active
---

# Structured Logging Standards (Backend & Queue Loggers)

Observability and log aggregation require consistent, structured, contextual logging. Raw, unstructured console outputs compromise production log pipelines.

## 🧭 Core Directives

### 1. Deprecated Logging Methods
- **Prohibited:** Raw `console.log`, `console.warn`, and `console.error` are strictly prohibited in production code.
- **Legacy Deprecation:** `Backend.log()` is deprecated; use explicit severity levels instead.

### 2. Standard Structured Loggers
Use the dedicated structured loggers from `@quatrain/log` or `@quatrain/backend`:
- **`Backend.debug('...')`**: Fine-grained diagnostic information and developer traceability.
- **`Backend.info('...')`**: Normal lifecycle events (service started, batch finished, port opened).
- **`Backend.warn('...')`**: Non-blocking anomalies, fallback triggers, or recoverable network retries.
- **`Backend.error('...')`**: Unhandled exceptions, corrupted payloads, or connection losses.

### 3. Contextual Payloads
- Always attach structured metadata objects rather than concatenating strings:
  ```typescript
  // ❌ BAD
  Backend.info('User ' + userId + ' authenticated with method ' + method);

  // ✅ GOOD
  Backend.info('User authenticated successfully', {
    userId,
    authMethod: method,
    ipAddress: req.ip,
  });
  ```

### 4. Language Requirement
- All log messages **MUST** be written in International English.

## 🔗 Related Units
- [Queue & Event Streaming](/architecture/queue-and-event-streaming.md)
- [International English Standard](/methodology/international-english-standard.md)
