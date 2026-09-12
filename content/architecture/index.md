# Category Index: Architecture & Design Patterns

This category covers structural software design patterns, typing standards, fail-fast contracts, state machines, queues, and logging conventions.

## Documents

* [Domain-Driven Design (DDD) & Domain Isolation](domain-driven-design.md) - Decomposition into cohesive business domain units with isolated schemas.
* [Strict Typing, Interfaces & Zero-Any Policy](strict-typing-and-interfaces.md) - Strict TypeScript rules, exported interfaces (*Interface suffix), and elimination of as any.
* [Fail-Fast Contracts & Configuration Validation](fail-fast-contracts.md) - Constructor validation in abstract classes and early failure on missing environment variables.
* [Secrets & Environment Variable Management](secrets-and-env-management.md) - .env file conventions, zero secret leakage in logs, bootstrap validation, and Kubernetes secrets hygiene.
* [Finite State Machines & BPM Modeling](finite-state-machines.md) - Declarative process lifecycles and business process state machines.
* [Dependency Injection (DI) & Maximal Factorization (DRY)](dependency-injection-and-dry.md) - Decoupling logic from adapters and rigorous elimination of code duplication.
* [Queue & Event Streaming Architecture (@quatrain/queue-*)](queue-and-event-streaming.md) - Asynchronous event buses using AbstractQueueAdapter and queue.listen().
* [Structured Logging Standards (Backend & Queue Loggers)](structured-logging.md) - Structured log levels, deprecation of raw console.log, and metadata payload hygiene.
* [Local-First & 0ms Latency Data Architecture](local-first-architecture.md) - Local IndexedDB/SQLite storage with asynchronous background synchronization.
