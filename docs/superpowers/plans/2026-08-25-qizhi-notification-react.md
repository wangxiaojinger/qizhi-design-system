# QIZHI Notification React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the public QIZHI Notification component and migrate all seven legacy demos without contract drift.

**Architecture:** Add a Notification controller using the proven Message root/timer lifecycle, with Notification-specific rendering and four-corner layers. Raw Demo TSX files drive preview, display and copy; structured API data is constrained by public TypeScript keys.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library and Playwright.

**Spec:** `docs/specs/qizhi-notification-contract-v1.md`

## Global Constraints

- Preserve 7 demos, 19 triggers and exact legacy content.
- Use only public QIZHI components and icons in Demo TSX.
- Default duration is 4500ms and default position is `topRight`.
- Verify 1440, 1024 and 375; independent acceptance remains `pending`.

### Task 1: Public Notification contract

**Files:**
- Create: `packages/qizhi-react/src/notification/Notification.test.tsx`
- Create: `packages/qizhi-react/src/notification/Notification.types.ts`
- Create: `packages/qizhi-react/src/notification/Notification.tsx`
- Create: `packages/qizhi-react/src/notification/notification.css`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:** Produces `Notification`, `useNotification`, `NotificationConfig`, `NotificationApi` and supporting types.

- [ ] Write failing behavior tests for type rendering, id updates, timers, actions, remove/clear/config and hook holder.
- [ ] Run the focused test and verify failures are caused by the missing public component.
- [ ] Implement the minimal typed controller, renderer and styles.
- [ ] Run focused tests until green, then refactor shared lifecycle only when Message regression tests remain green.

### Task 2: Same-source documentation

**Files:**
- Create: `apps/qizhi-docs/src/notification/demos/*.tsx`
- Create: `apps/qizhi-docs/src/notification/notificationDocs.registry.ts`
- Create: `apps/qizhi-docs/src/notification/NotificationDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/notification/notificationApi.ts`
- Create: `apps/qizhi-docs/src/notification/NotificationApiTable.tsx`
- Create: `apps/qizhi-docs/src/notification/NotificationDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/notification/main.tsx`
- Create: `apps/qizhi-docs/src/notification/notificationDocs.css`
- Create: `apps/qizhi-docs/src/notification/notificationDocs.test.tsx`
- Modify: `index.html`, `script.js`, `vite.config.ts`

**Interfaces:** Consumes the public Notification API and produces seven raw-TSX-backed Demo records.

- [ ] Write failing docs tests for exact titles, descriptions, trigger count and source restrictions.
- [ ] Verify the test fails because the island and registry are missing.
- [ ] Implement seven formatted Demo files and the shared Button-baseline codebox.
- [ ] Add structured API tables and mount the React island while excluding it from legacy initialization.
- [ ] Run focused docs tests until green.

### Task 3: Browser and release verification

**Files:**
- Create: `tests/e2e/notification-react-island.spec.ts`
- Modify: `tests/e2e/demo-code-actions.spec.ts`
- Create: `docs/verification/notification-react-island.md`

**Interfaces:** Verifies the public runtime and documentation as a real consumer.

- [ ] Write browser assertions for 7 cards, 19 triggers, exact geometry, type colors, same-node updates, duration reset, actions, hook output, clipboard equality and overflow.
- [ ] Run 1440, 1024 and 375, capture open-state screenshots and inspect them manually.
- [ ] Run `node --check script.js`, typecheck, full Vitest, build, focused E2E and `git diff --check`.
- [ ] Record exact evidence and retain `pending` for independent acceptance.
