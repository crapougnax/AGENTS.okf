---
type: pattern
title: Queue & Event Streaming Architecture (@quatrain/queue-*)
description: Asynchronous message bus architecture using native AbstractQueueAdapter implementations and direct queue.listen() subscriptions.
tags:
  - architecture
  - queues
  - events
  - mqtt
  - redis
timestamp: 2026-09-12T05:00:00.000Z
category: architecture
status: active
---

# Queue & Event Streaming Architecture (`@quatrain/queue-*`)

Asynchronous communication between microservices, background processors, and telemetry collectors relies on standardized queue adapters extending `AbstractQueueAdapter`.

## 🧭 Core Directives

### 1. Standard Queue Adapters
- Always leverage native adapters provided by `@quatrain/queue-*` (e.g. `MosquittoQueueAdapter`, `RedisQueueAdapter`, `SQLiteQueueAdapter`).
- Every queue adapter implements `AbstractQueueAdapter`, exposing a consistent API across transports.

### 2. Event Consumption via `queue.listen()`
- Subscribe to topic streams directly using the standard `queue.listen()` signature without building redundant intermediate wrapper classes:
  ```typescript
  import { MosquittoQueueAdapter } from '@quatrain/queue-mqtt';
  import { Queue } from '@quatrain/queue';

  const queue = new MosquittoQueueAdapter({
    url: process.env.MQTT_BROKER_URL!,
    clientId: 'worker-order-processing',
  });

  await queue.listen('orders/+/created', async (topic, payload) => {
    Queue.info(`Received event on topic ${topic}`, { bytes: payload.length });
    await processOrderEvent(payload);
  });
  ```

### 3. Structured Event Logging
- Event queue workers must systematically log lifecycle events (connect, message received, ack, retry, error) using structured Quatrain logging (`Queue.info`, `Queue.warn`, `Queue.error`, `Queue.debug`).

## 🔗 Related Units
- [Structured Logging Standards](structured-logging.md)
- [Background Workers & Triggers](../backend-workers/background-workers-and-triggers.md)
- [Telemetry Ingestion Pipeline](../iot-embedded/telemetry-ingestion-pipeline.md)
