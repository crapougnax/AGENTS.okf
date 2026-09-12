# AI Agent Instructions & Guidelines Pointer — AGENTS.okf

> **Platform**: Open Knowledge Format (OKF v0.1) | **License**: AGPL-v3  
> **Repository**: `crapougnax/AGENTS.okf`  
> **Online Gist Reference**: https://gist.github.com/crapougnax/47971b85aa73dd702f4372a89858111c

---

## 🧭 1. Progressive Disclosure Discovery Protocol

This repository organizes development standards, architectural patterns, and GitFlow protocols into modular, atomic units formatted according to the **OKF v0.1** specification.

### Instruction for AI Agents:
- **Do not ingest all files into context at once.** Loading all rules exhausts context tokens and blurs domain focus.
- **Progressive Discovery:**
  1. Start by checking the root index: [Root Knowledge Index](content/index.md)
  2. Navigate into the relevant category index:
     - [Methodology & Quality](content/methodology/index.md) (15-year horizon, TDD, JSDoc, English, SonarQube)
     - [Workflow & GitFlow](content/workflow/index.md) (GitFlow develop/main, commits, gh CLI, SemVer tags, preview QA)
     - [Architecture & Patterns](content/architecture/index.md) (DDD, strict typing, fail-fast, state machines, queues, logging, local-first)
     - [Backend & Workers](content/backend-workers/index.md) (Express REST, api-triggers, Quatrain repository, PostgreSQL DDL, headless MVC)
     - [Frontend & UX Design System](content/frontend-ux/index.md) (High-glare mobile UX, contrast tokens, static CSS, React memo)
     - [Infrastructure & Deployment](content/infrastructure/index.md) (Containerfile, Docker Compose, K8s manifests, Terraform, ArgoCD, permissions)
     - [Knowledge Standards](content/knowledge/index.md) (OKF v0.1 specification)
  3. Load **ONLY** the specific atomic document(s) matching your active task.

---

## ⚡ 2. Default Authorized Commands (Autonomous vs Gated Scope)

To maximize velocity without risking accidental outages or regressions, the AI agent is authorized to proactively run non-destructive diagnostic, audit, and local build/test commands without asking for confirmation.

### 🟢 Autonomous Scope (Allowed by Default — Immediate Execution)
- **Standard Shell Utilities (Audit & Reading):**
  - `ls` (`-l`, `-la`, `-lh`, `-R`), `cat`, `head`, `tail` (`-n`, `-f`), `grep` (`-r`, `-i`, `-n`, `-E`), `rg`, `find`, `tree`, `diff`, `stat`, `file`, `wc`, `du` (`-sh`), `df` (`-h`), `ps aux`, `top -l 1`, `lsof -i :<port>`, `netstat`, `pwd`, `which`, `env` (read-only), `jq`, `yq`, `curl -I`, `curl -s -X GET`.
- **Git Operations (Read-Only):**
  - `git status`, `git log`, `git diff`, `git branch -a`, `git remote -v`, `git show`, `git tag -l`.
- **GitHub CLI (`gh`):**
  - `gh issue list/view/status`, `gh pr list/view/diff/checks/status`, `gh run list/view/watch`, `gh release list/view`, `gh repo view`, `gh auth status`, `gh gist list/view`.
- **Kubernetes Inspection (`kubectl`):**
  - `kubectl get <all|pods|svc|deploy|ingress|pvc|nodes|cm|secrets> [-n <ns>] [-o wide|yaml|json]`, `kubectl describe`, `kubectl logs [--tail=N] [-f]`, `kubectl top`, `kubectl cluster-info`, `kubectl kustomize`.
- **Containers & Compose (`podman` / `docker`):**
  - `podman ps [-a]`, `docker ps [-a]`, `podman images`, `docker images`, `podman logs`, `docker logs`, `podman inspect`, `docker inspect`, `podman stats --no-stream`, `docker compose ps`, `docker compose logs`, `docker compose config`.
- **Infrastructure as Code (`terraform` / `tofu`):**
  - `terraform fmt -check`, `terraform validate`, `terraform plan`, `terraform show`, `terraform state list/show`.
- **Local Testing & Compilation:**
  - `bun test`, `bun run build`, `bun run validate`, `yarn test`, `yarn lint`, `npm test`, `tsc --noEmit`, `poetry run pytest`, `cargo check/test`.

### 🛑 Gated Scope (Explicit Human Confirmation Strictly Required)
- **Database Mutations:** `UPDATE`, `DELETE`, `TRUNCATE`, `DROP TABLE`, `ALTER TABLE` on production/staging databases.
- **Cluster & Cloud Mutations:** `kubectl delete`, `kubectl apply/patch` directly on live clusters, `kubectl scale`, `terraform apply`.
- **Container Cleanup:** `podman rm -f`, `docker rm -f`, `docker system prune --volumes`.
- **Git Modifications:** `git push --force`, **merging Pull Requests** (human decision), deleting remote branches/tags.

👉 *See exhaustive matrix:* [Operational Permissions Matrix](content/infrastructure/operational-permissions-matrix.md)

---

## 🚀 3. Quick Topic Map

| If your immediate task involves... | Load this atomic unit: |
| :--- | :--- |
| **Git Branching, PRs, or Releases** | [GitFlow Protocol](content/workflow/gitflow-protocol.md) & [GitHub CLI Protocol](content/workflow/github-cli-protocol.md) |
| **Commit Messages & Issue Linking** | [Conventional Commits](content/workflow/conventional-commits.md) |
| **SemVer Tagging & Monorepo Releases** | [SemVer & Monorepo Tagging](content/workflow/semver-and-monorepo-tagging.md) |
| **Defining Entities & Repositories** | [Quatrain Repository Pattern](content/backend-workers/quatrain-repository-pattern.md) |
| **Database DDL Migrations & Naming** | [PostgreSQL DDL & Naming](content/backend-workers/postgresql-ddl-and-naming.md) |
| **Backend REST APIs or Middlewares** | [Backend API Architecture](content/backend-workers/backend-api-architecture.md) |
| **Asynchronous Event Processing** | [Background Workers & Triggers](content/backend-workers/background-workers-and-triggers.md) & [Queue Streaming](content/architecture/queue-and-event-streaming.md) |
| **Logging & Diagnostics** | [Structured Logging Standards](content/architecture/structured-logging.md) |
| **Mobile UI, Sunlight, Contrast or CSS** | [High-Glare Mobile UX](content/frontend-ux/high-glare-mobile-ux.md) & [Static CSS Hygiene](content/frontend-ux/static-css-and-interaction-hygiene.md) |
| **Container Images & Podman** | [Containerfile & Podman Standards](content/infrastructure/containerfile-and-podman.md) |
| **Local Stacks or On-Premise Compose** | [Docker Compose Recipes](content/infrastructure/docker-compose-deployment.md) |
| **Kubernetes Workloads & Scaling** | [Kubernetes Manifests & Deployments](content/infrastructure/k8s-manifests-and-deployments.md) |
| **Multi-Cloud IaC, Traefik & TLS** | [Multi-Cloud K8s & Terraform IaC](content/infrastructure/k8s-multi-cloud-iac.md) |
| **Operational Command Permissions** | [Operational Permissions Matrix](content/infrastructure/operational-permissions-matrix.md) |

---

## 📦 4. Importing into External Projects

To reuse these rules in an external repository:

### Option A: Ultra-Light Pointer File (Recommended)
Add a lightweight `AGENTS.md` at the project root pointing to this local or remote knowledge base:
```markdown
# Agent Guidelines Pointer
This project adheres to the standards defined in AGENTS.okf.
See root index: [AGENTS.okf Index](file:///Users/crapougnax/CODE/CRAPOUGNAX/AGENTS.okf/content/index.md)
Load only relevant atomic documents on demand.
```

### Option B: Git Submodule
Mount this repository directly into `.agents/`:
```bash
git submodule add https://github.com/crapougnax/AGENTS.okf .agents/rules
```
