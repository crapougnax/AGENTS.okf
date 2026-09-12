---
type: protocol
title: Branch Isolation & Topic Switch Protocol
description: Strict rules prohibiting implicit code leakage between branches and defining the procedure when the user suddenly switches tasks during a session.
tags:
  - git
  - branch
  - workflow
  - discipline
timestamp: 2026-09-12T05:00:00.000Z
category: workflow
status: active
---

# Branch Isolation & Topic Switch Protocol

To prevent regressions, dirty commits, and cross-feature contamination, code isolation across Git branches is enforced with zero tolerance.

## 🧭 Core Directives

### 1. Zero Code Leakage
- No code may escape a branch implicitly.
- The **ONLY** valid way to integrate code into `develop` or `main` is via a formal, reviewed Pull Request (or exceptionally an explicit cherry-pick with user confirmation).
- Never commit unrelated changes to an active feature branch.

### 2. Abrupt Topic Switch Protocol
If the user or team pivots to a new topic or urgent fix mid-session:
1. **Pause Current Task:** Stop immediately and commit or stash any cleanly validated WIP on the active branch.
2. **Clarify Intent:** Confirm with the user that the ongoing task is being paused.
3. **Issue & Branch Creation:**
   - Create a dedicated GitHub issue if one does not already exist:
     ```bash
     gh issue create --title "<type>: <new-task>" --body "..."
     ```
   - Switch to `develop`, pull latest changes, and branch out:
     ```bash
     git checkout develop && git pull origin develop
     git checkout -b <type>/<issue-number>-<short-description>
     ```
4. **Isolate Implementation:** Implement, test, and commit the solution strictly within that dedicated branch.

## 🔗 Related Units
- [GitFlow Protocol](/workflow/gitflow-protocol.md)
- [Conventional Commits Protocol](/workflow/conventional-commits.md)
