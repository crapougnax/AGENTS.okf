---
type: protocol
title: GitHub CLI Operations & Pull Request Protocol
description: Standard operating procedure for gh CLI commands, mandatory PR metadata (assignee, milestone, closing issue keywords), and token keyring fallback.
tags:
  - github
  - cli
  - gh
  - pull-request
  - ci-cd
timestamp: 2026-09-12T05:00:00.000Z
category: workflow
status: active
---

# GitHub CLI Operations & Pull Request Protocol

All GitHub interactions (Issues, PRs, Workflow Runs, Gists) must be executed via the official GitHub CLI (`gh`).

## 🧭 Pull Request Creation Protocol

When opening a Pull Request, you **MUST systematically** provide:
1. **Assignee**: Target the active developer with `--assignee @me`.
2. **Milestone**: Attach the active sprint or milestone with `--milestone "<name>"`.
3. **Target Base**: Target `--base develop` for feature/fix branches.
4. **Issue Closing**: Explicitly include issue closing keywords in the body (`Closes #<issue>` or `Resolves #<issue>`).

### Standard Command Example:
```bash
gh pr create \
  --base develop \
  --head feat/12-user-auth \
  --assignee @me \
  --milestone "Release v2.1.0" \
  --title "feat(auth): implement session cookie validation (#12)" \
  --body "## Summary
Adds session cookie validation middleware with fail-fast expiration checks.

### Key Changes
- Introduced SessionValidatorInterface
- Added unit tests for edge cases

Closes #12"
```

## 🔄 Post-Push CI Monitoring
Whenever code is pushed or a PR is created:
1. Immediately inspect the triggered GitHub Actions workflow run:
   ```bash
   gh run list --limit 1
   ```
2. Monitor run execution until completion:
   ```bash
   gh run watch <run-id>
   ```
3. Confirm clean passage of all Quality Gates before requesting human review.

## 🔑 Token & Keyring Fallback
If environment tokens (such as CI runner tokens or third-party service tokens) conflict with your active user session, run `gh` with unset environment token variables to force fallback to the authenticated keyring session:
```bash
env -u GH_TOKEN -u GITHUB_TOKEN gh ...
```

## 🔗 Related Units
- [GitFlow Protocol](gitflow-protocol.md)
- [Conventional Commits Protocol](conventional-commits.md)
- [SemVer & Monorepo Tagging](semver-and-monorepo-tagging.md)
- [QA Preview Environments](qa-preview-environments.md)
- [Operational Permissions Matrix](../infrastructure/operational-permissions-matrix.md)
