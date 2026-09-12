---
type: standard
title: Contrast Safeguards & Status Color Tokens
description: Visual token system using muted, rich card backdrops paired with solid, vivid compliance status badges and strict text contrast safeguards.
tags:
  - ux
  - colors
  - accessibility
  - contrast
  - tokens
timestamp: 2026-09-12T05:00:00.000Z
category: frontend-ux
status: active
---

# Contrast Safeguards & Status Color Tokens

To prevent washed-out, pastel tones that disappear under ambient sunlight, UI designs separate muted, shaded card backdrops from high-contrast status indications.

## 🧭 Core Directives

### 1. Muted, Rich Card Backdrops
- Use deep, organic, solid-opacity shaded colors for container cards (deep forest green, dark slate-teal, rich mustard/burnt orange).
- All primary text on these card backgrounds must render in crisp **white (`#ffffff`)**.

### 2. Solid, Vivid Compliance Status Levels
Status badges and thresholds use solid, saturated colors:
- **Level 1 (Optimal / Excellent):** Vivid green (e.g. `#22c55e`).
- **Level 2 (Satisfactory / Nominal):** Bright yellow (e.g. `#facc15`).
- **Level 3 (Mediocre / Warning):** Saturated orange (e.g. `#f97316`).
- **Level 4 (Danger / Critical):** Saturated red (e.g. `#ef4444`).

### 3. Contrast Safeguard Rule for Text
Dynamic badge backgrounds must strictly enforce readability:
- Use **white text (`#ffffff`)** on Green, Orange, and Red badges.
- Use **dark navy text (`#0f172a`)** on Yellow badges. White text on yellow badges is strictly prohibited due to severe glare wash-out.

## 🔗 Related Units
- [High-Glare Mobile UX](/frontend-ux/high-glare-mobile-ux.md)
- [Static CSS & Interaction Hygiene](/frontend-ux/static-css-and-interaction-hygiene.md)
