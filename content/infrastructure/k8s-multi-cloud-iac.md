---
type: pattern
title: Multi-Cloud K8s & Terraform IaC (Tycho Standards)
description: Cloud-agnostic infrastructure specifications covering modular Terraform, Traefik v3 HTTP-01 ACME routing, and isolated TLS certificates.
tags:
  - kubernetes
  - terraform
  - traefik
  - tls
  - tycho
timestamp: 2026-09-12T05:00:00.000Z
category: infrastructure
status: active
---

# Multi-Cloud K8s & Terraform IaC (Tycho Standards)

Infrastructure as Code (IaC) across multi-cloud Kubernetes deployments (Scaleway Kapsule, AWS EKS, Hetzner bare-metal) follows standardized, cloud-agnostic conventions established in Tycho (`tycho-ops/k8s-iac`).

## 🧭 Core Directives

### 1. Modular Terraform Structure
- Separate cloud providers cleanly under `terraform/modules/<provider>/` (e.g. `scaleway/`, `hetzner/`, `aws/`).
- Never commit active credentials, Scaleway API tokens, or tenant IDs. Always provide sanitized `terraform.tfvars.dist`.
- **Fail-Fast IaC:** Never rely on implicit code fallbacks. All infrastructure parameters must be declared explicitly in deployment manifests.

### 2. Ingress & Routing Standards (Traefik v3 + Cert-Manager)
- **Native IngressClass:** Always configure `IngressClass: traefik` and declare it on `ClusterIssuer` HTTP-01 solvers.
- **HTTP-01 ACME Pass-Through:** Do not configure unconditional HTTP-to-HTTPS redirect on port 80 at the CLI/global level, as it breaks Let's Encrypt ACME challenge self-checks. Use path-based routing or Traefik middlewares for HTTPS enforcement.
- **Isolated Domain Certificates:** Never combine multiple distinct domain names into overlapping `Certificate` resources to prevent concurrent ACME order collisions.

### 3. Unified CLI Orchestration (`tycho k8s`)
- Cluster operations are exposed via the unified `tycho k8s` CLI tool:
  - `tycho k8s bootstrap`: Ingress & TLS cluster bootstrap.
  - `tycho k8s cert <domain> [ns] [secret]`: Issue Let's Encrypt SSL certificate.
  - `tycho k8s deploy <stack>`: Deploy modular application stack.
  - `tycho k8s status`: Audit cluster health and certificate statuses.

## 🔗 Related Units
- [Three-Tier Forking Model](/workflow/three-tier-forking-model.md)
- [Kubernetes Manifests & Deployments](/infrastructure/k8s-manifests-and-deployments.md)
