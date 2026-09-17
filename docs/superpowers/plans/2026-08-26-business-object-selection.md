# Business Object Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the four legacy 对象选择 demos into React with public ChoiceCard and ObjectSelector APIs, exact legacy content and geometry, and a real project filter.

**Architecture:** Add focused public component modules under `packages/qizhi-react/src`, then compose them in a dedicated docs island whose TSX files are the preview/display/copy source. Reuse QIZHI Button, Modal, Input, Select, Radio, and icon-library components rather than rebuilding their behavior.

**Tech Stack:** React 19, TypeScript, QIZHI React, Vitest, Testing Library, Playwright, Vite.

**Spec:** Confirmed legacy contract in `index.html:15726-15819`, `styles.css:8781-9258`, and `script.js:9959-10162`.

## Global Constraints

- Preserve the four original titles, descriptions, order, data, initial states, dimensions, and keyboard/close paths.
- Implement real project filtering in addition to legacy name search.
- Demo TSX must contain no native interactive tags, handwritten SVG, inline layout styles, or selectors targeting another public component's private `__*` descendants.
- Use the Button Demo action area and one TSX source for preview, displayed code, and copied code.
- Any public API change must update implementation, types, root exports, API docs, unit tests, E2E, and verification evidence.
- Final status is at most `candidate_pass`; independent visual approval remains pending.

---

### Task 1: Public ChoiceCard API

**Files:**
- Create: `packages/qizhi-react/src/choice-card/ChoiceCard.tsx`
- Create: `packages/qizhi-react/src/choice-card/ChoiceCard.types.ts`
- Create: `packages/qizhi-react/src/choice-card/choiceCard.css`
- Create: `packages/qizhi-react/src/choice-card/ChoiceCard.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces `ChoiceCard`, `ChoiceCardGroup`, `ChoiceCardProps`, and `ChoiceCardGroupProps` with controlled/uncontrolled single selection, `small | default`, disabled cards, optional icon, click, and arrow-key selection.

- [ ] Write tests for uncontrolled initial selection, controlled selection, disabled blocking, and arrow-key looping; run them and confirm missing exports fail.
- [ ] Implement the minimum public components and exact legacy basic/small/default/icon geometry.
- [ ] Run ChoiceCard unit tests, typecheck, and public export checks.

### Task 2: Public ObjectSelector API

**Files:**
- Create: `packages/qizhi-react/src/object-selector/ObjectSelector.tsx`
- Create: `packages/qizhi-react/src/object-selector/ObjectSelector.types.ts`
- Create: `packages/qizhi-react/src/object-selector/objectSelector.css`
- Create: `packages/qizhi-react/src/object-selector/ObjectSelector.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces `ObjectSelector`, `ObjectSelectorItem`, `ObjectSelectorVersion`, and controlled/uncontrolled value props.
- Reuses `Button`, `Modal`, `Input`, `Select`, `Radio`, `SelectModelColorIcon`, and `SwitchIcon`.
- Supports object search, real project filtering, version selection, confirm/cancel, committed-value display, focus restoration, Escape, dialog focus trap, and object-list arrow keys.

- [ ] Write behavior tests for initial committed value, project filtering, search invalidation, version reset, disabled confirm, cancel rollback, confirm commit, and reopening.
- [ ] Run the tests and verify failures are caused by the missing component.
- [ ] Implement the minimum component and exact 920px legacy modal layout with responsive collapse.
- [ ] Run ObjectSelector tests, ChoiceCard tests, and typecheck.

### Task 3: React documentation island and same-source demos

**Files:**
- Create: `apps/qizhi-docs/src/business-object-selection/` island, registry, API table, codebox, CSS, tests, and four Demo TSX files.
- Modify: `index.html`

**Interfaces:**
- Consumes the public ChoiceCard and ObjectSelector APIs.
- Produces route panel `#business-object-selection`, anchors for the four legacy demos plus `#business-object-selection-API`, and raw-imported TSX sources.

- [ ] Add failing docs tests for exact intro/demo copy and order, public-only interaction tags, no SVG/inline style/private selectors, two standard action buttons per Demo, and API tables.
- [ ] Replace the static panel with the React island and register its module script.
- [ ] Implement four same-source demos with exact data/defaults and reusable public icons.
- [ ] Add ChoiceCard/ChoiceCardGroup/ObjectSelector API records and verify docs tests pass.

### Task 4: Browser contract and verification

**Files:**
- Create: `tests/e2e/business-object-selection-react-island.spec.ts`
- Create: `docs/verification/business-object-selection-react-island.md`

**Interfaces:**
- Verifies 1440, 1024, and 375 behavior, geometry, overflow, console state, source/copy equality, and screenshots.

- [ ] Add the E2E test and run it against the pre-implementation page to confirm contract failures.
- [ ] Verify all four initial states, disabled behavior, keyboard cycling, hover/focus, search, project filter, version reset, cancel rollback, confirm commit, switch/reopen, mask/close/Escape paths, and focus restoration.
- [ ] Record direct-child dimensions, modal/ancestor clipping, `scrollWidth <= clientWidth`, and inspect target screenshots.
- [ ] Run targeted unit tests, full tests, typecheck, build, E2E, and `git diff --check`; record exact results and pending independent approval.
