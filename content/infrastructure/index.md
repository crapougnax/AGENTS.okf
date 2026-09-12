# Category Index: Infrastructure & Deployment

This category specifies container standards, Docker Compose recipes, Kubernetes manifests, multi-cloud Terraform IaC, ArgoCD GitOps, and operational permission guardrails.

## Documents

* [Containerfile, Podman & OCI Image Standards](containerfile-and-podman.md) - Podman-centric naming, non-root execution, multi-arch builds, and standard OCI labels.
* [Docker Compose Deployment & Multi-Service Recipes](docker-compose-deployment.md) - Local development and on-premise service orchestration with sanitized environment templates.
* [Kubernetes Manifests & Deployments (Totalymage Architecture)](k8s-manifests-and-deployments.md) - Separation of HTTP services from background trigger daemons, with resource limits.
* [Multi-Cloud K8s & Terraform IaC (Tycho Standards)](k8s-multi-cloud-iac.md) - Modular Terraform, Traefik v3 HTTP-01 pass-through, and isolated domain certificates.
* [ArgoCD GitOps & Image Updater Automation](argocd-gitops-and-updater.md) - Continuous delivery architecture tracking semver releases across staging and production.
* [Operational Permissions Matrix (Autonomous vs Gated Actions)](operational-permissions-matrix.md) - Clear demarcation between safe read-only diagnostics and gated destructive actions.
