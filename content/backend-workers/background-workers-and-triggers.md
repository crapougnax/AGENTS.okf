---
type: pattern
title: Background Workers & Event Triggers (api-triggers)
description: Architecture for decoupled asynchronous background job processors, database triggers, and resilient event worker execution.
tags:
  - backend
  - workers
  - triggers
  - asynchronous
  - totalymage
timestamp: 2026-09-12T05:00:00.000Z
category: backend-workers
status: active
---

# Background Workers & Event Triggers (`api-triggers`)

Heavy tasks, notifications, media transcoding, and cross-system webhooks must execute asynchronously outside the HTTP request/response cycle.

## 🧭 Core Directives

### 1. Separation of Foreground & Background Workloads
- **Never block HTTP requests:** Foreground API endpoints must return immediate status (e.g. `202 Accepted`) and offload heavy processing to background workers.
- Services like Totalymage's `api-triggers` or queue consumers listen for published database change events or queue messages and execute jobs in isolation.

### 2. Idempotent Worker Handlers
- Workers must be strictly **idempotent**: processing the same event or message twice must yield the exact same outcome without creating duplicate records or sending duplicate notifications.
- Use unique message IDs or idempotency tokens stored in PostgreSQL or Redis to guard against duplicate executions.

### 3. Graceful Shutdown & Health Checks
- Background worker processes must listen to `SIGTERM` and `SIGINT` signals:
  1. Stop accepting new events from the queue.
  2. Finish processing active jobs within a grace period (e.g. 15–30 seconds).
  3. Close database and queue connections cleanly before exiting.
- Expose a lightweight HTTP health/liveness probe (`/healthz`) so orchestrators (Kubernetes) can monitor worker liveness.

## 🔗 Related Units
- [Queue & Event Streaming](/architecture/queue-and-event-streaming.md)
- [Backend API Architecture](/backend-workers/backend-api-architecture.md)
- [Kubernetes Manifests & Deployments](/infrastructure/k8s-manifests-and-deployments.md)
