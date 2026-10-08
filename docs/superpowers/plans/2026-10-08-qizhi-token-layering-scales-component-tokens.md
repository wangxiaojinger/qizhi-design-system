# QIZHI Token Layering, Scales, and Component Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a backward-compatible four-tier token model, shared design scales, and real Button/Input/Select/Modal component tokens without changing existing computed visuals or breaking legacy variable overrides.

**Architecture:** Keep `packages/qizhi-tokens/src/tokens.json` as the sole editable source. Extend its metadata and generated artifacts, then add new Map/Alias/Component tokens whose defaults preserve existing public variables and values. Migrate four component styles to those component tokens while leaving the currently modified Table implementation untouched.

**Tech Stack:** JSON design-token manifest, Node.js ESM build/validation scripts and `node:test`, CSS custom properties, React component CSS, pnpm, Vitest, Vite, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-08-qizhi-token-layering-scales-component-tokens-design.md`

## Global Constraints

- Do not remove or rename any of the 362 existing public CSS variables.
- Do not change the existing variables' raw value types or their resolved visual values.
- Preserve runtime overrides of old public variables after component migration.
- Token dependencies must be one-way and acyclic: Seed to Map to Alias to Component.
- `packages/qizhi-tokens/src/tokens.json` remains the only editable source of public tokens and migration metadata.
- Do not modify `packages/qizhi-react/src/table/table.css` or any current Popover/Tooltip work.
- Do not publish packages, deploy documentation, or upgrade external consumers in this plan.
- Use TDD for every production change: add a failing test, observe the intended failure, implement the minimum, and rerun the relevant suite.
- Implementation evidence can reach `candidate_pass`; independent final verification remains `pending`.

## Review Focus

- A consumer overriding `--primary-6` must still change the migrated Button primary color; Task 5 pins the component-token fallback chain.
- RGB channel tokens such as `--primary-6` must remain channels rather than full colors; Task 1 pins every legacy raw value and value type.
- A token reference cycle or upward dependency must fail validation with the offending token name; Task 2 exercises both failures.
- A deprecated token with a missing or invalid replacement must fail validation; Task 2 exercises missing and unresolved replacements.
- Generated migration data and TypeScript metadata must become stale when the source manifest changes; Tasks 2 and 3 exercise generation and stale-artifact validation.

---

## File Structure

- `packages/qizhi-tokens/src/tokens.json`: sole token definitions, tier/status metadata, new scales, Alias tokens, and Component tokens.
- `packages/qizhi-tokens/src/legacy-contract.json`: immutable phase-one baseline of the 362 pre-migration token names, raw values, CSS variables, and classified value types; used only as a compatibility contract.
- `packages/qizhi-tokens/scripts/token-utils.mjs`: manifest validation, dependency validation, public metadata rendering, migration-map rendering, and generated type declarations.
- `packages/qizhi-tokens/scripts/build.mjs`: generate CSS, JSON, JavaScript, TypeScript, and migration-map artifacts.
- `packages/qizhi-tokens/scripts/validate.mjs`: compare every generated artifact with source-derived output.
- `packages/qizhi-tokens/tests/tokens.node.mjs`: compatibility, metadata, dependency, scale, migration-map, and component-token contract tests.
- `packages/qizhi-tokens/package.json`: export the generated migration map.
- `packages/qizhi-react/src/button/button.css`: consume Button component tokens.
- `packages/qizhi-react/src/input/input.css`: consume Input component tokens.
- `packages/qizhi-react/src/select/select.css`: consume Select component tokens.
- `packages/qizhi-react/src/modal/modal.css`: consume Modal component tokens.
- Existing component unit tests and `tests/e2e/{button,input,select,modal}-react-island.spec.ts`: regression verification only unless a test cannot observe the compatibility requirement.

### Task 1: Freeze the Legacy Public Contract

**Files:**
- Create: `packages/qizhi-tokens/src/legacy-contract.json`
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Read: `packages/qizhi-tokens/src/tokens.json`

**Interfaces:**
- Consumes: the current 362-token manifest before new tokens are added.
- Produces: a baseline object keyed by token name with `cssVariable`, `value`, and `valueType`; later tasks rely on it to detect compatibility breaks.

- [ ] **Step 1: Add a failing compatibility test**

Add `test("legacy public token names, values, and value types stay compatible", ...)`. It must load `src/legacy-contract.json`, assert it contains exactly 362 entries, and compare each baseline entry against the current manifest. Classify values as `rgb-channel`, `color`, `length`, `number`, `percentage`, `font-family`, `shadow`, or `reference` using an exported `classifyTokenValue(value: string)` helper that does not exist yet.

- [ ] **Step 2: Run the token test and verify RED**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: FAIL because `legacy-contract.json` and `classifyTokenValue` do not exist.

- [ ] **Step 3: Add the baseline and minimal classifier**

Create `legacy-contract.json` from the current manifest without modifying the manifest. Export `classifyTokenValue(value: string): string` from `scripts/token-utils.mjs`; references are classified before their resolved target so the raw public representation is protected.

- [ ] **Step 4: Run the token tests and verify GREEN**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: all token tests pass and the baseline contains 362 entries.

- [ ] **Step 5: Commit the compatibility baseline**

```bash
git add packages/qizhi-tokens/src/legacy-contract.json packages/qizhi-tokens/scripts/token-utils.mjs packages/qizhi-tokens/tests/tokens.node.mjs
git commit -m "test(tokens): freeze legacy public contract"
```

### Task 2: Add Tier and Lifecycle Metadata Validation

**Files:**
- Modify: `packages/qizhi-tokens/src/tokens.json`
- Modify: `packages/qizhi-tokens/scripts/token-utils.mjs`
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`

**Interfaces:**
- Consumes: `classifyTokenValue` and the baseline from Task 1.
- Produces: `validateManifest(manifest)` rules for `tier`, `status`, `replacedBy`, cycles, and allowed dependency direction; `QizhiTokenTier` and `QizhiTokenStatus` concepts used by Task 3.

- [ ] **Step 1: Add failing metadata and dependency tests**

Add separate tests asserting:

- all tokens use `tier` from `seed | map | alias | component` and `status` from `stable | deprecated`;
- a deprecated token without `replacedBy` is rejected;
- a missing `replacedBy` target is rejected;
- a two-token `var()` cycle is rejected with both names discoverable in the error;
- a Map token referencing an Alias or Component token is rejected;
- a Component token referencing another Component token is rejected.

- [ ] **Step 2: Run the token tests and verify RED**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: FAIL because existing tokens have no tier/status and dependency validation does not exist.

- [ ] **Step 3: Classify all existing tokens without changing their values**

Add `tier` and `status: "stable"` to every existing manifest entry. Classify palette ramps and numerical scales as Map, usage-oriented colors and compatibility names as Alias, foundational anchors as Seed, and existing form/chart-specific entries as Component only when their scope is truly component-specific. Do not add deprecations in this task unless the replacement is unambiguous and value-compatible.

- [ ] **Step 4: Implement dependency and lifecycle validation**

Extend `validateManifest(manifest)` to validate enums, replacement targets, graph cycles, and tier direction. Return stable, token-specific error messages suitable for assertions; do not resolve or rewrite values during validation.

- [ ] **Step 5: Run the token tests and verify GREEN**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: all tests pass, including the legacy baseline proving no old value changed.

- [ ] **Step 6: Commit metadata classification**

```bash
git add packages/qizhi-tokens/src/tokens.json packages/qizhi-tokens/scripts/token-utils.mjs packages/qizhi-tokens/tests/tokens.node.mjs
git commit -m "feat(tokens): classify public token tiers"
```

### Task 3: Generate Public Metadata and the Migration Map

**Files:**
- Modify: `packages/qizhi-tokens/scripts/token-utils.mjs`
- Modify: `packages/qizhi-tokens/scripts/build.mjs`
- Modify: `packages/qizhi-tokens/scripts/validate.mjs`
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Modify: `packages/qizhi-tokens/package.json`
- Generate: `packages/qizhi-tokens/dist/index.js`
- Generate: `packages/qizhi-tokens/dist/index.d.ts`
- Generate: `packages/qizhi-tokens/dist/tokens.json`
- Generate: `packages/qizhi-tokens/dist/style.css`
- Generate: `packages/qizhi-tokens/dist/migration-map.json`

**Interfaces:**
- Consumes: validated `tier`, `status`, and optional `replacedBy` fields from Task 2.
- Produces: `renderMigrationMap(manifest): string`; generated `QizhiToken` fields `tier`, `status`, and optional `replacedBy`; package export `@wangxiaojinger/qizhi-tokens/migration-map.json`.

- [ ] **Step 1: Add failing generated-contract tests**

Assert that `publicTokenValues()` includes the three metadata fields, `renderTypes()` declares exact tier/status unions, the migration map includes every token with `action: "keep" | "alias" | "deprecated"`, and package exports expose `./migration-map.json`. Extend the stale-artifact test so changing source metadata makes validation fail for the relevant generated artifact.

- [ ] **Step 2: Run the token tests and verify RED**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: FAIL because generated metadata, migration-map rendering, and the export do not exist.

- [ ] **Step 3: Implement metadata and migration-map generation**

Add `renderMigrationMap(manifest): string` to `token-utils.mjs`. Derive actions from source metadata: stable canonical tokens are `keep`, stable compatibility references are `alias`, and deprecated tokens are `deprecated`; include `token`, `cssVariable`, `valueType`, `replacement`, and `note`. Update build and validation scripts and add the package export.

- [ ] **Step 4: Rebuild and verify GREEN**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens build
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm --filter @wangxiaojinger/qizhi-tokens validate
```

Expected: build succeeds, token tests pass, and validation reports the current token count.

- [ ] **Step 5: Commit generated public metadata**

```bash
git add packages/qizhi-tokens/package.json packages/qizhi-tokens/scripts packages/qizhi-tokens/tests/tokens.node.mjs packages/qizhi-tokens/dist
git commit -m "feat(tokens): publish token migration metadata"
```

### Task 4: Add the Shared Scales

**Files:**
- Modify: `packages/qizhi-tokens/src/tokens.json`
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Generate: `packages/qizhi-tokens/dist/*`

**Interfaces:**
- Consumes: metadata schema and generators from Tasks 2-3.
- Produces: Map tokens for typography, spacing, control heights, borders, shadows, motion, and z-index; Task 5 component tokens reference them.

- [ ] **Step 1: Add failing exact-value scale tests**

Add one test per scale family asserting the approved values:

- font sizes: 12, 14, 16, 18, 20, 24, 28, 32px;
- line heights: 18, 20, 22, 24, 26, 28, 30, 32, 36px;
- spacing: 0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48px;
- control heights: mini 24px, small 28px, medium 32px, large 36px;
- line widths: 0, 1, 2px;
- durations: fast 160ms, base 200ms, slow 300ms;
- z-index: sticky 100, dropdown 60, modal 999, message/tooltip 1200, matching the currently rendered layer values;
- three shadow tokens and standard/enter/exit easing tokens with values copied from existing component CSS.

- [ ] **Step 2: Run the token tests and verify RED**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: FAIL listing the missing scale tokens.

- [ ] **Step 3: Add the minimal Map tokens**

Append the scale entries to `tokens.json` with `tier: "map"`, `status: "stable"`, descriptive usage text, and no component-specific names. Preserve all legacy entries byte-for-value.

- [ ] **Step 4: Build and verify GREEN**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens build
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm --filter @wangxiaojinger/qizhi-tokens validate
```

Expected: all commands pass; the legacy compatibility test remains green.

- [ ] **Step 5: Commit the scales**

```bash
git add packages/qizhi-tokens/src/tokens.json packages/qizhi-tokens/tests/tokens.node.mjs packages/qizhi-tokens/dist
git commit -m "feat(tokens): add shared design scales"
```

### Task 5: Add and Consume Button Component Tokens

**Files:**
- Modify: `packages/qizhi-tokens/src/tokens.json`
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Modify: `packages/qizhi-react/src/button/button.css`
- Test: `packages/qizhi-react/src/button/Button.test.tsx`
- Verify: `tests/e2e/button-react-island.spec.ts`

**Interfaces:**
- Consumes: shared scale and semantic tokens from Task 4.
- Produces: `component.button.*` tokens for heights, padding, gap, radius, typography, borders, colors, focus, and motion.

- [ ] **Step 1: Add failing Button token and fallback-chain tests**

Assert the complete `component.button.*` set exists with `tier: "component"`; its primary background references `--primary-6`; its four heights resolve through the shared control-height Map tokens; and `button.css` contains no literal `24px`, `28px`, `32px`, `36px`, `14px`, `0.2s`, or `2px` for the migrated properties.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm exec vitest run packages/qizhi-react/src/button/Button.test.tsx
```

Expected: token test fails because Button component tokens are missing; existing Button behavior test remains green.

- [ ] **Step 3: Add Button tokens and migrate CSS**

Add component tokens whose defaults reproduce the current CSS and preserve old variable overrides. Replace only the corresponding declarations in `button.css`; retain runtime status custom properties such as `--qizhi-status-*`.

- [ ] **Step 4: Build and verify GREEN**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens build
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm exec vitest run packages/qizhi-react/src/button/Button.test.tsx packages/qizhi-react/src/button/Button.types.test.tsx
```

Expected: all commands pass.

- [ ] **Step 5: Commit Button migration**

```bash
git add packages/qizhi-tokens/src/tokens.json packages/qizhi-tokens/tests/tokens.node.mjs packages/qizhi-tokens/dist packages/qizhi-react/src/button/button.css
git commit -m "feat(button): consume component design tokens"
```

### Task 6: Add and Consume Input and Select Component Tokens

**Files:**
- Modify: `packages/qizhi-tokens/src/tokens.json`
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Modify: `packages/qizhi-react/src/input/input.css`
- Modify: `packages/qizhi-react/src/select/select.css`
- Test: `packages/qizhi-react/src/input/Input.test.tsx`
- Test: `packages/qizhi-react/src/input/InputVariants.test.tsx`
- Test: `packages/qizhi-react/src/select/Select.test.tsx`
- Verify: `tests/e2e/input-react-island.spec.ts`
- Verify: `tests/e2e/select-react-island.spec.ts`

**Interfaces:**
- Consumes: shared scales and semantic aliases from Task 4.
- Produces: `component.input.*` and `component.select.*` tokens for sizing, spacing, radius, typography, borders, backgrounds, disabled states, focus ring, popup shadow, option height, icon size, and motion.

- [ ] **Step 1: Add failing Input and Select token tests**

Assert both component families exist, use shared control-height tokens, preserve `--primary-6`, `--color-border-*`, `--color-text-*`, and `--color-fill-*` fallback chains, and do not publish runtime values such as input content width as design tokens.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm exec vitest run packages/qizhi-react/src/input/Input.test.tsx packages/qizhi-react/src/input/InputVariants.test.tsx packages/qizhi-react/src/select/Select.test.tsx
```

Expected: token test fails for missing component tokens; existing behavior tests remain green.

- [ ] **Step 3: Add Input tokens and migrate `input.css`**

Replace only declarations covered by approved component tokens. Keep `--qizhi-input-height` as the internal size switch, but set its values from public `component.input.control.height.*` tokens so grouped and standalone inputs remain synchronized.

- [ ] **Step 4: Run Input tests and verify GREEN**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens build
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm exec vitest run packages/qizhi-react/src/input/Input.test.tsx packages/qizhi-react/src/input/InputVariants.test.tsx
```

Expected: all Input-focused checks pass.

- [ ] **Step 5: Add Select tokens and migrate `select.css`**

Use the shared control-height scale and Select-specific aliases. Preserve the current popup shadow, option minimum height, focus ring, disabled state, and old public color override paths.

- [ ] **Step 6: Run Select tests and verify GREEN**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens build
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm exec vitest run packages/qizhi-react/src/select/Select.test.tsx packages/qizhi-react/src/select/Select.types.test.tsx packages/qizhi-react/src/select/SelectOptionCard.test.tsx packages/qizhi-react/src/select/SelectSelectionCard.test.tsx
```

Expected: all Select-focused checks pass.

- [ ] **Step 7: Commit Input and Select migration**

```bash
git add packages/qizhi-tokens/src/tokens.json packages/qizhi-tokens/tests/tokens.node.mjs packages/qizhi-tokens/dist packages/qizhi-react/src/input/input.css packages/qizhi-react/src/select/select.css
git commit -m "feat(forms): consume input and select tokens"
```

### Task 7: Add and Consume Modal Component Tokens

**Files:**
- Modify: `packages/qizhi-tokens/src/tokens.json`
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Modify: `packages/qizhi-react/src/modal/modal.css`
- Test: `packages/qizhi-react/src/modal/Modal.test.tsx`
- Verify: `tests/e2e/modal-react-island.spec.ts`

**Interfaces:**
- Consumes: shadow, motion, z-index, spacing, radius, and typography scales from Task 4.
- Produces: `component.modal.*` tokens for z-index, mask, radius, shadow, header height, typography, padding, footer gap, and enter motion.

- [ ] **Step 1: Add failing Modal token tests**

Assert the Modal component token set exists and preserves current values: mask `rgba(0, 0, 0, 0.45)`, header height `56px`, content padding `16px 24px`, footer gap `12px`, entry duration `180ms`, and current modal shadow. Assert old text/background/border variables remain in each fallback chain.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm exec vitest run packages/qizhi-react/src/modal/Modal.test.tsx
```

Expected: token test fails for missing Modal component tokens; existing Modal behavior tests remain green.

- [ ] **Step 3: Add Modal tokens and migrate CSS**

Replace only approved visual constants in `modal.css`. Preserve the existing keyframe geometry and reduced-motion behavior; expose duration and easing without turning dynamic viewport calculations into public tokens.

- [ ] **Step 4: Build and verify GREEN**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens build
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm exec vitest run packages/qizhi-react/src/modal/Modal.test.tsx
```

Expected: all commands pass.

- [ ] **Step 5: Commit Modal migration**

```bash
git add packages/qizhi-tokens/src/tokens.json packages/qizhi-tokens/tests/tokens.node.mjs packages/qizhi-tokens/dist packages/qizhi-react/src/modal/modal.css
git commit -m "feat(modal): consume component design tokens"
```

### Task 8: Record the Deferred Table Mapping

**Files:**
- Modify: `packages/qizhi-tokens/src/tokens.json`
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Do not modify: `packages/qizhi-react/src/table/table.css`

**Interfaces:**
- Consumes: shared scales and Alias tokens from Task 4.
- Produces: documented `component.table.*` candidate tokens that are published but explicitly marked as not yet consumed by Table CSS.

- [ ] **Step 1: Add a failing Table mapping test**

Assert the candidate set covers header background, cell block/inline padding, font size, line height, border, fixed-column z-index, row hover background, and selected-row background.

- [ ] **Step 2: Run the token test and verify RED**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: FAIL because the Table mapping tokens do not exist.

- [ ] **Step 3: Add deferred Table component tokens**

Add `component.table.*` entries with descriptions explicitly stating that consumption is deferred while the Table implementation has unrelated in-progress changes. Defaults must match the current Table values without editing its CSS.

- [ ] **Step 4: Build and verify GREEN**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens build
pnpm --filter @wangxiaojinger/qizhi-tokens test
pnpm --filter @wangxiaojinger/qizhi-tokens validate
```

Expected: all commands pass and `git diff -- packages/qizhi-react/src/table/table.css` still contains only the user's pre-existing changes.

- [ ] **Step 5: Commit the deferred mapping**

```bash
git add packages/qizhi-tokens/src/tokens.json packages/qizhi-tokens/tests/tokens.node.mjs packages/qizhi-tokens/dist
git commit -m "feat(tokens): add deferred table token map"
```

### Task 9: Full Verification and Rendered Regression

**Files:**
- Verify only: all files changed in Tasks 1-8
- Verify only: `tests/e2e/button-react-island.spec.ts`
- Verify only: `tests/e2e/input-react-island.spec.ts`
- Verify only: `tests/e2e/select-react-island.spec.ts`
- Verify only: `tests/e2e/modal-react-island.spec.ts`

**Interfaces:**
- Consumes: completed token architecture and component migrations.
- Produces: final candidate evidence; no new product behavior.

- [ ] **Step 1: Check scope and compatibility diff**

Run:

```bash
git status --short
git diff --check
git diff -- packages/qizhi-react/src/table/table.css packages/qizhi-react/src/popover packages/qizhi-react/src/tooltip
```

Expected: no task-created changes in excluded files; pre-existing changes remain preserved.

- [ ] **Step 2: Run package and workspace verification**

Run:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens build
pnpm --filter @wangxiaojinger/qizhi-tokens validate
pnpm typecheck
pnpm test
pnpm build
```

Expected: every command passes. If a pre-existing unrelated failure appears, record the exact command, test, and output without changing unrelated code.

- [ ] **Step 3: Run focused Playwright regressions**

Run:

```bash
pnpm exec playwright test tests/e2e/button-react-island.spec.ts tests/e2e/input-react-island.spec.ts tests/e2e/select-react-island.spec.ts tests/e2e/modal-react-island.spec.ts
```

Expected: all configured 1440/1024/375 projects pass with no new console errors or horizontal overflow.

- [ ] **Step 4: Inspect rendered screenshots and computed styles**

Open the generated target screenshots for Button, Input, Select, and Modal. Compare default, hover/active where captured, focus-visible, disabled, error/warning, all sizes, and open overlays. Confirm computed heights remain 24/28/32/36px and the legacy `--primary-6` override probe affects the primary Button.

- [ ] **Step 5: Record final candidate status**

Report changed files, commands and results, preserved unrelated modifications, any pre-existing failures, and `independent_verification: pending`. Do not publish or deploy.
