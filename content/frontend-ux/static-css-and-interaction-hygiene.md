---
type: standard
title: Static CSS Hygiene & Native CSS Interactions
description: Styling rules prohibiting runtime inline styles in favor of static class bindings, CSS transitions, and native pseudo-classes (:hover, :focus, :has).
tags:
  - css
  - frontend
  - performance
  - styling
timestamp: 2026-09-12T05:00:00.000Z
category: frontend-ux
status: active
---

# Static CSS Hygiene & Native CSS Interactions

High-performance web applications maintain clean separation between layout styling and business logic by leveraging static stylesheets and native CSS engine capabilities.

## 🧭 Core Directives

### 1. Static CSS Rule (Zero Dynamic Inline Styles)
- Never generate dynamic inline styles (`style={{ ... }}`) from JavaScript or TypeScript code.
- All dimensions, paddings, color tokens, and alignments must reside in static `.css` stylesheets.
- Dynamic states are applied solely by binding predefined static class names (e.g. `.status-optimal`, `.card--selected`).

### 2. CSS-Driven Graphic Interactions
- Micro-interactions, hover states, active clicks, focus outlines, scale transforms, and animations must be handled natively by CSS using pseudo-classes (`:hover`, `:active`, `:focus-visible`, `:has()`) and CSS transitions.
- Do not attach JavaScript event handlers or trigger local component re-renders simply to toggle hover states or scale animations.
- Native CSS execution runs on the browser's compositor thread, preserving smooth 60fps/120fps frame rates even during heavy JavaScript computations.

## 🔗 Related Units
- [High-Glare Mobile UX](high-glare-mobile-ux.md)
- [React Performance & Memoization](react-performance-and-memoization.md)
