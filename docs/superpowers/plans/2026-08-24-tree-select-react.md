# TreeSelect React Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the ten confirmed legacy TreeSelect demos to a QIZHI-owned React component with matching UI, real search/lazy-loading behavior, typed API, and same-source display/copy documentation.

**Architecture:** Build a public `TreeSelect` around the shared `qizhi-control-container`, with focused model helpers and a tree popup renderer. Reuse QIZHI `Checkbox`, `Tag`, icons, `LoadingIcon`, `Button`, and the docs-only `DemoSegmentedControl`; do not reuse `Dropdown.Menu` because TreeSelect requires `tree/treeitem` semantics rather than `menu/menuitem`.

**Tech Stack:** React 19, TypeScript, CSS, Vitest, Testing Library, Vite.

**Spec:** `docs/specs/qizhi-tree-select-contract-v1.md`

## Global Constraints

- Preserve the ten confirmed legacy Demo titles, descriptions, counts, order, layout, dimensions, states, and interactions.
- Default control width is 300px; sizes are default 32px, large 36px, and huge 40px.
- Use QIZHI public components and icons; do not introduce Arco names or dependencies.
- Displayed and copied Demo code must come from the same formatted TSX source.
- Public API contains only capabilities implemented and verified by QIZHI.
- Default visible copy is Simplified Chinese; standard component names may remain English.
- Do not claim browser, test, type, or build verification that was not run.

---

### Task 1: Freeze the typed contract and tree model

**Files:**
- Create: `docs/specs/qizhi-tree-select-contract-v1.md`
- Create: `packages/qizhi-react/src/tree-select/TreeSelect.types.ts`
- Create: `packages/qizhi-react/src/tree-select/treeSelectModel.ts`
- Test: `packages/qizhi-react/src/tree-select/treeSelectModel.test.ts`
- Test: `packages/qizhi-react/src/tree-select/TreeSelect.types.test.tsx`

**Interfaces:**
- Produces `TreeSelectOption`, single/multiple props, label-in-value values, size/status types, search/load callbacks, and pure flatten/filter/update helpers.

- [ ] Write failing model and type tests for literal filtering, selected paths, immutable child updates, and single/multiple value contracts.
- [ ] Run the targeted tests and confirm failure because the TreeSelect files do not exist.
- [ ] Implement the minimal types and pure helpers.
- [ ] Run targeted tests until green.

### Task 2: Implement the public control and popup behavior

**Files:**
- Create: `packages/qizhi-react/src/tree-select/TreeSelect.tsx`
- Create: `packages/qizhi-react/src/tree-select/TreeSelectPopup.tsx`
- Create: `packages/qizhi-react/src/tree-select/treeSelect.css`
- Test: `packages/qizhi-react/src/tree-select/TreeSelect.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Consumes model/types from Task 1 and existing `Checkbox`, `Tag`, `CloseIcon`, `ChevronDownIcon`, `ChevronRightIcon`, `SearchIcon`, and `LoadingIcon`.
- Produces exported `TreeSelect` with single/multiple, controlled/uncontrolled, clear, search, async `loadMore`, `onSearch`, `renderFormat`, `labelInValue`, `addBefore`, size, status, and keyboard behavior.

- [ ] Write failing behavior tests for selection, clearing, multiple tags, local search, remote search callback, async child loading, keyboard open/close, and ARIA tree semantics.
- [ ] Run the targeted tests and confirm the expected missing-component failure.
- [ ] Implement the minimal component, popup, and styles.
- [ ] Export the component and CSS from the package entry.
- [ ] Run component, package type, and regression tests until green.

### Task 3: Build the ten same-source documentation demos

**Files:**
- Create: `apps/qizhi-docs/src/tree-select/` documentation island, registry, API table, CSS, and ten files under `demos/`.
- Test: `apps/qizhi-docs/src/tree-select/treeSelectDocs.test.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes public `TreeSelect` from Task 2.
- Produces the exact ten legacy Demo titles in order and `?raw` source used by both display and copy actions.

- [ ] Write failing docs tests for ten titles/order, visible Chinese copy, API rows, no filename headings, and Demo source lines at most 80 characters.
- [ ] Run docs tests and confirm failure because the island does not exist.
- [ ] Implement all ten demos, including real delayed `loadMore` and real controlled `onSearch` results.
- [ ] Add the TreeSelect React island script to `index.html`.
- [ ] Run docs tests and typecheck until green.

### Task 4: Verify behavior, visuals, and delivery gates

**Files:**
- Verify all files from Tasks 1–3; change only when a failing check identifies a scoped defect.

**Interfaces:**
- Produces candidate delivery evidence; independent final approval remains pending.

- [ ] Run targeted TreeSelect component, type, and docs tests.
- [ ] Run `pnpm test`, `pnpm typecheck`, `pnpm build`, and `git diff --check`.
- [ ] Verify all ten demos at 1440px, 1024px, and 375px with no horizontal overflow.
- [ ] Exercise click, keyboard, clear, multiple, local search, remote search, and async loading paths.
- [ ] Capture and inspect screenshots of closed, open, multiple, search, and mobile states.
- [ ] Report only verified results and list any warnings or unverified limits.

