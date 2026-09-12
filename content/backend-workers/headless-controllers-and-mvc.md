---
type: pattern
title: Headless Controllers & MVC Separation (CoreApps)
description: Decoupling UI presentation from state management by delegating business logic and filtering to headless controllers (@quatrain/ux-form, @quatrain/ux-list).
tags:
  - quatrain
  - react
  - mvc
  - headless
  - architecture
timestamp: 2026-09-12T05:00:00.000Z
category: backend-workers
status: active
---

# Headless Controllers & MVC Separation (CoreApps)

When building complex frontend applications (such as admin portals or data management dashboards), UI components must remain pure presenters.

## 🧭 Core Directives

### 1. Headless Controllers for State & Filtering
- Business states, complex filtering, and data validation **MUST** reside in headless, framework-agnostic controllers (such as `ListController` from `@quatrain/ux-list` or `FormController` from `@quatrain/ux-form`).
- Never mix heavy modeling, manual pagination arithmetic, or sorting logic directly inside React components:
  ```tsx
  // ❌ BAD: Mixing query/filter state directly in React component
  export function ProjectTable() {
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    // ... custom manual query loop inside component
  }

  // ✅ GOOD: Delegate to the pre-packaged headless controller
  import { ListController } from '@quatrain/ux-list';

  const controller = new ListController({ collection: 'projects' });
  export function ProjectTable() {
    const state = useController(controller);
    return <TableView items={state.items} onFilter={controller.setFilter} />;
  }
  ```

### 2. Pure Presentation Components
- Visual components should simply subscribe to controller state and render DOM elements.
- This decoupling allows the exact same business controller to be tested in pure Node/Bun environments without mounting DOM trees.

## 🔗 Related Units
- [Quatrain Repository Pattern](quatrain-repository-pattern.md)
- [React Performance & Memoization](../frontend-ux/react-performance-and-memoization.md)
