---
type: standard
title: High-Glare Mobile UX & Viewport Ergonomics
description: Interface guidelines for field productivity applications requiring high legibility under direct sunlight, constrained viewports, and generous touch targets.
tags:
  - ux
  - mobile
  - field
  - high-glare
  - design-system
timestamp: 2026-09-12T05:00:00.000Z
category: frontend-ux
status: active
---

# High-Glare Mobile UX & Viewport Ergonomics

Productivity applications operated outdoors, under direct sunlight, or in demanding physical environments require extreme visual clarity and fail-safe ergonomics.

## 🧭 Core Directives

### 1. Viewport Constraints
- **Max Width Container:** Constrain the main viewport width to **540px** and center it horizontally on wider desktop screens to preserve thumb reachability and prevent visual dispersion.

### 2. Generous Touch Targets
- **Action Buttons / Inputs:** Minimum height of **`76px`** for standard inputs, primary action buttons, and selectors.
- **Bottom Navigation Bars:** Minimum height of **`96px`** to guarantee reliable single-hand thumb navigation.
- **Form Fields:** Generous internal padding (`20px`) and large font sizes (`42px`) to accommodate rapid taps without trigger keyboard zoom overlap.

### 3. Dual-Typeface Typographic Hierarchy
- **Header & Landmark Font:** Use a distinct, highly geometric, heavy sans-serif typeface (e.g. *Space Grotesk*) to create immediate structural landmarks.
- **Body & Metrics Font:** Use a rounded, highly legible sans-serif typeface (e.g. *Avenir Next*, *Avenir*, or *Nunito*).
- **Metric Prominence:** Render primary real-time measurements in massive sizes (e.g. **`76px`**) with extra-thick weights (`900` / Black). Secondary metadata stays at normal weight (`400`/`500`) to keep the visual field uncluttered.

## 🔗 Related Units
- [Contrast & Status Tokens](contrast-and-status-tokens.md)
- [Static CSS & Interaction Hygiene](static-css-and-interaction-hygiene.md)
