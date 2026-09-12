# Journal Index — AGENTS.okf

Session logs, release changelogs, and architectural decision records for the AGENTS.okf knowledge base.

Entries are ordered reverse-chronologically (newest first). Each entry follows the OKF v0.1 frontmatter format with mandatory `version` and `pr` fields when applicable.

---

## Releases

| Version | Date | Entry | Summary |
| :--- | :--- | :--- | :--- |
| **v1.2.0** | 2026-09-12 | [v1.2.0 — IoT/LoRaWAN, Code Audit & Compliance](2026-09-12-v1.2.0-iot-lorawan-code-audit-compliance.md) | 4 IoT/LoRaWAN fiches, quatrain-code-audit skill (95 packages), proprietary name guards, import path fixes |
| **v1.1.0** | 2026-09-12 | [v1.1.0 — Operational Skills, Governance & Bug Fixes](2026-09-12-v1.1.0-operational-skills-and-governance.md) | 4 operational skills, secrets fiche, permissions §H, version increment matrix, 4 script bug fixes, journal system |
| **v1.0.0** | 2026-09-12 | [v1.0.0 — Knowledge Base Initialisation](2026-09-12-v1.0.0-knowledge-base-initialisation.md) | 45 atomic OKF content units, validation/build/sync tooling, automated test suite, agent entry points |

---

## Entry Format

Each journal entry uses the following OKF frontmatter fields:

```yaml
---
type: session-log
title: "vX.Y.Z — Short description"
description: One-line summary.
tags: [release, ...]
timestamp: ISO-8601
category: journal
status: published
pr: https://github.com/crapougnax/AGENTS.okf/pull/N   # if applicable
version: X.Y.Z
---
```

Entries must include:
1. **📝 Actions Performed** — exhaustive list of changes
2. **🧪 Verification & Stability Audit** — test results, build status
3. **📋 Changelog** — grouped by Features / Bug Fixes / Documentation
4. **🔗 Referenced Specifications** — links to relevant OKF units
5. **🔮 Known Issues** *(optional)* — tracked issues for follow-up
