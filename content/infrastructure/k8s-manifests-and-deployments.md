---
type: standard
title: Kubernetes Manifests & Deployments (Totalymage Architecture)
description: Structure and standards for production Kubernetes workloads, distinguishing HTTP deployments (api-express) from worker daemon deployments (api-triggers).
tags:
  - kubernetes
  - k8s
  - deployment
  - services
  - totalymage
timestamp: 2026-09-12T05:00:00.000Z
category: infrastructure
status: active
---

# Kubernetes Manifests & Deployments (Totalymage Architecture)

In production Kubernetes environments, microservices are separated into distinct Deployments and Services corresponding to their operational profile.

## 🧭 Core Directives

### 1. Separation of HTTP Services & Asynchronous Daemons
- **HTTP Deployments (`api-express-deployment.yml`):**
  - Paired with an internal `ClusterIP` Service exposing port 80/8080.
  - Configured with HTTP readiness probes (`/healthz`) and liveness probes.
  - Scaled dynamically based on CPU/Memory or incoming request latency.
- **Worker Daemons (`api-triggers-deployment.yml`):**
  - Long-running queue consumers or event listeners.
  - May have a lightweight Service strictly for Prometheus metrics scraping or liveness probes, without public routing.
  - Scaled based on queue backlog depth.

### 2. Resource Requests & Limits
- Every container in a Deployment manifest must explicitly specify resource constraints:
  ```yaml
  resources:
    requests:
      cpu: "100m"
      memory: "128Mi"
    limits:
      cpu: "1000m"
      memory: "512Mi"
  ```
- Omission of requests and limits leads to node resource exhaustion and unpredictable pod evictions.

### 3. ConfigMaps & Secrets Injection
- Never hardcode dynamic configuration values in container images.
- Inject non-sensitive environment variables via `ConfigMapKeyRef` and sensitive tokens via `SecretKeyRef`.

## 🔗 Related Units
- [Backend API Architecture](../backend-workers/backend-api-architecture.md)
- [Background Workers & Triggers](../backend-workers/background-workers-and-triggers.md)
- [Multi-Cloud K8s & Terraform IaC](k8s-multi-cloud-iac.md)
