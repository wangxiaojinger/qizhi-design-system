# QIZHI Spin React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the five approved legacy Spin demos to one tested `@wangxiaojinger/qizhi-react` Spin implementation with same-source docs and three-viewport acceptance.

**Architecture:** `packages/qizhi-react/src/spin` owns public behavior, types, ARIA, and styles. `apps/qizhi-docs/src/spin` owns only demo layout, exact legacy copy, structured API metadata, and same-source code presentation. The existing `LoadingIcon`, `Button`, `Link`, `CodeIcon`, and `CopyIcon` remain the only reusable primitives.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Vite, Playwright, pnpm.

**Spec:** `docs/specs/qizhi-spin-contract-v1.md`

## Global Constraints

- Preserve all five legacy Demo titles, descriptions, order, copy, data, layout, sizes, initial state, and interaction.
- Demo TSX is the single preview/display/copy source.
- Demo code contains no native interactive controls, self-authored SVG, private descendant selectors, or inline layout styles.
- Only approved `loading`, `size`, `tip`, `icon`, `block`, `children`, native attributes, `className`, `style`, and `ref` enter v1.
- Automatic verification can reach only `candidate_pass`; independent acceptance remains `pending`.

---

### Task 1: Prove the public Spin contract is missing

**Files:**
- Create: `packages/qizhi-react/src/spin/Spin.test.tsx`
- Create: `packages/qizhi-react/src/spin/Spin.types.test.tsx`
- Modify: `tests/contracts/workspace.test.tsx`

**Interfaces:**
- Consumes: existing `LoadingIcon` and React DOM attributes.
- Produces: failing expectations for `Spin`, `SpinProps`, and `SpinSize` exports.

- [ ] Write tests that render standalone and container modes and assert the exact observable loading semantics.
- [ ] Write type cases accepting `20 | 30 | 40` and rejecting other numeric or string sizes.
- [ ] Run the scoped tests and confirm failure because the public Spin module/export is absent.

### Task 2: Implement the public Spin

**Files:**
- Create: `packages/qizhi-react/src/spin/Spin.tsx`
- Create: `packages/qizhi-react/src/spin/Spin.types.ts`
- Create: `packages/qizhi-react/src/spin/spin.css`
- Create: `packages/qizhi-react/src/spin/index.ts`
- Modify: `packages/qizhi-react/src/index.ts`
- Modify: `packages/qizhi-react/vite.config.ts`

**Interfaces:**
- Consumes: `LoadingIcon`.
- Produces: `Spin`, `SpinProps`, and `SpinSize` from `@wangxiaojinger/qizhi-react`.

- [ ] Implement a forwarded `HTMLDivElement` ref and native attribute forwarding.
- [ ] Implement standalone and child-container branches with default `loading=true` and `size=20`.
- [ ] Implement `tip`, `icon`, `block`, `aria-busy`, `role=status`, and `inert` behavior.
- [ ] Move all public Spin visual ownership to `packages/qizhi-react/src/spin/spin.css`.
- [ ] Run the component and type tests until green.

### Task 3: Prove the five-document Demo contract is missing

**Files:**
- Create: `apps/qizhi-docs/src/spin/spinDocs.test.tsx`

**Interfaces:**
- Consumes: approved Demo literals from the spec.
- Produces: failing expectations for five ordered demos, exact copy, real interaction, API metadata, and same-source actions.

- [ ] Assert the five literal titles and descriptions in order.
- [ ] Render the real docs island and assert all original card copy, sizes, labels, and initial loading state.
- [ ] Click the real secondary Button controller and assert all three Spin instances update visible and accessible state.
- [ ] Assert Demo sources use `@wangxiaojinger/qizhi-react`, contain no native interactive tags/SVG/private child selectors/inline layout styles, and stay within 80 columns.
- [ ] Run the test and confirm failure because the Spin docs island does not exist.

### Task 4: Build same-source Spin docs

**Files:**
- Create: `apps/qizhi-docs/src/spin/SpinDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/spin/SpinDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/spin/SpinApiTable.tsx`
- Create: `apps/qizhi-docs/src/spin/spinApi.ts`
- Create: `apps/qizhi-docs/src/spin/spinDocs.registry.ts`
- Create: `apps/qizhi-docs/src/spin/spinDocs.css`
- Create: `apps/qizhi-docs/src/spin/main.tsx`
- Create: five files under `apps/qizhi-docs/src/spin/demos/`
- Modify: `index.html`

**Interfaces:**
- Consumes: public `Spin`, `Button`, `Link`, `PromptLoadingIcon`, and shared codebox primitives.
- Produces: mounted `#component-spin` React island, five same-source demos, and structured Spin API metadata.

- [ ] Create each Demo as an independent TSX source using only public QIZHI controls.
- [ ] Reproduce the exact card copy, two-column-to-one-column layout, 360px width, 144px minimum height, 20/30/40px sizes, and initial loading state.
- [ ] Use a secondary `Button` to toggle all three container Spins in both directions.
- [ ] Reuse the shared Demo codebox, action spacing, highlighter, and copy status.
- [ ] Replace only the legacy `#component-spin` body with a React island host and add its module entry.
- [ ] Run component and docs tests until green.

### Task 5: Lock browser behavior and complete verification

**Files:**
- Create: `tests/e2e/spin-react-island.spec.ts`
- Create: `docs/verification/spin-react-island.md`

**Interfaces:**
- Consumes: the complete public and docs implementation.
- Produces: repeatable acceptance evidence for desktop, narrow, and mobile viewports.

- [ ] Assert component counts, exact computed indicator sizes, container widths, card minimum heights, row columns, opacity, overlay color, animation, `aria-busy`, and `inert`.
- [ ] Toggle loading off and on and assert visible state and interaction semantics move together.
- [ ] Check reduced motion, page/Demo overflow, console errors, and display/copy equality.
- [ ] Capture basic, container-loading, container-idle, tip, custom-icon, and size screenshots at 1440/1024/375 and inspect them.
- [ ] Run `node --check script.js`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and the scoped Playwright suite.
- [ ] Record exact pass/fail counts and keep independent acceptance `pending`.
