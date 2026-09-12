---
type: pattern
title: On-Demand QA Preview Environments (qa:preview)
description: Workflow and automated composite actions for provisioning ephemeral staging environments and pre-release packages on Pull Requests labeled qa:preview.
tags:
  - argocd
  - preview
  - kubernetes
  - qa
  - pull-request
timestamp: 2026-09-12T05:00:00.000Z
category: workflow
status: active
---

# On-Demand QA Preview Environments (`qa:preview`)

For non-trivial features requiring comprehensive QA validation prior to merge into `develop`, apply the GitHub label `qa:preview` to the Pull Request.

## 🧭 Operational Architecture

Applying `qa:preview` leverages shared composite GitHub Actions (e.g. from `Quatrain/actions`) to provision isolated preview assets.

```mermaid
flowchart TD
    PR["PR with label 'qa:preview'"] --> Trigger{"Trigger Dispatch"}
    Trigger -->|Web Application| Deploy["Build Image :prXX + Deploy ArgoCD App"]
    Deploy --> URL["Route: https://<app>-prXX.<domain>"]
    Trigger -->|Monorepo Package| Publish["Publish NPM @scope/pkg@prXX"]
    PR -->|PR Closed / Merged| Cleanup["ArgoCD Cascade Prune & Resource Teardown"]
```

### 1. Web Applications & Services
- **Automated Deployment:** Builds a multi-arch container image tagged `:prXX` and provisions an ephemeral ArgoCD application routed to `https://<app>-prXX.<domain>` (e.g. `studio-pr25.apps.quatrain.dev`).
- **Live Staging Comment:** Posts a sticky comment directly on the PR with the live URL. Automatically updates upon subsequent pushes to the feature branch.
- **Automated Teardown:** When the PR is closed (whether merged or closed without merge), the cleanup action automatically deletes the ArgoCD application and cascade-prunes all associated Kubernetes pods, services, ingresses, and TLS certificates.

### 2. Monorepo Packages
- Publishes the changed packages to NPM and GitHub Packages with version suffix `-prXX` and dist-tag `prXX`.
- Posts an installation snippet directly to the PR:
  ```bash
  yarn add @quatrain/core@pr25
  ```

## 🔗 Related Units
- [GitHub CLI Protocol](github-cli-protocol.md)
- [ArgoCD GitOps & Image Updater](../infrastructure/argocd-gitops-and-updater.md)
