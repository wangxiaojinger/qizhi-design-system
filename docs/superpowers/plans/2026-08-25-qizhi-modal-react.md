# QIZHI Modal React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the public QIZHI Modal, seven same-source legacy demos, and three-viewport verification.

**Architecture:** Extend the existing public Modal rather than creating a second implementation. Modal owns Portal, structure, Promise state, focus and scroll lifecycle; docs compose public controls and raw Demo TSX feeds preview/display/copy.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Vite, Playwright.

**Spec:** `docs/specs/qizhi-modal-contract-v1.md`

## Global Constraints

- Preserve all 7 legacy demos, 9 trigger shapes, exact copy, data, order, size and interactions.
- Reuse QIZHI public components and icons; no raw replacement for an existing capability.
- Apply red-green TDD before each production behavior.
- Validate all eight prevention gates at 1440, 1024 and 375.

---

### Task 1: Public Modal contract

**Files:**
- Modify: `packages/qizhi-react/src/modal/Modal.types.ts`
- Modify: `packages/qizhi-react/src/modal/Modal.tsx`
- Modify: `packages/qizhi-react/src/modal/modal.css`
- Test: `packages/qizhi-react/src/modal/Modal.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:** Produces `Modal`, `ModalProps`, `Modal.confirm`, `ModalHandle`; consumes public `Button`, `CloseIcon`, `LoadingIcon`.

- [ ] Write failing behavior tests for structure, defaults, all close paths, focus/scroll, Promise loading, custom/null footer, and confirm update/close.
- [ ] Run the focused test and confirm each new assertion fails for the missing behavior.
- [ ] Implement the minimal public contract and styles.
- [ ] Run focused tests and typecheck until green.

### Task 2: Seven same-source docs demos

**Files:**
- Create: `apps/qizhi-docs/src/modal/**`
- Modify: `vite.config.ts`, `index.html`, `script.js`
- Test: `apps/qizhi-docs/src/modal/modalDocs.test.tsx`

**Interfaces:** Consumes public Modal and existing controls; produces the Modal React Island, structured registry and API tables.

- [ ] Write failing registry/Island tests for seven literal demos, nine triggers, exact content, public imports, same-source code, and forbidden raw replacement controls.
- [ ] Run the docs test and confirm failure because the registry is absent.
- [ ] Implement formatted Demo TSX, raw-source registry, Button-baseline codebox, API metadata and scoped styles.
- [ ] Mount the Island and exclude only the migrated legacy triggers from `initModalDemos`.
- [ ] Run focused docs tests and typecheck until green.

### Task 3: Browser and delivery verification

**Files:**
- Create: `tests/e2e/modal-react-island.spec.ts`
- Modify: `tests/e2e/demo-code-actions.spec.ts`
- Create: `docs/verification/modal-react-island.md`

**Interfaces:** Locks modal behavior, same-source clipboard, three Upload consumers, and all eight prevention gates.

- [ ] Add E2E checks for nine triggers, async validation/loading, confirm/update, table selection, close/focus paths, computed geometry and overflow.
- [ ] Run 1440/1024/375 and inspect open-state screenshots.
- [ ] Run full syntax, type, test, build and diff verification.
- [ ] Record exact evidence, limitations, `candidate_pass`, and independent `pending` status.
