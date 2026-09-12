---
type: pattern
title: Local-First & 0ms Latency Data Architecture
description: Client architecture ensuring immediate local reads and writes via IndexedDB/SQLite with asynchronous background sync to cloud backends.
tags:
  - architecture
  - local-first
  - offline
  - performance
  - sync
timestamp: 2026-09-12T05:00:00.000Z
category: architecture
status: active
---

# Local-First & 0ms Latency Data Architecture

User productivity and field applications require 0ms visual latency, resilient offline operation, and opportunistic background synchronization.

## 🧭 Core Directives

### 1. Local Disk & Client Storage as Primary Source
- **Zero Network Delay on UI:** The primary read and write target for client interfaces is the local filesystem or browser database (IndexedDB, SQLite).
- User actions must commit immediately to local state and persist locally without blocking on remote HTTP round-trips.

### 2. Cache Bypass on Direct Read
- When inspecting files or records modified externally, inspect the underlying storage layer directly to ensure that file renames, edits, or additions are immediately reflected.

### 3. Opportunistic Background Synchronization
- Synchronization with upstream backends (PostgreSQL, Supabase) must operate asynchronously in the background.
- Temporary network drops or high-latency cellular connections must never freeze, disable, or impede the user interface.

## 🔗 Related Units
- [Finite State Machines & BPM](finite-state-machines.md)
- [Quatrain Repository Pattern](../backend-workers/quatrain-repository-pattern.md)
