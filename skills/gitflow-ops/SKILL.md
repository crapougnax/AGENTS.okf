---
name: gitflow-ops
description: Automated GitFlow lifecycle and GitHub operations scripts for branching, PRs, and SemVer releases.
triggers:
  - create branch
  - open pull request
  - create PR
  - tag release
  - semver
  - feat/ branch
  - fix/ branch
  - push feature
  - publish release
  - watch CI run
---

# GitFlow Operations Skill (`gitflow-ops`)

This skill automates the GitFlow protocol and GitHub operations, ensuring strict branch cleanliness, correct PR metadata, and post-push CI watching.

> **Invocation Note**: All scripts must be called with their **absolute path** (or from `AGENTS.okf/` root) since this skill is used across multiple project workspaces.

## 🧭 Invocations

### 1. Branch Out a New Feature or Bugfix
```bash
bun run /Users/crapougnax/CODE/CRAPOUGNAX/AGENTS.okf/skills/gitflow-ops/scripts/branch.ts <type> <issue-number> <short-description>
```
- Validates that working directory is clean.
- Switches to `develop` and pulls latest commits.
- Creates and switches to `<type>/<issue-number>-<short-description>`.

### 2. Pause Current Task & Switch Topic
```bash
bun run /Users/crapougnax/CODE/CRAPOUGNAX/AGENTS.okf/skills/gitflow-ops/scripts/topic-switch.ts "<brief-task-description>"
```
- Creates a named WIP stash: `wip/<branch>-<timestamp>`.
- Pushes current branch to origin to preserve remote state.
- Checks out and pulls `develop`, prints resumption instructions.

### 3. Create Pull Request Targeting `develop`
```bash
bun run /Users/crapougnax/CODE/CRAPOUGNAX/AGENTS.okf/skills/gitflow-ops/scripts/pr.ts "<title>" ["<body>"]
```
- Pushes the active branch with `-u origin`.
- Enforces `--assignee @me`, `--base develop`, and attaches the active open milestone (sorted by due date).
- Links and closes the issue ID extracted from branch name.
- Automatically launches `gh run watch` to monitor the triggered CI workflow.

### 4. Production Release & SemVer Tagging
```bash
bun run /Users/crapougnax/CODE/CRAPOUGNAX/AGENTS.okf/skills/gitflow-ops/scripts/release.ts <vX.Y.Z> ["<notes>"]
```
- Switches to `main`, pulls latest commits.
- **Guards** that `develop` has no unmerged commits ahead of `main` — exits with an error if `develop → main` PR hasn't been merged yet.
- Creates annotated tag `vX.Y.Z` and pushes tags to origin.
- Publishes official GitHub Release via `gh release create`.

