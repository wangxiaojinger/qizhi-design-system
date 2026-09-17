# QIZHI Upload React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a public QIZHI Upload and minimal Modal with eight same-source legacy demos and three-viewport evidence.

**Architecture:** `Upload` owns file input, drag/drop, list states, progress, retry, removal, limits, and picture cards. `Modal` owns accessible overlay behavior; demos only compose public components and demo-specific crop content. Raw formatted Demo TSX feeds rendering metadata, highlighting, and clipboard copy.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Vite, Playwright.

**Spec:** `docs/specs/qizhi-upload-contract-v1.md`

## Global Constraints

- Preserve all eight titles, descriptions, order, initial data, and interaction copy.
- Use `qizhi-*` names only and reuse complete public Demo/control contracts.
- Apply TDD red-green cycles before production implementation.
- Validate the eight prevention gates in the spec at 1440/1024/375.

---

### Task 1: Public Modal dependency

**Files:**
- Create: `packages/qizhi-react/src/modal/Modal.types.ts`
- Create: `packages/qizhi-react/src/modal/Modal.tsx`
- Create: `packages/qizhi-react/src/modal/modal.css`
- Test: `packages/qizhi-react/src/modal/Modal.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:** Produces `Modal` and `ModalProps` with open/cancel/confirm/Escape/focus restoration.

- [ ] Write tests for public actions, mask/Escape close, focus containment and restoration.
- [ ] Run the focused test and confirm missing-module failure.
- [ ] Implement the minimal portal Modal using public Button.
- [ ] Run focused tests and typecheck.

### Task 2: Public Upload state machine

**Files:**
- Create: `packages/qizhi-react/src/upload/Upload.types.ts`
- Create: `packages/qizhi-react/src/upload/Upload.tsx`
- Create: `packages/qizhi-react/src/upload/upload.css`
- Test: `packages/qizhi-react/src/upload/Upload.test.tsx`
- Test: `packages/qizhi-react/src/upload/Upload.types.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:** Produces `Upload`, `UploadFile`, `UploadRequestOptions`, and `UploadHandle`.

- [ ] Write tests for selection, progress/success/error, retry, remove guards, accept,
  drag/drop, limit recovery, disabled, picture-card, directory names, and ref methods.
- [ ] Run focused tests and confirm missing-module failure.
- [ ] Implement the minimal state machine and semantic DOM.
- [ ] Run focused tests and typecheck.

### Task 3: Eight same-source docs demos

**Files:**
- Create: `apps/qizhi-docs/src/upload/**`
- Modify: `vite.config.ts`, `index.html`, `script.js`
- Test: `apps/qizhi-docs/src/upload/uploadDocs.test.tsx`
- Test: `tests/contracts/workspace.test.tsx`

**Interfaces:** Consumes public Upload, Modal, Button, Slider, and icons; produces the Upload React Island and API table.

- [ ] Write registry tests locking eight titles/descriptions/order/data and forbidding raw
  inputs, private selectors, hand-built controls, and inline layout.
- [ ] Run tests and confirm missing-registry/Island failure.
- [ ] Implement eight formatted TSX demos, `?raw` registry, shared codebox and API table.
- [ ] Route `#component-upload` to the island and disable only its legacy initializer.
- [ ] Run docs tests and typecheck.

### Task 4: Full interaction and visual evidence

**Files:**
- Create: `tests/e2e/upload-react-island.spec.ts`
- Modify: `tests/e2e/demo-code-actions.spec.ts`
- Create: `docs/verification/upload-react-island.md`

**Interfaces:** Locks all eight prevention gates and three viewport contracts.

- [ ] Add interaction tests for select/drag/reject/confirm/cancel/remove/retry/limit/crop,
  Escape/focus, hover actions, source/clipboard equality, and consumer search.
- [ ] Add computed-style and geometry assertions for all relevant parent/child boxes.
- [ ] Run 1440/1024/375, generate open/active screenshots, and inspect every target state.
- [ ] Run `pnpm typecheck && pnpm test && pnpm build`, record exact evidence and limits.
