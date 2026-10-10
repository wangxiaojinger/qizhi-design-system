# QIZHI Table Token Consumption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make QIZHI Table consume its public Component Tokens without changing existing visuals, interactions, responsive density, or legacy override behavior.

**Architecture:** Keep `packages/qizhi-tokens/src/tokens.json` as the sole editable Token source, add one compact inline-padding Token required by the existing mobile breakpoint, and consume all Table Component Tokens through three-level CSS fallbacks. Correct two independently confirmed stale E2E assertions before measuring Table regressions, then prove default visual parity and both component-token and legacy-token override paths.

**Tech Stack:** JSON design-token manifest, Node.js ESM generation and `node:test`, CSS custom properties, React/Vitest, Vite, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-08-qizhi-table-token-consumption-design.md`

## Global Constraints

- Do not remove or rename any existing public Token or CSS variable.
- `packages/qizhi-tokens/src/tokens.json` remains the only editable source of public Tokens and metadata.
- Preserve Table public props, types, exports, Demo data, Demo order, interaction behavior, natural wrapping, and explicit `ellipsis` behavior.
- Preserve default computed styles at 1440, 1024, and 375px.
- CSS fallback order is Component Token, then existing public variable, then current literal.
- Component Tokens may reference Seed, Map, or Alias Tokens, but not other Component Tokens.
- Keep nested expanded-cell scoping direct-child only; do not introduce a descendant selector that affects nested Table cells.
- Do not modify Tooltip, Popover, Dropdown, publish packages, deploy docs, or upgrade external consumers.
- Every production change follows RED → GREEN TDD.
- Implementation evidence is at most `candidate_pass`; independent final verification remains `pending`.

## Review Focus

- Loading `table.css` without the Token stylesheet must retain the current literals through nested fallbacks; Task 3 pins the complete fallback strings.
- Overriding an old variable such as `--space-16` must still affect Table when Component Tokens are loaded; Task 4 exercises the inherited reference chain in a browser.
- Overriding `--component-table-cell-padding-inline` must not defeat the 375px compact rule; Task 4 tests desktop and mobile responsibilities independently.
- Sortable headers use `.qizhi-table__sort` rather than direct `th` padding; Task 3 and Task 4 cover sortable and non-sortable cells at all three densities.
- Expanded rows and nested Tables must not inherit outer expanded-cell padding; Task 3 restores the established direct-child selector and Task 4 pins its rendered geometry.

---

## File Structure

- `tests/e2e/tabs-react-island.spec.ts`: align the Demo count/name with the existing 12-entry registry.
- `tests/e2e/form-react-island.spec.ts`: align the bulk-edit assertions with the existing visible summary contract.
- `packages/qizhi-tokens/src/tokens.json`: update Table Token lifecycle descriptions and add compact inline padding.
- `packages/qizhi-tokens/tests/tokens.node.mjs`: pin the 12-token values, metadata, CSS consumption, and fallback chains.
- `packages/qizhi-tokens/MIGRATION.md`: generated mapping updated by the package build.
- `packages/qizhi-react/src/table/table.css`: consume Table Component Tokens while preserving existing literals.
- `tests/e2e/table-react-island.spec.ts`: verify component and legacy override paths plus existing Table behavior.
- `tests/e2e/token-phase2-table-visual-baseline.spec.ts`: compare stable Table regions against commit `524346e`.
- `tests/e2e/token-phase2-table-visual-baseline.spec.ts-snapshots/`: macOS Chrome baseline images for three viewports.
- `docs/superpowers/specs/2026-10-08-qizhi-table-token-consumption-verification.md`: record exact candidate evidence and remaining boundaries.

### Task 1: Repair Confirmed Stale Form and Tabs E2E Contracts

**Files:**
- Modify: `tests/e2e/tabs-react-island.spec.ts:3-20`
- Modify: `tests/e2e/form-react-island.spec.ts:279-287`
- Read: `apps/qizhi-docs/src/tabs/tabsDocs.registry.ts`
- Read: `apps/qizhi-docs/src/tabs/tabsDocs.test.tsx`
- Read: `apps/qizhi-docs/src/form/demos/BulkEditDemo.tsx`
- Read: `apps/qizhi-docs/src/form/formDocs.test.tsx`

**Interfaces:**
- Consumes: current same-source docs contracts: 12 Tabs demos and Form bulk-edit summaries without raw patch JSON.
- Produces: trustworthy Form/Tabs E2E prerequisites for Task 5's final browser run.

- [ ] **Step 1: Reproduce both stale failures against the current preview**

Run:

```bash
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test \
  tests/e2e/form-react-island.spec.ts \
  tests/e2e/tabs-react-island.spec.ts --workers=1
```

Expected: FAIL because Tabs receives 12 rather than 11 demos and Form cannot find `role=status` named `批量编辑补丁`.

- [ ] **Step 2: Align the E2E assertions with the existing same-source contracts**

Change the Tabs test title/count to 12. In Form, after generating the patch, assert that the `批量编辑提交信息` region contains `本次目标：member-1、member-2、member-3`, contains no `批量编辑补丁` status, and contains no raw `"department": "product"`; retain the partial-success and failure-detail checks.

- [ ] **Step 3: Run the focused browser tests**

Run the Step 1 command.

Expected: 6 passed across desktop-1440, narrow-1024, and mobile-375 with no product implementation changes.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/form-react-island.spec.ts tests/e2e/tabs-react-island.spec.ts
git commit -m "test(docs): align form and tabs browser contracts"
```

### Task 2: Promote the Table Token Manifest

**Files:**
- Modify: `packages/qizhi-tokens/src/tokens.json:4613-4712`
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs:285-306`
- Regenerate: `packages/qizhi-tokens/MIGRATION.md`

**Interfaces:**
- Consumes: the 11 deferred `component.table.*` definitions from phase one and `space.12`.
- Produces: 12 stable Table Component Tokens, including `component.table.cell.padding.inline.compact = var(--space-12)`, for Tasks 3-5.

- [ ] **Step 1: Write the failing manifest contract**

Rename the deferred mapping test to `Table publishes stable component tokens for stylesheet consumption`. Extend its exact expected values with:

```js
"component.table.cell.padding.inline.compact": "var(--space-12)",
```

For every expected Token assert `tier === "component"`, `status === "stable"`, the exact value matches, and the description does not match `/candidate|deferred|候选|延后/i`.

- [ ] **Step 2: Run the Token test to verify RED**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: FAIL because the compact Token does not exist and the 11 descriptions still say consumption is deferred.

- [ ] **Step 3: Update the source manifest**

Add `component.table.cell.padding.inline.compact` with CSS variable `--component-table-cell-padding-inline-compact`, value `var(--space-12)`, tier `component`, status `stable`, and description `Table compact cell inline padding`. Replace the other 11 deferred descriptions with stable responsibility descriptions without changing their names or values.

- [ ] **Step 4: Build and validate generated artifacts**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens build
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm --filter @wangxiaojinger/qizhi-tokens validate
```

Expected: 20 Token tests pass, validation reports 524 QIZHI tokens, and `MIGRATION.md` contains the compact Token as a new stable component variable.

- [ ] **Step 5: Commit**

```bash
git add packages/qizhi-tokens/src/tokens.json packages/qizhi-tokens/tests/tokens.node.mjs packages/qizhi-tokens/MIGRATION.md
git commit -m "feat(tokens): promote table component tokens"
```

### Task 3: Make Table CSS Consume Component Tokens

**Files:**
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs:285-315`
- Modify: `packages/qizhi-react/src/table/table.css:1-44`

**Interfaces:**
- Consumes: the 12 stable Table Component Tokens from Task 2.
- Produces: Table CSS with explicit Component → legacy → literal fallbacks for Task 4's rendered override tests.

- [ ] **Step 1: Write the failing CSS consumption and fallback assertions**

Read `packages/qizhi-react/src/table/table.css` in the Table Token test. Assert all 12 CSS variables occur and pin these exact responsibilities:

```text
font-size: var(--component-table-font-size, var(--font-size-14, 14px))
line-height: var(--component-table-line-height, var(--line-height-regular, 1.5))
background: var(--component-table-header-background, rgb(var(--gray-1, 247, 248, 250)))
padding-block: var(--component-table-cell-padding-block-large, var(--space-16, 16px))
padding-inline: var(--component-table-cell-padding-inline, var(--space-16, 16px))
padding-block: var(--component-table-cell-padding-block-medium, var(--space-12, 12px))
padding-block: var(--component-table-cell-padding-block-small, var(--space-8, 8px))
border color/width using var(--component-table-border, var(--color-border-1, #f2f3f5))
z-index: var(--component-table-fixed-z-index, 2)
background: var(--component-table-row-hover-background, var(--color-fill-1, #f7f8fa))
background: var(--component-table-row-selected-background, var(--color-primary-light-1, #f2f7ff))
mobile padding-inline: var(--component-table-cell-padding-inline-compact, var(--space-12, 12px))
```

Also assert `.qizhi-table__expanded > td` is the only expanded-cell padding selector and `.qizhi-table__expanded td` is absent.

- [ ] **Step 2: Run the Token test to verify RED**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: FAIL because `table.css` does not consume the Component Tokens.

- [ ] **Step 3: Replace only the approved Table CSS values**

Apply the exact fallback chains from Step 1 to the Table root, header, ordinary cells, sortable header button, three density selectors, borders, fixed columns, hover/selected rows, and mobile media query. Keep special backgrounds, shadows, expanded-row geometry, sorting geometry, selection widths, pagination, and focus styles unchanged.

- [ ] **Step 4: Run focused component and Token tests**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm exec vitest run packages/qizhi-react/src/table/Table.test.tsx apps/qizhi-docs/src/table/tableDocs.test.tsx
pnpm typecheck
```

Expected: all commands pass with 20 Token tests and no Table API/type changes.

- [ ] **Step 5: Commit**

```bash
git add packages/qizhi-tokens/tests/tokens.node.mjs packages/qizhi-react/src/table/table.css
git commit -m "feat(table): consume component design tokens"
```

### Task 4: Prove Rendered Override Compatibility and Visual Parity

**Files:**
- Modify: `tests/e2e/table-react-island.spec.ts`
- Create: `tests/e2e/token-phase2-table-visual-baseline.spec.ts`
- Create: `tests/e2e/token-phase2-table-visual-baseline.spec.ts-snapshots/*.png`

**Interfaces:**
- Consumes: Task 3's Table CSS fallback chains and baseline commit `524346e`.
- Produces: rendered proof that direct Component overrides and old variable overrides work without default visual drift.

- [ ] **Step 1: Add failing rendered override assertions**

Add a Table E2E test that loads `#component-table`, then verifies:

- overriding `--component-table-header-background` changes only Table headers;
- overriding `--component-table-cell-padding-block-large` changes default cell block padding;
- overriding `--component-table-cell-padding-inline` changes desktop cell inline padding;
- overriding `--component-table-cell-padding-inline-compact` changes 375px inline padding independently;
- overriding old `--space-16` with Component variables unset still changes default Table padding;
- overriding `--component-table-row-hover-background` and `--component-table-row-selected-background` changes their respective states;
- fixed cells retain the configured z-index;
- nested Table cells keep their own normal padding rather than the outer expanded-row `64px` inline padding.

- [ ] **Step 2: Verify the new E2E fails against baseline commit `524346e`**

Run the new test against a Vite preview of `524346e`.

Expected: FAIL because phase-one Table CSS ignores direct `--component-table-*` overrides.

- [ ] **Step 3: Create the migration-before visual baseline**

Create four screenshot tests for stable regions: basic table, three-size controls/table, fixed columns, and multiline/ellipsis content. Generate snapshots from commit `524346e` for desktop-1440, narrow-1024, and mobile-375 with one worker. Do not use the nested region as a pixel baseline because Task 3 intentionally corrects its selector scope.

- [ ] **Step 4: Run current rendered Table regression and visual comparison**

Run:

```bash
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test \
  tests/e2e/table-react-island.spec.ts --workers=1
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test \
  tests/e2e/token-phase2-table-visual-baseline.spec.ts --workers=1
```

Expected: all Table interaction/override tests and 12 visual-baseline cases pass across 1440, 1024, and 375px, with no console errors or horizontal overflow.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/table-react-island.spec.ts tests/e2e/token-phase2-table-visual-baseline.spec.ts tests/e2e/token-phase2-table-visual-baseline.spec.ts-snapshots
git commit -m "test(table): verify token compatibility and visuals"
```

### Task 5: Full Verification and Candidate Report

**Files:**
- Create: `docs/superpowers/specs/2026-10-08-qizhi-table-token-consumption-verification.md`
- Verify: all files changed in Tasks 1-4

**Interfaces:**
- Consumes: Tasks 1-4 implementation and browser evidence.
- Produces: auditable phase-two-A candidate status without publishing or deployment.

- [ ] **Step 1: Run complete automated verification**

Run:

```bash
pnpm verify
```

Expected: Token validation reports 524 items; Token, Vitest, typecheck, docs build, React build, and bundle-boundary checks pass. Record any unrelated existing failure exactly rather than weakening its assertion.

- [ ] **Step 2: Run the final focused browser suites**

Run:

```bash
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test \
  tests/e2e/form-react-island.spec.ts \
  tests/e2e/tabs-react-island.spec.ts \
  tests/e2e/table-react-island.spec.ts \
  tests/e2e/token-phase2-table-visual-baseline.spec.ts --workers=1
```

Expected: all focused cases pass across all three configured viewports.

- [ ] **Step 3: Audit scope and generated output**

Run:

```bash
git diff --check
git diff 524346e -- packages/qizhi-react/src/tooltip packages/qizhi-react/src/popover packages/qizhi-react/src/dropdown
rg -n "candidate|deferred|候选|延后" packages/qizhi-tokens/src/tokens.json packages/qizhi-tokens/MIGRATION.md
```

Expected: no whitespace errors; no Overlay component changes; no deferred wording remains on Table Token rows. Confirm build output contains the updated Table variables.

- [ ] **Step 4: Write the verification report**

Record commits, exact commands, test counts, three viewport results, visual baseline origin `524346e`, compatibility override evidence, unchanged scope, known limitations, `candidate_pass`, and `independent verification: pending`.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-10-08-qizhi-table-token-consumption-verification.md
git commit -m "docs(tokens): record table token verification"
```
