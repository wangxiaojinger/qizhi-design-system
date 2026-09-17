# QIZHI Drawer React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a public QIZHI Drawer with two same-source legacy demos and three-viewport evidence.

**Architecture:** `Drawer` owns Portal, mask, right-side panel, scroll lock, keyboard,
and focus lifecycle. Demos compose existing public controls; raw formatted Demo TSX
feeds registry, highlighting, and clipboard copy.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Vite, Playwright.

**Spec:** `docs/specs/qizhi-drawer-contract-v1.md`

## Global Constraints

- Preserve both legacy demos and all exact copy, data, states, sizes, and interactions.
- Use QIZHI public components and icons; do not hand-build existing capabilities.
- Apply red-green TDD before production implementation.
- Validate all eight prevention gates at 1440, 1024, and 375.

---

### Task 1: Public Drawer

**Files:**
- Create: `packages/qizhi-react/src/drawer/Drawer.types.ts`
- Create: `packages/qizhi-react/src/drawer/Drawer.tsx`
- Create: `packages/qizhi-react/src/drawer/drawer.css`
- Test: `packages/qizhi-react/src/drawer/Drawer.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:** Produces `Drawer` and `DrawerProps`; consumes public `Button` and
`CloseIcon`.

- [ ] Write failing tests for Portal visibility, exact default width, mask/close/footer
  behavior, Escape, scroll lock, focus containment, and focus restoration.
- [ ] Run `pnpm vitest run packages/qizhi-react/src/drawer/Drawer.test.tsx` and confirm
  failure because the module does not exist.
- [ ] Implement only the public v1 contract in the spec.
- [ ] Run the focused test and `pnpm typecheck` until both pass.

### Task 2: Two same-source docs demos

**Files:**
- Create: `apps/qizhi-docs/src/drawer/**`
- Modify: `vite.config.ts`, `index.html`, `script.js`
- Test: `apps/qizhi-docs/src/drawer/drawerDocs.test.tsx`

**Interfaces:** Consumes `Drawer`, `Button`, `Form`, `Input`, `Select`, `Switch`,
`Radio`, and public icons; produces the Drawer React Island and structured API table.

- [ ] Write failing registry/Island tests that lock the two literal titles,
  descriptions, order, body data, form data, and forbid raw form controls, Remix icons,
  inline layout, and private Drawer structure.
- [ ] Run the docs test and confirm failure because the Drawer registry is absent.
- [ ] Implement formatted Demo TSX, `?raw` registry, Button-baseline codebox, API table,
  scoped responsive styles, and the Drawer Island.
- [ ] Add the Vite entry, mark the section as a React island, and guard only the two
  legacy Drawer demos while retaining the detail version drawer initializer.
- [ ] Run focused docs tests and typecheck until green.

### Task 3: Full browser and delivery verification

**Files:**
- Create: `tests/e2e/drawer-react-island.spec.ts`
- Modify: `tests/e2e/demo-code-actions.spec.ts`
- Create: `docs/verification/drawer-react-island.md`

**Interfaces:** Locks both demos, the legacy version-drawer consumer, same-source code,
and all eight prevention gates.

- [ ] Write Playwright checks for all close paths, focus, body locking, form controls,
  Select Portal, disabled states, exact panel widths, transforms, box coordinates,
  code/clipboard equality, and every Drawer consumer.
- [ ] Run 1440/1024/375 and inspect basic-open, form-open, Select-open, and legacy
  version-drawer screenshots at all three sizes.
- [ ] Run `node --check script.js`, `pnpm typecheck`, `pnpm test`, `pnpm build`,
  the focused Playwright suite, and `git diff --check`.
- [ ] Record exact counts, visual findings, limits, `candidate_pass`, and independent
  `pending` status in the verification record.
