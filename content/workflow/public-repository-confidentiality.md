---
type: standard
title: Public Repository Confidentiality & Metadata Anonymization
description: Strict hygiene guidelines prohibiting sensitive proper names, customer/partner names, event venues, and commercial brands in public Git branches, tickets, commit messages, and metadata.
tags:
  - git
  - privacy
  - security
  - confidentiality
  - workflow
  - public-repo
timestamp: 2026-10-11T16:53:00.000Z
category: workflow
status: active
---

# Public Repository Confidentiality & Metadata Anonymization

Public repositories and open-source codebases are indexed by search engines, scraped by automated crawlers, and inspected by external auditors. Any leakage of confidential context, internal commercial operations, client identities, prestigious event venues, or unauthorized third-party commercial brand names creates strategic, legal, and operational exposure.

---

## 🧭 Core Directives

### 1. Zero Leakage in Git Metadata & Issue Trackers

Git branches, commit histories, GitHub issue titles, and Pull Request summaries are **permanently visible** in public repositories. AI agents and developers must strictly observe metadata sanitization:

- **Branch Names (`git checkout -b`)**:
  - **Forbidden**: Never include client names, prospective partners, private event locations/venues (e.g. ministries, exhibitions, presidential palaces), internal code project names, or commercial brand names.
    - ❌ `feat/elysee-demo-voice-mistral`
    - ❌ `fix/client-acme-invoice-leak`
    - ❌ `feat/total-iot-telemetry`
  - **Mandatory**: Use strictly functional, technical, and domain-agnostic capability names.
    - ✅ `feat/13-conversational-voice-assistant`
    - ✅ `fix/42-invoice-calculation-rounding`
    - ✅ `feat/88-telemetry-ingestion-pipeline`

- **Commit Messages & Conventional Commits**:
  - Commit titles and bodies must describe the technical change and software behavior in International English.
  - Never mention commercial event deadlines, client demos, or contractual negotiations in commit logs.
  - Use generic technical terms (`streaming SSE API`, `sovereign LLM inference`, `high-definition audio playback`) rather than specific proprietary service names unless directly contributing to an official vendor adapter package.

- **Issue & Pull Request Descriptions (`gh issue`, `gh pr`)**:
  - Issue tickets and PR bodies are public. State functional requirements, architectural invariants, and verification steps.
  - Omit confidential business agreements, customer meeting notes, and sensitive dates.

---

### 2. Client-Facing Metadata & Public Assets Hygiene

User-facing headers, HTML manifests, and client assets are exposed directly to the browser:

- **Web Manifests & SEO Tags**:
  - Files like `manifest.json`, `index.html`, and `<meta name="description">` must use brand-neutral, product-centric, or open-source descriptions (e.g. *"Assistant agronomique vocal souverain"*).
  - Avoid binding public product descriptions to third-party vendor names or commercial partners without contractual authorization.

- **UI Copy & Status Indicators**:
  - User interface components should rely on sovereign, functional phrasing:
    - Prefer *"IA Souveraine"* or *"Modèle de langage"* over third-party commercial logos or brand names in status pills.
    - Prefer *"Haute Définition"* or *"Synthèse standard"* over vendor-specific voice engines in settings toggles.

---

### 3. Decoupled Provider Configuration & Environment Isolation

Software architectures must remain decoupled and provider-agnostic:

- **Abstract Adapters**:
  - Core interfaces (`AiAdapter`, `TtsAdapter`, `StorageAdapter`) define generic contracts (`chat()`, `synthesize()`, `read()`).
  - Runtime selections and provider routing are driven strictly by configuration files and environment variables.

- **Secrets and Endpoints (`.env` vs `.env.dist`)**:
  - Specific API keys, external endpoint URLs, and proprietary provider identifiers must live in private `.env` files (ignored by Git).
  - Public templates (`.env.dist`, `README.md`) must only contain generic placeholders and instructions.

---

### 4. Continuous Audit & Pre-Push Verification

Before pushing code or publishing tickets to public repositories, the following verification checklist is mandatory:

1. **Branch & History Audit**:
   ```bash
   git status
   git log -n 5 --oneline
   ```
   Verify that no sensitive proper names or third-party brands appear in recent commit subjects or the current branch name.
2. **Content & Asset Search**:
   Run regex searches for project codenames, client names, and unapproved brand references before opening a public Pull Request.
3. **Automated Linter Gates**:
   Integrate automated keyword and secret checks into repository test suites (`bun test`, `bun run validate`) to fail fast if proprietary terms are committed.

---

## 🔗 Related Units

- [GitFlow Protocol](gitflow-protocol.md)
- [Conventional Commits & Atomic Commit Standards](conventional-commits.md)
- [Branch Isolation & Topic Switch Protocol](branch-isolation-and-topic-switch.md)
- [GitHub CLI Operations & Pull Request Protocol](github-cli-protocol.md)
