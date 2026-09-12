---
type: standard
title: Containerfile, Podman & OCI Image Standards
description: Container packaging standards mandating Containerfile naming, non-root unprivileged users, multi-arch builds (amd64/arm64), and standard OCI labels.
tags:
  - container
  - podman
  - oci
  - security
  - multiarch
timestamp: 2026-09-12T05:00:00.000Z
category: infrastructure
status: active
---

# Containerfile, Podman & OCI Image Standards

Container packaging across microservices and monorepos adheres to open OCI standards and security hardening.

## 🧭 Core Directives

### 1. Podman-Centric Naming
- Container recipe files must always be named **`Containerfile`** or **`ContainerFile`**, never `Dockerfile`.

### 2. Unprivileged Non-Root Execution
- Running containers as root in production is strictly prohibited.
- The final runtime stage of every image must drop privileges to an explicit non-root user:
  ```dockerfile
  # Final Runtime Stage
  FROM oven/bun:1.3-alpine
  WORKDIR /app

  # Switch to unprivileged user
  USER bun
  EXPOSE 3000
  CMD ["bun", "run", "dist/index.js"]
  ```

### 3. Multi-Architecture Builds
- All production container images **MUST** be built and published for both:
  - `linux/amd64` (Standard cloud instances)
  - `linux/arm64` (Apple Silicon development machines, Graviton, Hetzner CAX)

### 4. OCI Metadata Labels
- Declare standard OCI metadata labels in the final build stage for observability:
  ```dockerfile
  LABEL org.opencontainers.image.title="Totalymage Backend API"
  LABEL org.opencontainers.image.description="Express REST API backend for Totalymage"
  LABEL org.opencontainers.image.source="https://github.com/crapougnax/backend"
  LABEL org.opencontainers.image.licenses="AGPL-3.0"
  ```

## 🔗 Related Units
- [Docker Compose Deployment Recipes](/infrastructure/docker-compose-deployment.md)
- [Kubernetes Manifests & Deployments](/infrastructure/k8s-manifests-and-deployments.md)
