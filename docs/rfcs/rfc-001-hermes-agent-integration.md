---
type: rfc
title: "RFC-001: Hermes Agent Integration with AGENTS.okf"
description: "Exploratory specification for deploying Hermes Agent (Nous Research) with AGENTS.okf rules, Tycho recipes, and personalised skills for autonomous infrastructure and media management."
tags: [hermes, agent, nous-research, tycho, skills, automation, specification]
status: draft
timestamp: 2026-09-12T09:22:00Z
---

# RFC-001: Hermes Agent Integration with AGENTS.okf

> **Status**: Draft — Exploratory (no code)  
> **Author**: crapougnax  
> **Related**: [Hermes Agent (Nous Research)](https://hermes-agent.nousresearch.com/) | [GitHub](https://github.com/NousResearch/hermes-agent)

---

## 1. Context & Motivation

**Hermes Agent** is an open-source, self-hosted AI agent by Nous Research (MIT license) with:
- **Persistent memory** across sessions
- **Autonomous skill creation** (the agent learns and generates its own skills)
- **Messaging gateway**: Telegram, Discord, Slack, WhatsApp, Signal, Email, CLI
- **Sandboxed code execution**: local, Docker, SSH, Singularity, Modal
- **Scheduled jobs** via natural language
- **Isolated subagents** for parallel task delegation
- **Web search, browser automation, vision, image generation, TTS**

The opportunity is to combine:
- **AGENTS.okf** as the agent's operational rules and knowledge base
- **Tycho** as the container recipe deployment engine
- **Custom skills** tailored to personal interests and infrastructure needs

This creates an autonomous home/server agent that manages infrastructure services AND provides personalised intelligence (e.g., music discovery, media curation, monitoring).

---

## 2. Architecture Vision

```
┌─────────────────────────────────────────────────────┐
│                   Hermes Agent                       │
│  ┌───────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  AGENTS.okf   │  │ Tycho Engine │  │  Custom   │ │
│  │  (Rules &     │  │ (Compose     │  │  Skills   │ │
│  │   Knowledge)  │  │  Recipes)    │  │           │ │
│  └───────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│          │                 │                │       │
│  ┌───────▼─────────────────▼────────────────▼─────┐ │
│  │            Hermes Persistent Memory             │ │
│  └─────────────────────────────────────────────────┘ │
│                         │                            │
│  ┌──────────────────────▼──────────────────────────┐ │
│  │          Messaging Gateway                       │ │
│  │  Telegram │ Discord │ Email │ CLI │ Signal      │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
         │                │                │
    ┌────▼────┐    ┌──────▼──────┐   ┌─────▼─────┐
    │ Jellyfin │    │   Immich    │   │ Nextcloud  │
    │ (media)  │    │  (photos)   │   │  (files)   │
    └──────────┘    └─────────────┘   └───────────┘
```

---

## 3. Skill Categories (Exploratory)

### 3.1 Infrastructure Skills (Tycho-backed)
| Skill | Description |
|:---|:---|
| `tycho-deploy` | Deploy/update a Compose recipe by name (Jellyfin, Immich, Nextcloud, etc.) |
| `tycho-status` | Health check: running containers, resource usage, disk space |
| `tycho-backup` | Trigger backup workflows for volumes and databases |
| `tycho-update` | Pull latest images, check for security updates, propose upgrade plan |

### 3.2 Media & Entertainment Skills
| Skill | Description |
|:---|:---|
| `jellyfin-playlists` | Read Jellyfin playlists, extract artist/album metadata |
| `music-discovery` | Cross-reference playlists with upcoming concerts (Songkick, Bandsintown APIs) |
| `new-releases` | Monitor new releases from favourite artists (Spotify, MusicBrainz) |
| `media-organise` | Suggest library cleanup, detect duplicates, rename conventions |

### 3.3 Smart Home & Monitoring
| Skill | Description |
|:---|:---|
| `service-monitor` | Periodic health pings to self-hosted services, alert via Telegram/Discord |
| `ssl-renewal` | Monitor TLS certificate expiry, trigger Let's Encrypt renewal |
| `dns-check` | Verify DNS records for managed domains |

### 3.4 Knowledge & Productivity
| Skill | Description |
|:---|:---|
| `okf-navigator` | Progressive disclosure of AGENTS.okf knowledge base |
| `second-brain` | Query the personal OKF second-brain knowledge base |
| `calendar-sync` | Read Google Calendar, suggest prep or follow-ups |

---

## 4. Hermes Skill Format (Research Needed)

> **TODO**: Investigate the Hermes skill specification format:
> - How does Hermes discover and load skills?
> - What is the skill file structure? (YAML? JSON? Python? TypeScript?)
> - Can skills reference external tools (MCP servers, APIs)?
> - How does the autonomous skill creation feature work?
> - Can we inject AGENTS.okf rules as Hermes "personality" or "system prompt"?

### Key Questions
1. **Skill format compatibility**: Can we generate Hermes-compatible skills from AGENTS.okf SKILL.md definitions?
2. **Rules injection**: Does Hermes support a `.hermes/` config directory or system prompt that we could populate with OKF rules?
3. **Tycho integration**: Can Hermes execute shell commands to invoke `tycho deploy <recipe>`?
4. **Memory seeding**: Can we pre-seed Hermes memory with AGENTS.okf knowledge?

---

## 5. Deployment Model

### Option A: Hermes Desktop (macOS)
- Install via `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`
- Configure with local AGENTS.okf checkout
- Use for personal productivity + media management

### Option B: Hermes Server (Podman/Docker)
- Deploy as a Tycho recipe alongside Jellyfin, Immich, Nextcloud
- Hermes manages its sibling containers
- Access via Telegram/Discord bot

### Option C: Hermes Cloud (Nous Portal)
- Deploy to Nous Research cloud: `https://portal.nousresearch.com/cloud`
- Feed AGENTS.okf rules via API/config

---

## 6. Next Steps

- [ ] Install Hermes Desktop locally and explore the CLI
- [ ] Document the skill format and configuration structure
- [ ] Prototype a simple Tycho skill (deploy/status)
- [ ] Test rules injection (system prompt or config file)
- [ ] Prototype a Jellyfin playlist reading skill
- [ ] Evaluate MCP server compatibility for AGENTS.okf tools
- [ ] Draft a Tycho recipe for Hermes server deployment

---

## 7. References

- [Hermes Agent — Official Site](https://hermes-agent.nousresearch.com/)
- [Hermes Agent — GitHub](https://github.com/NousResearch/hermes-agent)
- [Hermes Agent — Documentation](https://hermes-agent.nousresearch.com/docs/)
- [AGENTS.okf — Knowledge Base](https://github.com/crapougnax/AGENTS.okf)
- [Tycho — Server Management CLI](https://github.com/crapougnax/tycho)
