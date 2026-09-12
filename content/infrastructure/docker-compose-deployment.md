---
type: recipe
title: Docker Compose Deployment & Multi-Service Recipes
description: Guidelines for structuring local development and on-premise deployments using Docker Compose, sanitizing templates, and managing environment files.
tags:
  - docker
  - compose
  - deployment
  - local-dev
  - secrets
timestamp: 2026-09-12T05:00:00.000Z
category: infrastructure
status: active
---

# Docker Compose Deployment & Multi-Service Recipes

For local development stacks, staging sandboxes, and standalone on-premise deployments, Docker Compose coordinates multi-container microservice workloads.

## 🧭 Core Directives

### 1. Zero Hardcoded Plaintext Secrets
- Never commit actual passwords, private database credentials, or secret keys inside `docker-compose.yml`.
- Systematically provide sanitized template files:
  - `.env.dist` (or `.env.example`) listing all required environment variables with explanatory comments and empty placeholder values.
- The actual `.env` file must be included in `.gitignore`.

### 2. Service Separation & Volume Mounts
- Separate database engines (PostgreSQL), message brokers (Mosquitto, Redis), API services, and reverse proxies into discrete service blocks.
- Persist data via named volumes (e.g. `pgdata:/var/lib/postgresql/data`) rather than loose host directory mounts to prevent file permission mismatches across macOS and Linux.

### 3. Health Checks & Dependency Order
- Use `healthcheck` declarations on infrastructure services and configure application services to wait for health readiness:
  ```yaml
  services:
    postgres:
      image: postgres:16-alpine
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U postgres"]
        interval: 5s
        timeout: 5s
        retries: 5

    api:
      build:
        context: .
        dockerfile: Containerfile
      depends_on:
        postgres:
          condition: service_healthy
  ```

## 🔗 Related Units
- [Containerfile, Podman & OCI Standards](/infrastructure/containerfile-and-podman.md)
- [Kubernetes Manifests & Deployments](/infrastructure/k8s-manifests-and-deployments.md)
