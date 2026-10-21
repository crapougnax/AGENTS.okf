# AGENTS.okf Knowledge Base — Content Index

Welcome to the centralized development standards, architecture patterns, and GitFlow protocols repository formatted according to the **Open Knowledge Format (OKF v0.1)**.

This base is designed for **Progressive Disclosure** — developers and AI coding agents load only the specific atomic unit required for their current task, preserving context window budget.

All standards are organized into **Three Foundational Pillars**:

## 🏭 I. Usine Logicielle (Software Factory & Development)

* [methodology](methodology/index.md) - Software engineering philosophy, 15-year maintainability horizon, Code Serves Data (zero hardcoded missing data), TDD & test co-location, strict JSDoc, International English standard, and SonarQube quality gates.
* [architecture](architecture/index.md) - Domain-Driven Design (DDD), strict TypeScript (zero `as any`), fail-fast contracts, state machines, dependency injection, `@quatrain/queue-*` message bus, structured logging, secrets management, and local-first architecture.
* [workflow](workflow/index.md) - GitFlow protocol (develop / main / semver), branch isolation, conventional commits, strict GitHub CLI (`gh`) usage, ephemeral QA preview environments, public repo confidentiality, and 3-tier forking model.
* [backend-workers](backend-workers/index.md) - Express REST API architecture, asynchronous background workers (`api-triggers`), Quatrain Repository pattern (`.TYPE`, `Core.addClass`), strict PostgreSQL lowercase DDL, and headless MVC controllers.
* [frontend-ux](frontend-ux/index.md) - High-glare outdoor mobile UX (76px/96px touch targets, Space Grotesk/Nunito typography), status tokens and high contrast, static CSS hygiene, and React memoization.
* [iot-embedded](iot-embedded/index.md) - Embedded C++ firmware standards (zero-heap, HAL, I2C recovery), LoRaWAN protocol and FPort payload encoding, MQTT-to-DataPoint telemetry ingestion pipeline, and ChirpStack v4 deployment architecture (Podman Quadlets + Kubernetes Kustomize).
* [knowledge](knowledge/index.md) - Open Knowledge Format (OKF v0.1) specification governing this knowledge base structure.

## 🚀 II. Déploiement (Infrastructure & Operations)

* [infrastructure](infrastructure/index.md) - Non-root multi-arch Containerfile/Podman standard, Docker Compose recipes (`.env.dist`), Kubernetes manifests and deployments, multi-cloud Terraform IaC (Tycho + Traefik v3 HTTP-01), ArgoCD GitOps, and operational permissions matrix.

## 🛡️ III. Cybersécurité (Security & Threat Defense)

* [cybersecurity](cybersecurity/index.md) - Operational threat defense, CrowdSec intrusion detection & Traefik bouncers, mandatory external VPN routing for pentests and attack simulations, anti-DDoS architecture, public repository confidentiality, and proactive intrusion prevention.
