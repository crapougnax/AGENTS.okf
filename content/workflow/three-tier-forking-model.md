---
type: pattern
title: Three-Tier Forking Model for Open Source & Enterprise
description: Architectural governance separating public open-source upstream repositories, personal developer contribution forks, and private enterprise production forks.
tags:
  - git
  - open-source
  - security
  - forking
  - governance
timestamp: 2026-09-12T05:00:00.000Z
category: workflow
status: active
---

# Three-Tier Forking Model for Open Source & Enterprise

For community-facing and open-source ecosystems (such as Tycho, shared multi-cloud recipes, and core packages), development follows a structured **3-Tier Forking Architecture**.

```mermaid
flowchart LR
    subgraph "1. Upstream Official (Open Source)"
        Upstream["github.com/<org>/<repo><br><b>(Public • AGPL-v3)</b><br>• Canonical source of truth<br>• Zero private credentials / secrets<br>• Templates (.env.dist, .tfvars.dist)"]
    end

    subgraph "2. Personal Contributor Fork (Showcase & PRs)"
        Personal["github.com/crapougnax/<repo><br><b>(Public Fork • Portfolio)</b><br>• Daily feature development<br>• PRs targeting Upstream develop/main<br>• Personal contribution graph activity"]
    end

    subgraph "3. Enterprise Production Fork (Deployment)"
        Enterprise["github.com/<org>/<repo><br><b>(Private Fork • Production)</b><br>• Real API keys, .tfvars & secrets<br>• Injects proprietary tenant config<br>• Synchronized via git pull upstream"]
    end

    Upstream -->|Fork public| Personal
    Personal -->|Contributions & Pull Requests| Upstream
    Upstream -->|Fork private & Sync upstream| Enterprise
```

## 🧭 Tier Breakdown

### 1. The Upstream Repository (`<org>/<repo>`)
- Hosted under the official community organization (e.g. `tycho-ops`, `Quatrain`).
- 100% public, cloud-agnostic, and governed by **AGPL-v3**.
- Strictly zero hardcoded secrets. Maintained with `.env.dist` and `terraform.tfvars.dist`.
- Protected by automated GitHub Actions quality gates.

### 2. The Personal Contributor Fork (`crapougnax/<repo>`)
- Public fork hosted under the personal developer account.
- Daily feature development and bug fixing take place here.
- Contributions merge upstream via standard Pull Requests, demonstrating open-source leadership and populating the personal GitHub contribution graph.
- Configured with standard remotes:
  ```bash
  origin    https://github.com/crapougnax/<repo>.git (fetch & push)
  upstream  https://github.com/<org>/<repo>.git      (fetch & push)
  ```

### 3. The Enterprise Production Fork (`<org>/<repo>`)
- Private organization fork used exclusively for production deployment and tenancy operations.
- Injects real production credentials, Scaleway/AWS tokens, and tenant configurations.
- Upstream improvements and bug fixes are pulled cleanly via:
  ```bash
  git pull upstream main
  ```

## 🔗 Related Units
- [GitFlow Protocol](gitflow-protocol.md)
- [GitHub CLI Protocol](github-cli-protocol.md)
