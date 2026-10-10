# QIZHI Overlay Component Token Consumption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Tooltip, Popover, Dropdown, and Dropdown.Button consume independent stable Component Tokens while preserving current APIs, interactions, default visuals, and legacy-variable overrides.

**Architecture:** Keep `packages/qizhi-tokens/src/tokens.json` as the only editable Token source, publish separate `component.tooltip.*`, `component.popover.*`, and `component.dropdown.*` namespaces, and consume them through Component → legacy variable → literal CSS fallbacks. Freeze the pre-migration browser baseline first, then migrate and verify each component independently before running the shared consumer regression gate.

**Tech Stack:** JSON design-token manifest, Node.js ESM generation and `node:test`, CSS custom properties, React/Vitest, Vite, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-08-qizhi-overlay-component-tokens-design.md`

## Global Constraints

- Do not remove, rename, or change the value type of any existing public Token or CSS variable.
- `packages/qizhi-tokens/src/tokens.json` remains the sole editable source for public Token definitions and metadata.
- Preserve Tooltip, Popover, Dropdown, and Dropdown.Button props, exports, DOM/ARIA semantics, trigger modes, positioning algorithms, Portal behavior, focus restoration, and Demo content/order.
- Preserve default computed styles at 1440, 1024, and 375px.
- CSS fallback order is Component Token, then existing public variable when one exists, then the current literal.
- Tooltip, Popover, and Dropdown Component Tokens must not reference one another.
- Tooltip `color` must continue to override `component.tooltip.background` through `--qizhi-tooltip-bg` for both body and arrow.
- Add `z.index.popover = 1200`; do not make it an alias of `z.index.tooltip`.
- Keep Dropdown local at z-index 20 and preserve `--shadow`, the 4px popup/submenu gap, and the 136px cascade width.
- Keep existing `prefers-reduced-motion` behavior.
- Do not refactor Select, Cascader, TreeSelect, Table, Slider, LogViewer, SideNavigation, Input, or BusinessObjects; use them only as regression consumers.
- Do not publish packages, deploy docs, or upgrade external consumers.
- Every production change follows RED → GREEN TDD and ends in a focused commit.
- Implementation evidence is at most `candidate_pass`; independent final verification remains `pending`.

## Review Focus

- Loading component CSS without the Token stylesheet must retain every current literal; Tasks 3–5 pin the complete nested fallback strings.
- An instance Tooltip `color` must beat both direct Component Token and legacy color overrides while keeping the arrow synchronized; Task 3 tests all three layers.
- Popover body and arrow must resolve the same background/border when Component Tokens are overridden, including all four directional arrow borders; Task 4 tests both rendered surfaces.
- Dropdown is not a Portal: direct Token overrides must not change its absolute-positioning, cascade direction, 4px gap, or clipping behavior; Task 5 combines style overrides with real cascade interaction.
- Dropdown.Button disabled, primary/secondary divider, and loading states are easy to miss because Button owns adjacent geometry; Task 5 tests only Dropdown-owned responsibilities and leaves Button sizing untouched.

---

## File Structure

- `packages/qizhi-tokens/src/tokens.json`: add one Popover z-index Token and the three stable Component Token namespaces.
- `packages/qizhi-tokens/tests/tokens.node.mjs`: pin exact values, tiers, lifecycle status, generated variables, CSS consumption, and fallback chains.
- `packages/qizhi-tokens/MIGRATION.md`: generated public mapping for all new variables.
- `packages/qizhi-react/src/tooltip/tooltip.css`: consume Tooltip Tokens and derive arrow offsets from arrow size.
- `packages/qizhi-react/src/popover/popover.css`: consume Popover Tokens and derive arrow offsets from arrow size plus the existing 1px border compensation.
- `packages/qizhi-react/src/dropdown/dropdown.css`: consume Dropdown popup, item, trigger, icon, motion, disabled, divider, and loading Tokens.
- `tests/e2e/tooltip-react-island.spec.ts`: prove Tooltip Component, legacy, and instance-color precedence.
- `tests/e2e/popover-react-island.spec.ts`: prove Popover body/arrow Token synchronization.
- `tests/e2e/dropdown-react-island.spec.ts`: prove popup/item and Dropdown.Button state overrides without geometry drift.
- `tests/e2e/token-phase2-overlay-visual-baseline.spec.ts`: compare default open states with the pre-migration baseline at three viewports.
- `tests/e2e/token-phase2-overlay-visual-baseline.spec.ts-snapshots/`: frozen Chrome/macOS images from baseline commit `2dc3434`.
- `docs/superpowers/specs/2026-10-09-qizhi-overlay-token-consumption-verification.md`: exact candidate evidence and remaining acceptance boundary.

### Task 1: Freeze the Pre-Migration Overlay Visual Baseline

**Files:**
- Create: `tests/e2e/token-phase2-overlay-visual-baseline.spec.ts`
- Create: `tests/e2e/token-phase2-overlay-visual-baseline.spec.ts-snapshots/*.png`

**Interfaces:**
- Consumes: approved default visuals at commit `2dc3434` and the existing Tooltip, Popover, and Dropdown docs Demos.
- Produces: stable images used by Tasks 3–6 to detect default visual drift.

- [ ] **Step 1: Add deterministic screenshot cases**

Create cases for Tooltip basic open state, Tooltip mini, Popover basic open state, Popover directional arrow, Dropdown basic open state, Dropdown cascade open state, and Dropdown.Button primary/secondary/loading states. In `prepare`, wait for `document.fonts.ready`, disable caret/transitions, and scope every trigger to the React component root rather than legacy static DOM.

- [ ] **Step 2: Capture baseline snapshots before any Token/CSS implementation**

Run:

```bash
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test \
  tests/e2e/token-phase2-overlay-visual-baseline.spec.ts \
  --workers=1 --update-snapshots
```

Expected: 21 cases pass and snapshots are written for desktop-1440, narrow-1024, and mobile-375.

- [ ] **Step 3: Re-run without updating snapshots**

Run the Step 2 command without `--update-snapshots`.

Expected: 21 passed with no image diff.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/token-phase2-overlay-visual-baseline.spec.ts \
  tests/e2e/token-phase2-overlay-visual-baseline.spec.ts-snapshots
git commit -m "test(overlay): freeze pre-token visual baseline"
```

### Task 2: Publish Stable Overlay Tokens

**Files:**
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Modify: `packages/qizhi-tokens/src/tokens.json`
- Regenerate: `packages/qizhi-tokens/MIGRATION.md`

**Interfaces:**
- Consumes: exact Token names and values in the approved spec.
- Produces: `z.index.popover`, 17 Tooltip Tokens, 17 Popover Tokens, and 26 Dropdown Tokens for Tasks 3–5.

- [ ] **Step 1: Write the failing manifest contract**

Add one `node:test` case that asserts all 61 new Tokens exist, have the exact spec value, expected tier (`map` for `z.index.popover`, `component` for component namespaces), `status === "stable"`, non-deferred descriptions, and exact kebab-case CSS variables. Assert `z.index.popover` and `z.index.tooltip` both equal `1200` but neither value references the other.

- [ ] **Step 2: Verify RED**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: FAIL because the 61 Token names are absent.

- [ ] **Step 3: Add the source manifest definitions**

Add the exact names, values, CSS variables, tiers, stable status, and responsibility descriptions from the spec. Do not edit generated files manually and do not add cross-component references.

- [ ] **Step 4: Build and validate generated artifacts**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens build
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm --filter @wangxiaojinger/qizhi-tokens validate
```

Expected: Token tests pass; validation reports 585 QIZHI tokens; `MIGRATION.md` contains all 61 new stable variables.

- [ ] **Step 5: Commit**

```bash
git add packages/qizhi-tokens/src/tokens.json \
  packages/qizhi-tokens/tests/tokens.node.mjs \
  packages/qizhi-tokens/MIGRATION.md
git commit -m "feat(tokens): publish overlay component tokens"
```

### Task 3: Make Tooltip Consume Its Component Tokens

**Files:**
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Modify: `packages/qizhi-react/src/tooltip/tooltip.css`
- Modify: `tests/e2e/tooltip-react-island.spec.ts`

**Interfaces:**
- Consumes: Task 2's 17 `component.tooltip.*` variables.
- Produces: Tooltip CSS and rendered precedence guarantees for Tasks 6's shared regression.

- [ ] **Step 1: Write failing CSS fallback assertions**

Assert `tooltip.css` consumes all 17 variables and includes Component → legacy → literal chains for background, text, z-index, height, padding, radius, typography, shadow, arrow size, mini geometry, and motion. Assert every centered/edge arrow offset derives from `--component-tooltip-arrow-size` with `calc(...)`, not fixed `4px` offsets.

- [ ] **Step 2: Write failing rendered precedence checks**

Extend Tooltip E2E to inject a direct `--component-tooltip-background`, then a legacy `--color-neutral-10`, and finally a Tooltip `color` prop Demo state. Assert body and arrow stay synchronized and precedence is instance `color` > Component Token > legacy variable > literal.

- [ ] **Step 3: Verify RED**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens test
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test \
  tests/e2e/tooltip-react-island.spec.ts --workers=1
```

Expected: CSS consumption and direct Component override assertions fail.

- [ ] **Step 4: Implement the Tooltip CSS migration**

Keep `--qizhi-tooltip-bg` as the instance override entry. Replace only approved literals with nested fallbacks, use the new Token for animation values, and derive half-arrow offsets from its size. Do not change positioning attributes, max-width, overflow wrapping, keyframe semantics, or `Tooltip.tsx`.

- [ ] **Step 5: Verify GREEN and visual parity**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm exec vitest run packages/qizhi-react/src/tooltip apps/qizhi-docs/src/tooltip
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test \
  tests/e2e/tooltip-react-island.spec.ts \
  tests/e2e/token-phase2-overlay-visual-baseline.spec.ts --workers=1
```

Expected: focused unit/docs/E2E pass and existing overlay snapshots have no diff.

- [ ] **Step 6: Commit**

```bash
git add packages/qizhi-tokens/tests/tokens.node.mjs \
  packages/qizhi-react/src/tooltip/tooltip.css \
  tests/e2e/tooltip-react-island.spec.ts
git commit -m "feat(tooltip): consume component design tokens"
```

### Task 4: Make Popover Consume Its Component Tokens

**Files:**
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Modify: `packages/qizhi-react/src/popover/popover.css`
- Modify: `tests/e2e/popover-react-island.spec.ts`

**Interfaces:**
- Consumes: Task 2's 17 `component.popover.*` variables and independent `--z-index-popover`.
- Produces: Popover CSS with synchronized body/arrow overrides for Task 6.

- [ ] **Step 1: Write failing CSS fallback assertions**

Assert all 17 Popover variables are consumed with exact Component → legacy → literal chains. Pin `z-index: var(--component-popover-z-index, var(--z-index-popover, 1200))`; require the arrow's background and border to use the same component variables as the body; require offsets to derive from arrow size plus the current 1px border compensation.

- [ ] **Step 2: Write failing rendered synchronization checks**

Extend Popover E2E to override background, border, width, arrow size, and z-index directly. Assert body and arrow computed colors match, width changes without clipping, and all four directional arrows remain connected to the body.

- [ ] **Step 3: Verify RED**

Run Token tests and `tests/e2e/popover-react-island.spec.ts` against the local preview.

Expected: CSS consumption and Component override assertions fail.

- [ ] **Step 4: Implement the Popover CSS migration**

Replace only approved values with nested fallbacks. Preserve fixed positioning, Portal mounting, width behavior, border directions, and keyframes; do not modify `Popover.tsx`.

- [ ] **Step 5: Verify GREEN and visual parity**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm exec vitest run packages/qizhi-react/src/popover apps/qizhi-docs/src/popover
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test \
  tests/e2e/popover-react-island.spec.ts \
  tests/e2e/token-phase2-overlay-visual-baseline.spec.ts --workers=1
```

Expected: focused unit/docs/E2E pass and snapshots remain unchanged.

- [ ] **Step 6: Commit**

```bash
git add packages/qizhi-tokens/tests/tokens.node.mjs \
  packages/qizhi-react/src/popover/popover.css \
  tests/e2e/popover-react-island.spec.ts
git commit -m "feat(popover): consume component design tokens"
```

### Task 5: Make Dropdown and Dropdown.Button Consume Their Component Tokens

**Files:**
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Modify: `packages/qizhi-react/src/dropdown/dropdown.css`
- Modify: `tests/e2e/dropdown-react-island.spec.ts`

**Interfaces:**
- Consumes: Task 2's 26 `component.dropdown.*` variables.
- Produces: Dropdown CSS with independently overrideable popup, item, trigger, icon, motion, disabled, divider, and loading responsibilities.

- [ ] **Step 1: Write failing CSS fallback assertions**

Assert all 26 variables are consumed through exact fallback chains. Pin popup shadow to `var(--component-dropdown-popup-shadow, var(--shadow, 0 6px 16px rgba(29,33,41,.12)))`; pin local z-index to Component → `20`; pin text-trigger disabled color, primary/secondary dividers, loading background, and loading animation values. Assert cascade width `136px`, popup/submenu 4px gaps, and placement transforms remain literal structural rules rather than new Tokens.

- [ ] **Step 2: Write failing rendered state and geometry checks**

Extend Dropdown E2E to override popup background/border/min-width, item height/padding/hover colors, trigger gap, icon size, and Dropdown.Button primary divider, secondary divider, loading background/duration/easing. Exercise the real cascade submenu and assert its side, 4px gap, and viewport containment are unchanged.

- [ ] **Step 3: Verify RED**

Run Token tests and `tests/e2e/dropdown-react-island.spec.ts` against the local preview.

Expected: CSS consumption and direct Component override assertions fail.

- [ ] **Step 4: Implement the Dropdown CSS migration**

Replace only Dropdown-owned visual values with nested fallbacks. Preserve relative/absolute positioning, placement selectors, cascade width/gap, submenu direction, Button-owned height/radius/text geometry, and reduced-motion behavior; do not modify `Dropdown.tsx`.

- [ ] **Step 5: Verify GREEN and visual parity**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm exec vitest run packages/qizhi-react/src/dropdown apps/qizhi-docs/src/dropdown
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test \
  tests/e2e/dropdown-react-island.spec.ts \
  tests/e2e/token-phase2-overlay-visual-baseline.spec.ts --workers=1
```

Expected: focused unit/docs/E2E pass and snapshots remain unchanged.

- [ ] **Step 6: Commit**

```bash
git add packages/qizhi-tokens/tests/tokens.node.mjs \
  packages/qizhi-react/src/dropdown/dropdown.css \
  tests/e2e/dropdown-react-island.spec.ts
git commit -m "feat(dropdown): consume component design tokens"
```

### Task 6: Run Shared Consumer Regression and Record Candidate Evidence

**Files:**
- Create: `docs/superpowers/specs/2026-10-09-qizhi-overlay-token-consumption-verification.md`

**Interfaces:**
- Consumes: Tasks 1–5 and the direct-consumer matrix in the design spec.
- Produces: auditable `candidate_pass` evidence with independent verification explicitly pending.

- [ ] **Step 1: Run the complete repository gate**

Run: `pnpm verify`

Expected: API validation, 585 Token validation, Token tests, TypeScript, all Vitest files/tests, docs build, React package build, and smoke bundle pass. Record exact counts from the fresh output rather than copying planned counts.

- [ ] **Step 2: Run the direct consumer browser matrix**

Run Tooltip, Popover, Dropdown, Table, Slider, LogViewer, BusinessObjects, Select, Cascader, TreeSelect, SideNavigation/Menu, and Input E2E at 1440/1024/375 with `--workers=1`. Require real open states, zero page/console/resource errors, no horizontal overflow, and no unexpected skips.

- [ ] **Step 3: Run the frozen visual baseline**

Run `tests/e2e/token-phase2-overlay-visual-baseline.spec.ts` without updating snapshots.

Expected: 21 passed and no pixel diffs.

- [ ] **Step 4: Audit scope and generated state**

Run:

```bash
git diff --check
git status --short
git diff --stat 2dc3434..HEAD
```

Confirm no public API/TSX/Demo content, unrelated component CSS, package version, release workflow, or deployment file changed.

- [ ] **Step 5: Write the verification report**

Record baseline SHA, implementation SHAs, exact Token names/counts, fallback policy, test commands/counts, browser viewports, snapshot set, known skips, and `candidate_pass` / `independent_verification: pending`.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/specs/2026-10-09-qizhi-overlay-token-consumption-verification.md
git commit -m "docs(tokens): verify overlay token consumption"
```
