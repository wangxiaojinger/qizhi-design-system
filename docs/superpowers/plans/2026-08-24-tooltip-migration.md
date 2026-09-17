# Tooltip Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the five confirmed legacy 文字气泡 Tooltip demos into the QIZHI React library and documentation with one source for implementation, types, API docs, rendered code, and copied code.

**Architecture:** Add a lightweight public `Tooltip` component while extracting the positioning primitives shared with `Popover`. Keep Tooltip visual tokens independent from the heavier Popover panel. Register five raw-TSX-backed docs demos and lock their original copy, order, initial state, interaction, geometry, and responsive behavior.

**Tech Stack:** React, TypeScript, CSS, Vitest, Testing Library, Vite raw imports, Playwright.

**Spec:** Confirmed mapping in the 2026-08-24 conversation; legacy evidence in root `index.html`, `styles.css`, and `script.js`.

## Global Constraints

- Preserve all five legacy titles, descriptions, order, data, and visible copy exactly.
- Preserve empty descriptions as empty; the confirmed five descriptions are non-empty.
- Use only QIZHI naming and existing Button, Switch, Space, Typography, and docs codebox actions.
- Default Tooltip interaction supports hover, focus, click pinning, outside-click close, and Escape close.
- Preserve desktop wide-tooltip geometry while fixing the confirmed 375px 7px overflow defect.
- Demo TSX raw imports are the single source for rendered, displayed, and copied code.

---

### Task 1: Public Tooltip contract

**Files:**
- Create: `packages/qizhi-react/src/tooltip/Tooltip.types.ts`
- Create: `packages/qizhi-react/src/tooltip/Tooltip.tsx`
- Create: `packages/qizhi-react/src/tooltip/tooltip.css`
- Create: `packages/qizhi-react/src/tooltip/Tooltip.test.tsx`
- Create: `packages/qizhi-react/src/tooltip/Tooltip.types.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`
- Modify: `packages/qizhi-react/src/styles.css`

**Interfaces:**
- Produces `Tooltip`, `TooltipProps`, `TooltipPosition`, and `TooltipTrigger`.
- `TooltipProps` exposes `children`, `content`, `position`, `trigger`, `mini`, `color`, `popupVisible`, `defaultPopupVisible`, `onVisibleChange`, and `getPopupContainer`.

- [ ] Write failing rendering, controlled-state, hover/focus/click, outside-click, Escape, and type tests.
- [ ] Run the focused tests and verify failure because Tooltip does not exist.
- [ ] Extract shared position calculation from Popover without changing its public behavior.
- [ ] Implement the minimal Tooltip component and legacy visual contract.
- [ ] Export types/styles and run Tooltip plus Popover regression tests.

### Task 2: Five same-source documentation demos

**Files:**
- Create: `apps/qizhi-docs/src/tooltip/demos/*.tsx`
- Create: `apps/qizhi-docs/src/tooltip/tooltipDocs.registry.ts`
- Create: `apps/qizhi-docs/src/tooltip/tooltipApi.ts`
- Create: `apps/qizhi-docs/src/tooltip/TooltipApiTable.tsx`
- Create: `apps/qizhi-docs/src/tooltip/TooltipDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/tooltip/TooltipDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/tooltip/tooltipDocs.css`
- Create: `apps/qizhi-docs/src/tooltip/tooltipDocs.test.tsx`
- Modify: the existing docs island registry/entry files that mount component pages.

**Interfaces:**
- Consumes public `Tooltip`, `Button`, `Switch`, `Space`, and `Typography`.
- Produces a five-entry raw-TSX registry and API table typed from `TooltipProps`.

- [ ] Write a failing docs test for exact titles, descriptions, order, copy, API rows, and raw-source identity.
- [ ] Verify the docs test fails before production docs files exist.
- [ ] Implement the five demos and API table with raw TSX as the sole display/copy source.
- [ ] Register the Tooltip island without changing unrelated component pages.
- [ ] Run the focused docs tests and verify all contract assertions pass.

### Task 3: Browser contract and completion gate

**Files:**
- Create: `tests/e2e/tooltip-react-island.spec.ts`

**Interfaces:**
- Consumes the rendered Tooltip docs page.
- Produces screenshots and geometry/interaction evidence for 1440, 1024, and 375 viewports.

- [ ] Write E2E assertions for five demos, original copy/order, all 12 positions, initial controlled visibility, hover/focus/click/outside/Escape/switch behavior, dimensions, clipping ancestors, console state, and overflow.
- [ ] Run the E2E test before page registration and verify the expected failure.
- [ ] Fix only observed contract failures.
- [ ] Run focused unit tests, full typecheck, full tests, production build, and all three Playwright projects.
- [ ] Inspect fresh screenshots before reporting `candidate_pass`; keep independent final validation `pending`.
