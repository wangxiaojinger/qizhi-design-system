# QIZHI Slider API Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten Slider single/range/multiple contracts and add completion and Tooltip configuration APIs without copying unrelated Arco capabilities.

**Architecture:** Model Slider as a discriminated union keyed by `range` and `multiple`, while keeping one internal normalized runtime value. Delegate Tooltip placement and portal ownership to the existing public Tooltip component. Treat continuous changes and completed interactions as separate observable events.

**Tech Stack:** React 19, TypeScript 7, Vitest, Testing Library, Playwright, Vite, pnpm.

**Spec:** `docs/specs/qizhi-slider-contract-v1.md`

## Global Constraints

- Preserve all nine legacy Demo titles, original descriptions, order, data, layout, dimensions, initial states, and interactions.
- Demo TSX remains the only preview/display/copy source.
- Do not add `showInput`, `reverse`, `showTicks`, `snapToMarks`, `getIntervalConfig`, or array-valued `className`.
- Reuse public Tooltip `TooltipPosition` and `getPopupContainer` contracts.
- Run 1440, 1024, and 375 browser acceptance and inspect screenshots before claiming visual success.

---

### Task 1: Discriminate single, range, and multiple value contracts

**Files:**
- Modify: `packages/qizhi-react/src/slider/Slider.types.ts`
- Create: `packages/qizhi-react/src/slider/Slider.types.test.tsx`
- Modify: `packages/qizhi-react/src/slider/Slider.tsx`
- Modify: `packages/qizhi-react/src/index.ts`
- Modify: `apps/qizhi-docs/src/slider/demos/MultipleDemo.tsx`
- Modify: `apps/qizhi-docs/src/slider/demos/InputDemo.tsx`
- Modify: `packages/qizhi-react/src/slider/Slider.test.tsx`

**Interfaces:**
- Produces: `SliderSingleProps`, `SliderRangeProps`, `SliderMultipleProps`, `SliderProps`, and `SliderValue`.
- Produces: `multiple?: true` as the explicit public mode for three-or-more-handle selection.
- Range mode accepts array values and defaults to `[min, min]`; it no longer converts a scalar to `[min, value]`.

- [ ] **Step 1: Write failing type and runtime tests**

Add compile-time assertions for valid single/range/multiple values and `@ts-expect-error` assertions for scalar range, array single, and simultaneous `range` plus `multiple`. Add runtime assertions that range defaults to two handles and multiple renders all supplied handles.

- [ ] **Step 2: Run tests and typecheck to verify RED**

Run: `pnpm exec vitest run packages/qizhi-react/src/slider/Slider.types.test.tsx packages/qizhi-react/src/slider/Slider.test.tsx`

Run: `pnpm typecheck`

Expected: FAIL because the discriminated types and `multiple` mode do not exist and scalar range is still accepted.

- [ ] **Step 3: Implement the minimal discriminated union and runtime mode normalization**

Define shared props separately, then mode-specific value/callback signatures. Normalize internal values from the explicit mode and update the two affected same-source Demo files to pass `multiple` or use a range-array state type.

- [ ] **Step 4: Run focused tests and typecheck to verify GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/slider/Slider.types.test.tsx packages/qizhi-react/src/slider/Slider.test.tsx apps/qizhi-docs/src/slider/sliderDocs.test.tsx`

Run: `pnpm typecheck`

Expected: PASS.

### Task 2: Add completed-change semantics

**Files:**
- Modify: `packages/qizhi-react/src/slider/Slider.types.ts`
- Modify: `packages/qizhi-react/src/slider/Slider.tsx`
- Modify: `packages/qizhi-react/src/slider/Slider.test.tsx`

**Interfaces:**
- Produces: `onChangeComplete?: (value) => void`, with the callback value narrowed by Slider mode.
- Completion fires once after track click, handle drag, draggable-range drag, or one handled keyboard action.

- [ ] **Step 1: Write failing behavior tests**

Assert continuous `onChange` during movement and exactly one `onChangeComplete` on pointer release. Assert completion after Arrow/Home/End and no callback for disabled or unrelated keys.

- [ ] **Step 2: Run the focused test to verify RED**

Run: `pnpm exec vitest run packages/qizhi-react/src/slider/Slider.test.tsx`

Expected: FAIL because `onChangeComplete` is not implemented.

- [ ] **Step 3: Implement completion using the last committed value**

Store the latest normalized value in a ref so pointer-up does not report a stale render value. Complete track clicks immediately when no drag movement follows; complete drags on pointer-up/pointer-cancel and keyboard actions after their commit.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/slider/Slider.test.tsx`

Expected: PASS with exact callback counts and values.

### Task 3: Reuse Tooltip positioning and portal APIs

**Files:**
- Modify: `packages/qizhi-react/src/slider/Slider.types.ts`
- Modify: `packages/qizhi-react/src/slider/Slider.tsx`
- Modify: `packages/qizhi-react/src/slider/Slider.test.tsx`
- Modify: `tests/e2e/slider-react-island.spec.ts`

**Interfaces:**
- Produces: `tooltipPosition?: TooltipPosition`.
- Produces: `getPopupContainer?: (trigger: HTMLElement) => Element`.
- Default Tooltip position remains `top` horizontally and `right` vertically.

- [ ] **Step 1: Write failing Tooltip integration tests**

Render a visible Slider Tooltip with `tooltipPosition="bottomRight"` and a custom container. Assert the real Tooltip portal is placed in that container and reports the requested position.

- [ ] **Step 2: Run the focused test to verify RED**

Run: `pnpm exec vitest run packages/qizhi-react/src/slider/Slider.test.tsx`

Expected: FAIL because Slider does not forward either prop.

- [ ] **Step 3: Forward public Tooltip contracts without creating Slider-specific overlay code**

Use the supplied position when present and otherwise preserve orientation defaults. Pass `getPopupContainer` directly to public Tooltip.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/slider/Slider.test.tsx packages/qizhi-react/src/tooltip/Tooltip.test.tsx`

Expected: PASS.

### Task 4: Synchronize API metadata, docs, demos, and acceptance gates

**Files:**
- Modify: `apps/qizhi-docs/src/slider/sliderApi.ts`
- Modify: `apps/qizhi-docs/src/slider/sliderDocs.test.tsx`
- Modify: `docs/specs/qizhi-slider-contract-v1.md`
- Modify: `docs/verification/slider-react-island.md`
- Modify: `tests/e2e/slider-react-island.spec.ts`

**Interfaces:**
- Consumes: all public interfaces from Tasks 1-3.
- Produces: one documented and tested API surface matching implementation and exported types.

- [ ] **Step 1: Write failing documentation and E2E assertions**

Lock API names, explicit `multiple` usage in the same-source Demo, `tooltipVisible` three-state wording, completed-change interaction, custom Tooltip direction, public code actions, no inline layout styles, and no private cross-component selectors.

- [ ] **Step 2: Run documentation tests to verify RED**

Run: `pnpm exec vitest run apps/qizhi-docs/src/slider/sliderDocs.test.tsx`

Expected: FAIL until metadata and Demo sources match the new public contract.

- [ ] **Step 3: Update metadata and durable documentation**

Document `multiple`, `onChangeComplete`, `tooltipPosition`, and `getPopupContainer`; explain `tooltipVisible` as `undefined` interaction-driven, `true` always visible, and `false` always hidden. Record the deliberate exclusions unchanged.

- [ ] **Step 4: Run full verification**

Run: `pnpm test`

Run: `pnpm typecheck`

Run: `pnpm build`

Run: `QIZHI_DOCS_BASE_URL=http://127.0.0.1:<port> pnpm e2e tests/e2e/slider-react-island.spec.ts --workers=1`

Expected: all commands exit 0; E2E passes at 1440, 1024, and 375 with no console errors or horizontal overflow.

- [ ] **Step 5: Inspect screenshots and source boundaries**

Open all Slider input, visible Tooltip, vertical, and draggable screenshots. Run `git diff --check` and verify Slider Demo sources contain no replaceable native interaction tags, inline layout styles, or cross-component private `__*` selectors.
