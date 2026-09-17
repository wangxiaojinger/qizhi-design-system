# Complete QIZHI Business Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every user-confirmed business Demo a complete public React
component whose caller supplies only documented data, copy, and callbacks.

**Architecture:** Preserve each current Demo's UI, order, initial state,
interaction, responsive behavior, and assets. Move stable structure and private
styles into `@wangxiaojinger/qizhi-react`; leave only example data and documentation layout in
the Demo. Existing lower-level components remain compatibility building blocks,
but Page Builder must prefer the complete business components.

**Tech Stack:** React 19, TypeScript, QIZHI React, CSS tokens, Vitest,
Testing Library, Playwright.

**Spec:** `docs/specs/qizhi-business-component-inventory-v1.md`

## Global Constraints

- Preserve the current Demo UI and interactions; do not redesign them.
- Demo TSX must not rebuild a completed business component.
- Public components use only QIZHI components/icons and public token variables.
- Synchronize implementation, types, root exports, API manifest, Demo source,
  Page Builder rules, unit contracts, E2E, and 1440/1024/375 screenshots.
- Keep legacy public primitives as compatibility APIs where already exported.

---

### Task 1: Inventory contract and RED gates

**Files:**
- Create: `docs/specs/qizhi-business-component-inventory-v1.md`
- Create: `tests/contracts/business-component-completeness.test.ts`
- Modify: affected docs tests and E2E specs

**Interfaces:**
- Produces the canonical component list and tests that fail for missing complete
  components or Demo-private composition.

- [x] Write the inventory with `complete`, `partial`, and `missing` evidence.
- [x] Add failing export, Demo-boundary, API, and Skill expectations.
- [x] Run direct TypeScript or focused tests and record the expected RED result.

### Task 2: BusinessGuide

**Files:**
- Create: `packages/qizhi-react/src/business-guide/*`
- Modify: `apps/qizhi-docs/src/business-guidance/demos/BasicDemo.tsx`
- Modify: guidance CSS, API, exports, tests, and Skill

**Interfaces:**
- Produces `BusinessGuide`, `BusinessGuideProps`, and `BusinessGuideStep`.
- Caller supplies fixed-step data, assets, links, close/restore callbacks.

- [x] Add a failing behavior and source-boundary test.
- [x] Move the exact guide structure, close/restore focus behavior, and styles.
- [x] Change the Demo to one `<BusinessGuide />` call and verify GREEN.

### Task 3: TaskOverview combination application

**Files:**
- Create: `packages/qizhi-react/src/task-overview/*`
- Modify: `apps/qizhi-docs/src/business-overview/demos/CombinationDemo.tsx`
- Modify: overview API, exports, tests, and Skill

**Interfaces:**
- Produces `TaskOverview`, its metric/task/space data types, and callbacks.
- Owns selection, filtering, four-item expansion, and fixed internal layout.

- [x] Add failing interaction and Demo-boundary tests.
- [x] Move the complete combination UI and behavior into the package.
- [x] Change the Demo to one `<TaskOverview />` call and verify GREEN.

### Task 4: Complete choice-card groups

**Files:**
- Create: `packages/qizhi-react/src/business-choice-cards/*`
- Modify: `BasicChoiceCardsDemo.tsx`, `IconChoiceCardsDemo.tsx`
- Modify: selection API, exports, tests, and Skill

**Interfaces:**
- Produces `BasicChoiceCards`, `IconChoiceCards`, and documented item Props.
- Owns the two-column group structure and choice behavior.

- [x] Add failing public-component and Demo-boundary tests.
- [x] Implement wrappers over `ChoiceCardGroup`/`ChoiceCard`.
- [x] Change each Demo to one complete component call and verify GREEN.

### Task 5: Complete service detail header

**Files:**
- Create: `packages/qizhi-react/src/service-detail-header/*`
- Modify: `apps/qizhi-docs/src/business-detail-header/demos/BasicDemo.tsx`
- Modify: detail-header API, CSS, exports, tests, and Skill

**Interfaces:**
- Produces `ServiceDetailHeader` and typed status, properties, audit members,
  tabs, and version rows.
- Owns online/offline action, tabs, version drawer/table, selection, and focus.

- [x] Add failing complete-interaction and Demo-boundary tests.
- [x] Move the exact Demo structure, drawer, table, tabs, and component styles.
- [x] Change the Demo to one `<ServiceDetailHeader />` call and verify GREEN.

### Task 6: Integrated delivery verification

**Files:**
- Modify: `component-api.json`, Skill tests, E2E, verification report

**Interfaces:**
- Consumes every public component from Tasks 2–5.
- Produces a current inventory and `candidate_pass` evidence record.

- [x] Regenerate and validate the API manifest.
- [x] Run direct TypeScript, package/root builds, Skill checks, and contracts.
- [x] Run 1440/1024/375 real interactions, overflow and console checks.
- [x] Inspect target screenshots and report independent verification as pending.
