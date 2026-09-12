---
type: rfc
title: "RFC-001: Hermes Agent Integration with AGENTS.okf"
description: "Exploratory specification for deploying Hermes Agent (Nous Research) with AGENTS.okf rules, Tycho recipes, and personalised skills for autonomous infrastructure and media management."
tags: [hermes, agent, nous-research, tycho, skills, automation, specification]
status: draft
timestamp: 2026-09-12T09:22:00Z
updated: 2026-09-12T11:37:00Z
---

# RFC-001: Hermes Agent Integration with AGENTS.okf

> **Status**: Draft — Exploratory (no code)  
> **Author**: crapougnax  
> **Related**: [Hermes Agent (Nous Research)](https://hermes-agent.nousresearch.com/) | [GitHub](https://github.com/NousResearch/hermes-agent)
> **Target Host**: Jetson Orin Nano Super (`orignax`, SSH + tmux)

---

## 1. Context & Motivation

**Hermes Agent** is an open-source, self-hosted AI agent by Nous Research (MIT license) with:
- **Persistent memory** across sessions (`~/.hermes/memories/USER.md`)
- **Autonomous skill creation** via `SKILL.md` files under `~/.hermes/skills/`
- **Messaging gateway**: Telegram, Discord, Slack, WhatsApp, Signal, Email, CLI
- **Sandboxed code execution**: local, Docker, SSH, Singularity, Modal
- **Scheduled jobs** via natural language (`~/.hermes/cron/`)
- **Isolated subagents** for parallel task delegation
- **Web search, browser automation, vision, image generation, TTS/STT**
- **Hermes tools**: `terminal`, `read_file`, `write_file`, `patch`, `search_files`, `web_search`, `web_extract`, `browser_navigate`, `vision_analyze`, `delegate_task`, `cronjob`

### Current Deployment on orignax

| Spec | Value |
|:---|:---|
| **Hardware** | NVIDIA Jetson Orin Nano Super (Engineering Ref) |
| **OS** | Ubuntu 24.04.5 LTS (Noble), kernel 6.8.12-1021-tegra aarch64 |
| **RAM** | 7.3 GiB |
| **Disk** | 456 GiB NVMe (379 GiB free) |
| **LLM Provider** | xAI Grok 4.3 (remote API) |
| **Access** | SSH (`crapougnax@orignax`), tmux session `main` |

---

## 2. Hermes Skill Architecture (Discovered)

### Skill File Format

```
~/.hermes/skills/
├── <category>/
│   ├── DESCRIPTION.md              # Category description (optional)
│   └── <skill-name>/
│       ├── SKILL.md                 # Skill definition (YAML frontmatter + instructions)
│       ├── <script>                 # Executable (Python, Bash, etc.)
│       ├── references/              # Supporting docs (optional)
│       ├── templates/               # Templates (optional)
│       └── scripts/                 # Helper scripts (optional)
```

### SKILL.md Format

```yaml
---
name: <skill-name>
description: "<≤60 chars, one sentence, period-terminated.>"
version: 0.1.0
author: <human> + Hermes
license: MIT
platforms: [cli, telegram, ...]
metadata:
  hermes:
    tags: [...]
    related_skills: [...]
---

# <Skill> Skill
2-3 sentence intro.

## When to Use       — bulleted triggers + counter-triggers
## Prerequisites     — env vars, installs, API keys
## How to Run        — canonical invocation via Hermes tools
## Quick Reference   — flat command list
## Procedure         — numbered steps with checkable criteria
## Pitfalls          — known limits
## Verification      — how to prove it worked
```

### Key Conventions
1. **All commands framed through Hermes tools** — `terminal(command="...", timeout=...)`, not bare shell
2. **No machine-local paths** — use repo-relative paths only
3. **Description ≤ 60 chars** — strict enforcement at review
4. **Scripts as executables** — Python/Bash scripts alongside SKILL.md, invoked via `terminal`
5. **Env vars in `~/.hermes/.env`** — credentials never hardcoded in skills
6. **Session-cached** — new skills visible only in new sessions

### Existing Skills on orignax

| Category | Skills |
|:---|:---|
| **jellyfin** | `jellyfin` (Python CLI: artists, collections, playlists, search, stats) |
| **devops** | `sdlc-review` |
| **research** | `arxiv`, `competitor-news-monitor`, `grounded-citations`, `llm-wiki` |
| **media** | `gif-search`, `songsee`, `youtube-content` |
| **productivity** | `airtable`, `box`, `google-workspace`, `maps`, `notion`, `pdf`, `powerpoint`, `xlsx`, ... |
| **creative** | `architecture-diagram`, `ascii-video`, `design-md`, `manim-video`, `p5js`, `songwriting-and-ai-music` |
| **software-development** | `codebase-inspection`, `github`, `hermes-agent-skill-authoring`, `test-driven-development`, ... |

---

## 3. SOUL.md — Personality & Rules Injection

The file `~/.hermes/SOUL.md` is the **system prompt** for Hermes. Currently minimal:

> "You are Hermes Agent, built by Nous Research. Be direct..."

**This is where AGENTS.okf rules could be injected.**

### Integration Strategy

Instead of replacing SOUL.md entirely (which would lose Hermes defaults), **append** OKF operational rules as a dedicated section:

```markdown
# SOUL.md (proposed)

You are Hermes Agent, built by Nous Research. [original content]

---

## Operational Standards (AGENTS.okf)

You follow the development and infrastructure standards from the AGENTS.okf knowledge base.

### Permissions Matrix
- ✅ Autonomous: `ls`, `cat`, `grep`, `kubectl get/describe/logs`, `podman ps/images/logs`, `git status/log/diff`
- 🛑 Gated (ask first): `kubectl delete/apply`, `docker rm -f`, database mutations, `git push --force`

### Infrastructure Standards
- Containers: Rootless Podman, non-root USER, multi-arch (amd64/arm64), `Containerfile` naming
- Compose: Traefik labels, fail-fast env validation, `.env.dist` templates
- Logging: Structured JSON, no raw `console.log`

### Refer to AGENTS.okf for detailed fiches:
- Location: `/home/crapougnax/agents-okf/content/` (if cloned)
- Remote: https://github.com/crapougnax/AGENTS.okf
```

---

## 4. Persistent Memory

Hermes stores user context in `~/.hermes/memories/USER.md`:
- **Already knows**: Jellyfin library artists, Mattermost webhook, travel preferences
- **Could learn**: AGENTS.okf conventions, Tycho recipe catalog, infrastructure topology

Memory is updated automatically during conversations and persists across sessions.

---

## 5. Proposed Custom Skills

### 5.1 Tycho Infrastructure Skills
| Skill | Type | Description |
|:---|:---|:---|
| `tycho-status` | Bash | Check running Tycho services via `podman ps` |
| `tycho-deploy` | Bash | Deploy/update a Tycho recipe |
| `tycho-backup` | Bash | Trigger backup workflows |
| `tycho-update` | Bash | Check for image updates, propose upgrade |

### 5.2 Media & Entertainment Skills
| Skill | Type | Description |
|:---|:---|:---|
| `jellyfin` | Python | ✅ Already exists — artists, playlists, search |
| `concert-finder` | Python | Cross-ref Jellyfin artists with Songkick/Bandsintown APIs |
| `new-releases` | Python | Monitor MusicBrainz/Spotify for new albums from favourites |

### 5.3 Knowledge & Productivity
| Skill | Type | Description |
|:---|:---|:---|
| `okf-navigator` | Bash | Read and serve AGENTS.okf fiches on demand |
| `second-brain` | Bash | Query the personal OKF second-brain knowledge base |

---

## 6. Next Steps

- [x] Install Hermes Agent on orignax
- [x] Document skill format and configuration structure
- [ ] Clone AGENTS.okf to orignax for local file access
- [ ] Extend SOUL.md with OKF operational rules
- [ ] Prototype a `tycho-status` skill
- [ ] Prototype a `concert-finder` skill from Jellyfin data
- [ ] Test Mattermost webhook delivery for alerts
- [ ] Evaluate running Ollama locally on Orin Nano for offline inference

---

## 7. References

- [Hermes Agent — Official Site](https://hermes-agent.nousresearch.com/)
- [Hermes Agent — GitHub](https://github.com/NousResearch/hermes-agent)
- [Hermes Skill Authoring Guide](~/.hermes/skills/software-development/hermes-agent-skill-authoring/SKILL.md)
- [AGENTS.okf — Knowledge Base](https://github.com/crapougnax/AGENTS.okf)
- [Tycho — Server Management CLI](https://github.com/crapougnax/tycho)
