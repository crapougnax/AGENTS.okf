---
name: k8s-guard
description: Safe, non-destructive Kubernetes diagnostics and triage. TRIGGER when auditing pod health, investigating crashes (CrashLoopBackOff, OOMKilled), checking warning events, or safely tailing container logs across staging and production clusters.
---

# Kubernetes Guard Skill (`k8s-guard`)

This skill provides fast, non-destructive, read-only diagnostic tools for inspecting live Kubernetes clusters safely without risk of accidental mutations.

## 🧭 Invocations

### 1. Cluster & Namespace Health Triage
```bash
bun run skills/k8s-guard/scripts/triage.ts [namespace]
```
- Summarizes pod statuses, container readiness, and restart counts.
- Highlights crashing pods (`CrashLoopBackOff`, `Error`, `OOMKilled`).
- Fetches the last 10 critical warning events in the namespace.
- Displays ingress routes, hostnames, and IP bindings.

### 2. Safe Log Streaming
```bash
bun run skills/k8s-guard/scripts/safe-logs.ts <pod-or-deployment> [namespace] [tail-lines]
```
- Safely streams logs without risking terminal buffer exhaustion (defaults to 100 lines).
- Supports targeting pods or deployments directly.
