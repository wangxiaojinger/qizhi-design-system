# QIZHI Input Demo Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Input Demo-owned component visuals, restore public-component reuse, expose the shared Demo CSS source, and close Input.TextArea state-style gaps without losing the approved 14-Demo order or behavior.

**Architecture:** Keep Input behavior in `@wangxiaojinger/qizhi-react`; keep documentation-only layout in the Input docs island. Replace the hand-built size selector and Dropdown triggers with public React components, make `style.height` work through the existing Input `style` API, and expose the exact shared CSS used by previews through the same registry/codebox path.

**Tech Stack:** React, TypeScript, CSS, Vitest, Testing Library, Playwright, Vite, pnpm.

**Spec:** `docs/specs/qizhi-input-contract-v1.md`

## Global Constraints

- Preserve all 14 approved Input Demo titles, descriptions except the inaccurate Search wording, order, data, and user-visible behavior.
- Use only QIZHI public React components where a matching component exists.
- Do not introduce a public Slider API; the native range remains a documentation controller because no React Slider is exported.
- Runtime Demo TSX, displayed TSX, and copied TSX remain the same raw source.
- Shared Demo CSS, displayed CSS, and copied CSS come from the same `inputDemos.css` raw source.
- Keep QIZHI naming and existing 1440/1024/375 acceptance.

---

### Task 1: Public component reuse and source contract

**Files:**
- Modify: `apps/qizhi-docs/src/input/inputDocs.test.tsx`
- Modify: `apps/qizhi-docs/src/input/demos/SizeDemo.tsx`
- Modify: `apps/qizhi-docs/src/input/demos/AddonDemo.tsx`
- Modify: `apps/qizhi-docs/src/input/demos/GroupDemo.tsx`
- Modify: `apps/qizhi-docs/src/input/inputDocs.registry.ts`
- Modify: `apps/qizhi-docs/src/input/InputDemoCodebox.tsx`

**Interfaces:**
- Consumes: `Radio.Group`, `Button`, `Dropdown`, and raw Vite CSS imports.
- Produces: `InputDemoDefinition.cssSource` and public-component-only interactive Demo controls where available.

- [ ] **Step 1: Write failing documentation tests**

Assert that Size uses `Radio.Group`, Dropdown triggers use `Button`, every registry item exposes the same non-empty CSS source, and codeboxes expose CSS copy feedback.

- [ ] **Step 2: Verify RED**

Run `pnpm exec vitest run apps/qizhi-docs/src/input/inputDocs.test.tsx`; expect failures for missing `Radio.Group`, `Button`, and `cssSource`.

- [ ] **Step 3: Implement the minimal reuse and registry changes**

Replace the custom size radio markup with `Radio.Group type="button"`; replace Dropdown raw buttons with `Button type="text"`; import `inputDemos.css?raw` once and pass it through every definition; render/copy that source from the codebox.

- [ ] **Step 4: Verify GREEN**

Run the focused docs test and confirm it passes.

### Task 2: Public Input style behavior and TextArea states

**Files:**
- Modify: `packages/qizhi-react/src/input/InputVariants.test.tsx`
- Modify: `packages/qizhi-react/src/input/Input.tsx`
- Modify: `packages/qizhi-react/src/input/input.css`

**Interfaces:**
- Consumes: existing `InputProps.style`, native `disabled`, and native `readOnly`.
- Produces: group height synchronized from public `style.height`; `qizhi-textarea--disabled` and `qizhi-textarea--readonly` states.

- [ ] **Step 1: Write failing component tests**

Assert that grouped Input maps numeric `style.height` to its internal height token and TextArea roots receive disabled/readonly state classes.

- [ ] **Step 2: Verify RED**

Run `pnpm exec vitest run packages/qizhi-react/src/input`; expect missing state classes and height token.

- [ ] **Step 3: Implement minimal public behavior**

Derive the internal height token inside Input from `style.height`; add TextArea state classes and semantic token-based disabled/readonly CSS.

- [ ] **Step 4: Verify GREEN**

Run Input component tests and confirm they pass.

### Task 3: Demo style ownership and full verification

**Files:**
- Modify: `apps/qizhi-docs/src/input/inputDemos.css`
- Modify: `apps/qizhi-docs/src/input/inputDocs.registry.ts`
- Modify: `tests/e2e/input-react-island.spec.ts`
- Modify: `docs/specs/qizhi-input-contract-v1.md`
- Modify: `docs/verification/input-react-island.md`

**Interfaces:**
- Consumes: the public-component markup from Tasks 1-2.
- Produces: Input-scoped Demo CSS, correct semantic tokens, and browser contract assertions.

- [ ] **Step 1: Write failing E2E assertions**

Assert public Radio and Button markup, correct arrow token color, shared CSS display/copy controls, TextArea disabled styling, and no horizontal overflow.

- [ ] **Step 2: Verify RED**

Run the desktop Input E2E project and confirm the new assertions fail for current styles/controls.

- [ ] **Step 3: Scope and normalize Demo CSS**

Scope all Demo layout rules to `#component-input`, define the missing status row locally, replace the undefined token, and move Dropdown-addon composition padding to the public Input stylesheet.

- [ ] **Step 4: Align copy and documentation**

Correct the Search description to describe a search icon, update the v1 contract and verification record, and retain the native range as an explicitly documented controller.

- [ ] **Step 5: Run complete verification**

Run focused tests, `pnpm typecheck`, `pnpm build`, full Input E2E at 1440/1024/375, inspect screenshots, and confirm console and overflow checks remain clean.
