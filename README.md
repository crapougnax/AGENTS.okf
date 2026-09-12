# AGENTS.okf — Modular AI Agent Standards in Open Knowledge Format (OKF v0.1)

[![Format: OKF v0.1](https://img.shields.io/badge/format-OKF%20v0.1-blue.svg)](https://okf.md/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-green.svg)](LICENSE)
[![Engine: Bun](https://img.shields.io/badge/Runtime-Bun%20v1.3+-orange.svg)](https://bun.sh/)
[![Content: 50 fiches](https://img.shields.io/badge/Content-50%20fiches-purple.svg)](#-content-categories)
[![Skills: 6](https://img.shields.io/badge/Skills-6%20operational-teal.svg)](#-operational-skills)

**AGENTS.okf** is the centralized, modular knowledge base containing development philosophy, architecture standards, UI/UX ergonomics, and GitFlow protocols for human developers and autonomous AI coding agents (Antigravity, Claude Code, Cursor, Gemini).

Structured strictly according to the **Open Knowledge Format (OKF v0.1)**, it replaces monolithic rule files with atomic, self-contained units that agents discover on demand (**Progressive Disclosure**).

---

## 🧭 Repository Structure

```text
AGENTS.okf/
├── AGENTS.md                                 # Universal entrypoint for AI coding agents
├── README.md                                 # Human developer documentation and import guides
├── package.json                              # Bun scripts (validate, build, sync-gist)
├── .journal/                                 # Session logs & release changelogs (OKF format)
├── bin/
│   ├── validate.ts                           # OKF v0.1 schema, link checker & compliance guards
│   ├── build.ts                              # Compiles all units into a consolidated Markdown bundle
│   └── sync-gist.ts                          # Synchronizes updates with the personal GitHub Gist
├── content/
│   ├── index.md                              # Root OKF index
│   ├── methodology/                          # 15-year horizon, TDD, JSDoc, English, SonarQube
│   ├── workflow/                             # GitFlow, commits, gh CLI, SemVer, preview QA, forking
│   ├── architecture/                         # DDD, typing, fail-fast, FSM, queues, logging, secrets
│   ├── backend-workers/                      # Express APIs, triggers, Quatrain repo, PostgreSQL DDL
│   ├── frontend-ux/                          # High-glare mobile UX, contrast tokens, static CSS
│   ├── infrastructure/                       # Containerfile, Compose, K8s, Terraform, ArgoCD
│   ├── iot-embedded/                         # Firmware C++, LoRaWAN, telemetry pipeline, deployment
│   └── knowledge/                            # OKF v0.1 specification
└── skills/                                   # Operational automation skills (see below)
```

---

## 📚 Content Categories

| Category | Fiches | Covers |
|:---|:---:|:---|
| **Methodology** | 5 | 15-year maintainability, TDD & co-location, JSDoc, International English, SonarQube gates |
| **Workflow** | 7 | GitFlow protocol, branch isolation, conventional commits, `gh` CLI, SemVer tagging, preview QA, 3-tier forking |
| **Architecture** | 9 | DDD, strict typing, fail-fast contracts, secrets management, FSM, DI/DRY, queue streaming, structured logging, local-first |
| **Backend & Workers** | 5 | Express REST APIs, background triggers, Quatrain repository pattern, PostgreSQL DDL, headless MVC |
| **Frontend & UX** | 4 | High-glare mobile UX, contrast & status tokens, static CSS hygiene, React memo/performance |
| **Infrastructure** | 7 | Containerfile/Podman, Docker Compose, K8s manifests, multi-cloud IaC, ArgoCD GitOps, operational permissions |
| **IoT & Embedded** | 4 | Embedded C++ standards, LoRaWAN protocol & payload, telemetry ingestion pipeline, deployment architecture |
| **Knowledge** | 1 | OKF v0.1 Open Knowledge Format specification |
| | **50** | |

---

## 🛠️ Operational Skills

| Skill | Purpose |
|:---|:---|
| **`agents-okf`** | Meta-router skill — helps AI agents navigate the OKF knowledge base structure |
| **`gitflow-ops`** | Automated GitFlow lifecycle: branching, PRs, topic-switch, SemVer releases |
| **`ddl-schema-guard`** | PostgreSQL DDL migration linter: lowercase naming, no quoted identifiers, timestamp standards |
| **`k8s-guard`** | Non-destructive Kubernetes diagnostics: safe logs, cluster triage, pod health |
| **`podman-container-audit`** | Container image inspection, Containerfile linting, local stack audit |
| **`quatrain-code-audit`** | Validates TypeScript import paths in OKF fiches against 95 known Quatrain/bradtech packages |

---

## 🔧 Tooling & Commands

This repository runs with **[Bun](https://bun.sh/)**:

| Command | Action |
| :--- | :--- |
| `bun run validate` | Audits all documents for OKF v0.1 conformance, validates links, checks for absolute paths and proprietary names. |
| `bun run build` | Compiles the atomic units into a single consolidated reference Markdown file. |
| `bun run sync-gist` | Safely updates the upstream personal reference Gist using GitHub CLI. |
| `bun run skills/quatrain-code-audit/scripts/audit-imports.ts` | Validates TypeScript import paths against the known package registry. |
| `bun run skills/quatrain-code-audit/scripts/update-registry.ts` | Refreshes `known-packages.json` from local monorepo checkouts. |

---

## 📥 How to Import into Your Projects

### 1. Ultra-Light Pointer (Recommended)
Add an `AGENTS.md` in your project with links to this repository:
```markdown
# Agent Directives Pointer
This project follows the standards in AGENTS.okf.
- Root Index: [AGENTS.okf Index](content/index.md)
Load only relevant atomic documents on demand for your immediate task.
```

### 2. Git Submodule
```bash
git submodule add https://github.com/crapougnax/AGENTS.okf .agents/rules
```

### 3. Global Gemini Rules
Copy or symlink `AGENTS.md` to `~/.gemini/GEMINI.md` for system-wide agent instructions.

---

## 📜 License

Governed by the **GNU Affero General Public License v3.0 (AGPL-v3)**.
