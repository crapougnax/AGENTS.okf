---
type: standard
title: Generic Systems & Integrators
description: How an agent detects that a generic system and the use case driving it are being developed in parallel, models both explicitly, routes every requirement and artifact to its owner, and keeps the generic system free of the integrator's vocabulary and data.
tags:
  - architecture
  - genericity
  - boundaries
  - separation-of-concerns
  - agent-behavior
timestamp: 2026-10-26T08:20:00.000Z
category: architecture
status: active
---

# Generic Systems & Integrators

A generic system (library, engine, platform, service) is often built *through* a first concrete
use case: the integrator supplies the requirements, the test data and the demo. The two systems are
**connected but independent**. They usually carry different names, live in different repositories
and serve different audiences.

The recurring failure, especially for AI agents, happens **at planning time, not at review time**:
the integrator is the most concrete, most recent and most urgent context (a demo, a customer), so it
silently dictates names, fixtures, examples and issues of the generic system. Post-hoc checks catch
symptoms; this unit makes the agent **detect, model, route, then enforce** — in that order. Apply it
as a whole: partial application is how leaks happen.

---

## 🧭 Part 1 — Detect

The protocol is triggered as soon as **one** of these signals appears in a session:

| Signal | Example |
|---|---|
| Two differently named systems discussed together | an engine and the product that embeds it |
| Different namespaces, organisations or repositories | `@vendor/*` vs `@product/*`, `Platform/` vs `customer/` |
| Different licences or visibility | public AGPL package consumed by a private product |
| One system consumes the other | package dependency, HTTP API, shared manifest format |
| User vocabulary | "generic", "agnostic", "package", "engine", "integrate", "use case", "pilot", "for now we only need…" |

When a signal appears mid-task, stop and run Part 2 before the next edit.

---

## 🗺️ Part 2 — Model: the System Map

Before the first change, write down the System Map (in the session plan, then persisted as below):

| | Generic system (provider) | Integrator (consumer) |
|---|---|---|
| Name, repositories, namespace | | |
| Licence, visibility, audience | | |
| Owned vocabulary | neutral terms (`site`, `customer`, `document`) | business terms of the integrator |
| Forbidden vocabulary | every integrator term, name and dataset | — |
| Contract between them | API, types, manifest/file format | consumes it |
| Where the mapping lives | never here | always here (anti-corruption layer) |

- **Persist it** in each repository's `AGENTS.md`:
  - generic repository: `System role: generic provider`, its owned vocabulary and neutral example
    domain — **without naming any integrator**;
  - integrator repository: `System role: integrator`, an `Integrations` section listing the generic
    systems consumed and where the vocabulary mapping is implemented.
- Ask the user **one** question only if a role remains ambiguous after reading the repositories.

---

## 🧭 Part 3 — Route every requirement and artifact

### 3.1 The two-integrator test
For each requirement, ask: *"Would a second integrator, in a completely different domain, need this —
under this name?"*

| Answer | Destination |
|---|---|
| Yes | generic system, phrased in its neutral vocabulary |
| No | integrator only |
| Partly | neutral capability in the generic system + configuration or mapping in the integrator |

### 3.2 Artifact ownership

| Artifact | Generic system | Integrator |
|---|---|---|
| Code, types, API fields, directory layouts | neutral vocabulary | business vocabulary + mapping to the contract |
| Tests and fixtures | neutral domain (`acme`, `example.org`, generic content) | real data, smoke tests, demo data |
| README / HOWTO examples | neutral domain | integration guide |
| Issues | neutral capability | business need, linking the generic issue |
| Commit messages, PR bodies | no integrator name or need | free |
| Prompts, presets, evaluation sets | generic defaults only | integrator-specific |
| Infrastructure manifests | generic chart/recipe | tenant deployment |

### 3.3 Cross-system features
- A feature spanning both systems yields **two linked issues** (neutral generic issue; integrator
  issue referencing it) and **separate commits and PRs** per repository. Never one commit "for
  convenience" across both.
- Release order follows the dependency: generic release first, integrator bump second.

---

## 🛡️ Part 4 — Enforce

### 4.1 Fix leaks immediately
A leaked term in a public contract is fixed before the first release, even as a breaking change, and
the integrator is updated in the same session. Do not ask whether to fix it — fix it and report.

### 4.2 Agent pre-commit check (generic repository)
Scan the diff for: integrator names, integrator business vocabulary, real customer data,
integrator-language fixtures, integrator-specific prompts. Any hit is a defect.

### 4.3 Mechanical guards stay outside the generic repository
A deny-list of integrator terms committed **inside** the generic repository would itself disclose the
integrator. Guards therefore live outside it: in the integrator's CI, in a private configuration
repository, or in workstation-level hooks (setup recommendations will be provided by the platform
tooling).

---

## ✅ Checklist

1. Signals checked; System Map written and persisted in both `AGENTS.md`.
2. Every requirement passed the two-integrator test.
3. Every artifact is in the repository that owns it.
4. Generic diff free of integrator names, vocabulary and data.
5. Cross-system work split into linked issues, separate commits and PRs.

## 🔗 Related Units
- [Domain-Driven Design](domain-driven-design.md)
- [Dependency Injection & DRY](dependency-injection-and-dry.md)
- [Public Repository Confidentiality](../workflow/public-repository-confidentiality.md)
- [Branch Isolation & Topic Switch](../workflow/branch-isolation-and-topic-switch.md)
