# AGENTS.okf — Modular AI Agent Standards in Open Knowledge Format (OKF v0.1)

[![Format: OKF v0.1](https://img.shields.io/badge/format-OKF%20v0.1-blue.svg)](https://okf.md/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-green.svg)](LICENSE)
[![Engine: Bun](https://img.shields.io/badge/Runtime-Bun%20v1.3+-orange.svg)](https://bun.sh/)

**AGENTS.okf** is the centralized, modular knowledge base containing development philosophy, architecture standards, UI/UX ergonomics, and GitFlow protocols for human developers and autonomous AI coding agents (Antigravity, Claude Code, Cursor, Gemini).

Structured strictly according to the **Open Knowledge Format (OKF v0.1)**, it replaces monolithic rule files with atomic, self-contained units that agents discover on demand (**Progressive Disclosure**).

---

## 🧭 Repository Structure

```text
AGENTS.okf/
├── AGENTS.md                                 # Universal entrypoint for AI coding agents
├── README.md                                 # Human developer documentation and import guides
├── package.json                              # Bun scripts (validate, build, sync-gist)
├── bin/
│   ├── validate.ts                           # OKF v0.1 schema & markdown link checker
│   ├── build.ts                              # Compiles all units into a consolidated Markdown bundle
│   └── sync-gist.ts                          # Synchronizes updates with the personal GitHub Gist
└── content/
    ├── index.md                              # Root OKF index
    ├── methodology/                          # 15-year horizon, TDD & co-location, JSDoc, English, SonarQube
    ├── workflow/                             # GitFlow, commits, gh CLI, SemVer tags, preview QA, 3-tier forking
    ├── architecture/                         # DDD, strict typing, fail-fast, state machines, queues, logging, local-first
    ├── backend-workers/                      # Express APIs, background triggers, Quatrain repo, PostgreSQL DDL
    ├── frontend-ux/                          # High-glare mobile UX, contrast tokens, static CSS, React memo
    ├── infrastructure/                       # Containerfile, Docker Compose, K8s manifests, Terraform, ArgoCD
    └── knowledge/                            # OKF v0.1 specification
```

---

## 🛠️ Tooling & Commands

This repository runs with **[Bun](https://bun.sh/)**:

| Command | Action |
| :--- | :--- |
| `bun run validate` | Audits all documents for OKF v0.1 frontmatter conformance and validates all relative links. |
| `bun run build` | Compiles the atomic units into a single consolidated reference Markdown file. |
| `bun run sync-gist` | Safely updates the upstream personal reference Gist using GitHub CLI with keyring session fallback. |

---

## 📥 How to Import into Your Projects

### 1. Ultra-Light Pointer (Recommended)
Add an `AGENTS.md` in your project with links to this repository:
```markdown
# Agent Directives Pointer
This project follows the standards in AGENTS.okf.
- Root Index: [AGENTS.okf Index](file:///Users/crapougnax/CODE/CRAPOUGNAX/AGENTS.okf/content/index.md)
Load only relevant atomic documents on demand for your immediate task.
```

### 2. Git Submodule
```bash
git submodule add https://github.com/crapougnax/AGENTS.okf .agents/rules
```

---

## 📜 License

Governed by the **GNU Affero General Public License v3.0 (AGPL-v3)**.
