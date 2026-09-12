---
name: gitflow-ops
description: Automated GitFlow lifecycle and GitHub operations. TRIGGER when branching out a new feature or fix from develop, creating a Pull Request, watching CI runs, or tagging and publishing SemVer releases.
---

# GitFlow Operations Skill (`gitflow-ops`)

This skill automates the GitFlow protocol and GitHub operations, ensuring strict branch cleanliness, correct PR metadata, and post-push CI watching.

## 🧭 Invocations

### 1. Branch Out a New Feature or Bugfix
```bash
bun run skills/gitflow-ops/scripts/branch.ts <type> <issue-number> <short-description>
```
- Validates that working directory is clean.
- Switches to `develop` and pulls latest commits.
- Creates and switches to `<type>/<issue-number>-<short-description>`.

### 2. Create Pull Request Targeting `develop`
```bash
bun run skills/gitflow-ops/scripts/pr.ts "<title>" ["<body>"]
```
- Pushes the active branch with `-u origin`.
- Enforces `--assignee @me`, `--base develop`, and attaches active milestone.
- Links and closes the issue ID extracted from branch name.
- Automatically launches `gh run watch` to monitor the triggered CI workflow.

### 3. Production Release & SemVer Tagging
```bash
bun run skills/gitflow-ops/scripts/release.ts <vX.Y.Z> ["<notes>"]
```
- Switches to `main`, pulls latest commits.
- Creates annotated tag `vX.Y.Z` and pushes tags to origin.
- Publishes official GitHub Release via `gh release create`.
