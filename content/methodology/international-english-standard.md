---
type: standard
title: International English Communication Standard
description: Strict requirement mandating International English for all code symbols, comments, JSDoc, error messages, logging, and git commit messages.
tags:
  - communication
  - english
  - standards
  - international
timestamp: 2026-09-12T05:00:00.000Z
category: methodology
status: active
---

# International English Communication Standard

To facilitate open-source collaboration, global team handovers, and clean static code analysis, all internal codebase artifacts must be written strictly in International English.

## 🧭 Core Directives

### 1. English Everywhere at Code Level
The following elements **MUST** be written strictly in clear International English:
- Symbol names (classes, functions, interfaces, variables, enums, database columns)
- Code comments and JSDoc documentation
- Internal error messages, exceptions, and assertions
- Structured log outputs (`Queue.info`, `Backend.warn`, etc.)
- Fallback strings and configuration keys
- Git commit messages, Pull Request titles, and PR descriptions

### 2. Localization (i18n) Boundary
- User-facing UI applications may be localized into French, Spanish, German, or other languages via standard i18n dictionaries (e.g. `@quatrain/i18n`).
- However, all underlying key identifiers, code symbols, API payloads, and backend logs remain strictly in English.

### 3. When in Doubt, Ask
- Never make blind assumptions when interpreting ambiguous requirements or domain vocabulary.
- If a technical choice or domain concept is unclear, stop, ask, and clarify with the user.

## 🔗 Related Units
- [Documentation & JSDoc Standards](documentation-and-jsdoc.md)
- [Conventional Commits Protocol](../workflow/conventional-commits.md)
