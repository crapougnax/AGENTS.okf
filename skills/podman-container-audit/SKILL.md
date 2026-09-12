---
name: podman-container-audit
description: Non-destructive local container and image inspection, and automated Containerfile linting. TRIGGER when checking local running containers, port mappings, or verifying that a Containerfile enforces non-root USER and OCI metadata labels.
---

# Podman Container Audit Skill (`podman-container-audit`)

This skill provides automated linting and safe inspection of container images, Containerfiles, and local container stacks.

## 🧭 Invocations

### 1. Lint Containerfile
```bash
bun run skills/podman-container-audit/scripts/lint-containerfile.ts [path/to/Containerfile]
```
- Checks for standard `Containerfile` naming (rejects `Dockerfile`).
- Verifies that an unprivileged, non-root `USER` is declared in the final stage.
- Audits required OCI metadata labels (`title`, `description`, `licenses`).

### 2. Local Container Stack Audit
```bash
bun run skills/podman-container-audit/scripts/local-stack-audit.ts
```
- Non-destructive audit of running containers and ports.
- Lists local images and sizes.
- Prohibits destructive pruning.
