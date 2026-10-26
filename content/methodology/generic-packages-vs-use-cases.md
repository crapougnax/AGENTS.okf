---
type: standard
title: Generic Packages vs. Driving Use Cases
description: A generic package developed and validated through one specific use case must stay free of that use case's vocabulary, data and assumptions; the integration lives on the integrator's side.
tags:
  - methodology
  - architecture
  - genericity
  - boundaries
timestamp: 2026-10-26T06:05:00.000Z
category: methodology
status: active
---

# Generic Packages vs. Driving Use Cases

A generic package is often built *through* a first concrete use case: the use case supplies the
requirements, the test data and the demo. The two subjects are **connected but independent**.
The recurring failure, especially for AI agents, is letting the use case leak into the package.

## 🧭 Core Directives

### 1. The package owns a neutral vocabulary
- Concepts, type names, fields, API parameters, directory layouts and error messages use the
  package's own neutral terms (e.g. `site`, `customer`, `document`), never the integrator's
  business terms (e.g. `farm`, `plot`, `patient`).
- Before naming anything in the package, ask: *would this name still make sense for a completely
  different integrator?* If not, find the neutral term.

### 2. Neutral fixtures, examples and docs
- Tests, fixtures, README/HOWTO examples, issues and commit messages use a neutral domain
  (`acme`, `example.org`, generic maintenance/safety content), never the integrator's real data,
  language, customers or product names.
- The integrator's real data is used only in the integrator's repository (smoke tests, demos).

### 3. Mapping lives on the integrator's side
- The integrator keeps its own vocabulary and maps it to the package contract in its own code,
  with the mapping documented there (e.g. "one farm = one site").
- Integrator-specific features, prompts, presets and evaluation sets are tracked in the
  integrator's repositories, not in the package's issue tracker.

### 4. Fix leaks immediately, as breaking changes if needed
- A leaked term in a public contract is fixed before the first release, even if it breaks callers;
  the cost only grows afterwards. Do not ask whether to fix it — fix it and update the integrator.

## ✅ Agent Pre-Commit Check
On every commit to a generic package, scan the diff for integrator names, business vocabulary,
real customer data and integrator-language fixtures. Any hit is a defect.

## 🔗 Related Units
- [Domain-Driven Design](../architecture/domain-driven-design.md)
- [Public Repository Confidentiality](../workflow/public-repository-confidentiality.md)
- [Code Documentation, JSDoc & Repository Guides](documentation-and-jsdoc.md)
