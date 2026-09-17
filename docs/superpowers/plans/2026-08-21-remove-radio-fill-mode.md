# Remove Radio Fill Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove filled Radio buttons from the public QIZHI API while preserving filled segmented controls as documentation-only UI.

**Architecture:** `@wangxiaojinger/qizhi-react` will expose only standard and outline-button Radio variants. Documentation controls will use an internal `DemoSegmentedControl`; the shared segmented visual rules will live under `apps/qizhi-docs`, not inside Radio package CSS.

**Tech Stack:** React, TypeScript, CSS, Vitest, Playwright, Vite.

**Spec:** `docs/specs/qizhi-radio-contract-v1.md`

## Global Constraints

- `mode` and filled Radio behavior must not remain in the public package, API table, copied source, or Radio docs.
- Demo controls may retain the confirmed segmented appearance but must not be exported from `@wangxiaojinger/qizhi-react`.
- Existing Icon, Input, Pagination, and Table demo controls must retain their segmented styling.
- User-visible copy remains Simplified Chinese.

---

### Task 1: Lock the reduced public contract

**Files:**
- Modify: `packages/qizhi-react/src/radio/Radio.types.test.tsx`
- Modify: `packages/qizhi-react/src/radio/Radio.test.tsx`
- Modify: `apps/qizhi-docs/src/radio/radioDocs.test.tsx`
- Modify: `tests/e2e/radio-react-island.spec.ts`

**Interfaces:**
- Consumes: existing `Radio`, `Radio.Group`, and Radio documentation registry.
- Produces: failing assertions that reject `mode`, require three demos, and retain working outline controls.

- [ ] Add `@ts-expect-error` assertions for `mode="fill"` on `Radio` and `Radio.Group`.
- [ ] Change component tests to expect button type to render only `qizhi-radio-button` classes.
- [ ] Change docs tests and E2E expectations from four demos to three and forbid copied `mode="fill"`.
- [ ] Run the targeted Vitest and Playwright tests and confirm they fail for the old public contract.

### Task 2: Remove Radio fill implementation and documentation

**Files:**
- Modify: `packages/qizhi-react/src/radio/Radio.types.ts`
- Modify: `packages/qizhi-react/src/radio/Radio.tsx`
- Modify: `packages/qizhi-react/src/radio/radio.css`
- Modify: `apps/qizhi-docs/src/radio/radioApi.ts`
- Modify: `apps/qizhi-docs/src/radio/radioDocs.registry.ts`
- Delete: `apps/qizhi-docs/src/radio/demos/FillButtonDemo.tsx`

**Interfaces:**
- Consumes: the failing public-contract tests from Task 1.
- Produces: Radio API with `type="radio" | "button"` and no `mode` property.

- [ ] Remove `RadioMode`, both `mode` props, context mode state, and fill class branches.
- [ ] Remove filled Radio CSS rules and hidden-input coupling to segmented items.
- [ ] Remove the fill demo registration, API rows, raw copied source, and implementation file.
- [ ] Run targeted package and docs tests until the reduced API passes.

### Task 3: Preserve documentation-only segmented controls

**Files:**
- Create: `apps/qizhi-docs/src/demo-controls/DemoSegmentedControl.tsx`
- Create: `apps/qizhi-docs/src/demo-controls/demoSegmented.css`
- Create: `apps/qizhi-docs/src/demo-controls/DemoSegmentedControl.test.tsx`
- Modify: `apps/qizhi-docs/src/radio/demos/OutlineButtonDemo.tsx`
- Modify: `apps/qizhi-docs/src/{radio,input,table,pagination,icon}/main.tsx`

**Interfaces:**
- Consumes: `value`, `options`, `onChange`, `aria-label`, and optional size.
- Produces: internal `DemoSegmentedControl<T extends string | number>` rendered as an accessible radiogroup and not exported from the package.

- [ ] Test selection, `aria-checked`, disabled handling, and absence from `@wangxiaojinger/qizhi-react` exports.
- [ ] Implement the internal control using buttons and `qizhi-segmented` classes.
- [ ] Move the confirmed segmented CSS from Radio package CSS into the docs shared stylesheet.
- [ ] Import the stylesheet from each docs entry that consumes the classes and migrate the two Outline Demo controllers.
- [ ] Run component/docs tests and verify the existing consumers retain computed geometry.

### Task 4: Synchronize contract and verify

**Files:**
- Modify: `docs/specs/qizhi-radio-contract-v1.md`
- Modify: `docs/verification/radio-react-island.md`

**Interfaces:**
- Consumes: the final reduced implementation and test evidence.
- Produces: synchronized human- and machine-readable Radio v1 scope.

- [ ] Rewrite the Radio v1 scope, API tables, demo count, copy rules, and AI prohibition to exclude fill mode.
- [ ] Run `pnpm verify` and confirm typecheck, tests, docs build, package build, and smoke build succeed.
- [ ] Run Radio Playwright at 1440/1024/375, exercise mouse and keyboard controls, and inspect fresh screenshots.
- [ ] Record only commands and visual checks actually completed; retain `candidate_pass` and independent verification `pending`.
