---
type: specification
title: Open Knowledge Format (OKF v0.1) Specification
description: The open standard for creating AI-consumable, git-backed knowledge bases using simple Markdown files with flat YAML frontmatter.
tags:
  - okf
  - specification
  - knowledge
  - markdown
  - agents
timestamp: 2026-09-12T05:00:00.000Z
category: knowledge
status: active
---

# Open Knowledge Format (OKF v0.1) Specification

The Open Knowledge Format (OKF) is an open specification designed to make technical knowledge natively readable by humans and AI coding agents without requiring proprietary databases or runtime build steps.

## 🧭 The Three Core Rules

### Rule 1: Standard Markdown with Flat YAML Frontmatter
- Every knowledge unit is a standard `.md` file with a flat YAML header bounded by `---`:
  ```yaml
  ---
  type: standard
  title: My Architectural Rule
  description: Short 1-2 sentence description of the concept or standard.
  tags:
    - architecture
    - typescript
  timestamp: 2026-09-12T05:00:00.000Z
  category: architecture
  status: active
  ---
  ```
- **No nesting:** Do not use nested YAML dictionaries.
- **No empty fields:** Exclude null, undefined, or empty string (`""`) attributes.

### Rule 2: Semantic Slugs & Clean Folder Trees
- File names and directories must use lowercase, slugified descriptive titles (e.g. `domain-driven-design.md`), never random UUIDs or machine hashes.
- Slugs must immediately describe the subject of the document.

### Rule 3: Progressive Disclosure via Index Files
- The root of the knowledge base contains an `index.md` listing sub-categories.
- Each category folder maintains an `index.md` summarizing and linking to all child documents.
- AI agents begin by reading `index.md` and traverse down only to the specific files relevant to their current prompt, minimizing token waste.

## 🔗 Related Units
- [Maintainability & 15-Year Horizon](../methodology/maintainability-15-year-horizon.md)
- [Documentation & JSDoc Standards](../methodology/documentation-and-jsdoc.md)
