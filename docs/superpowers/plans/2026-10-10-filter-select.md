# FilterSelect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Ant Design-informed `FilterSelect` to `@wangxiaojinger/qizhi-react` that keeps the filter name and selected summary visible for single, multiple, local-search, and remote-search list filters.

**Architecture:** Extend `Select` with one explicit opt-in value-display slot while preserving its default rendering, then implement `FilterSelect` as a focused wrapper that owns business display formatting and resolved-label caching. Reuse `Select` for popup positioning, options, check indicators, selection state, search, keyboard behavior, focus, and ARIA; the docs consume only the public package export.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Vite, Playwright, pnpm workspace.

**Spec:** `docs/specs/qizhi-filter-select-contract-v1.md`

## Global Constraints

- Preserve all pre-existing dirty changes in `index.html`, `packages/qizhi-react/src/auto-complete/`, and `tests/e2e/auto-complete-react-island.spec.ts`; stage only explicit FilterSelect paths.
- Do not change existing `Select` defaults, public value types, popup behavior, option layout, multiple checkbox position, keyboard behavior, or ARIA semantics.
- New names use only the QIZHI namespace; do not add Arco names, third-party dependencies, global tokens, colors, heights, radii, shadows, or another Select implementation.
- `FilterSelect` v1 excludes groups, option creation, token separators, drag sorting, selected-tag deletion, business-filter linkage, and request debouncing.
- Docs must import from `@wangxiaojinger/qizhi-react`; previews and copied code use the same TSX source; API metadata is structured.
- Validate at 1440, 1024, and 375 widths; implementation can claim only `candidate_pass`, with independent acceptance remaining `pending`.
- Follow strict red-green-refactor: every production behavior starts with a focused failing test whose failure is caused by the missing behavior.

## Review Focus

- A controlled remote selection absent from refreshed `options` must keep its last resolved label; Task 2 tests option replacement after selection.
- An initial controlled value never present in `options` must stay visible via `String(value)` without synthesizing an option; Task 2 tests this fallback and callback output.
- `allOption.value` colliding with an ordinary option must not create duplicate interactive options; Task 2 tests deterministic first-value retention and the development warning.
- `maxDisplayCount` values below zero or above the selection count must normalize without a negative hidden count; Task 3 tests `-1`, `0`, and an oversized value.
- Non-text `label` without `aria-label` must not leave the combobox unnamed; Task 3 tests the development warning and explicit accessible name.

---

### Task 1: Add the Select opt-in display primitive without default regressions

**Files:**
- Modify: `packages/qizhi-react/src/select/Select.types.ts`
- Modify: `packages/qizhi-react/src/select/Select.tsx`
- Modify: `packages/qizhi-react/src/select/select.css`
- Test: `packages/qizhi-react/src/select/Select.test.tsx`

**Interfaces:**
- Consumes: existing `SelectProps`, selected option resolution, input/search state, and `SelectTriggerProps.valueText`.
- Produces: optional `valueRender?: (context: SelectValueRenderContext) => ReactNode` and exported `SelectValueRenderContext` containing `open`, `searching`, `query`, `selectedOptions`, and `valueText`.

- [ ] **Step 1: Write failing Select regression and opt-in tests**

Add tests named:

- `keeps the existing input rendering when valueRender is absent`: assert the existing single input value and multiple tags/removal controls remain unchanged.
- `renders an opt-in value display while retaining the real combobox input`: assert custom display text is visible, the input remains the `combobox`, and opening/searching passes current context without removing the display node.
- `reports the custom display text through the trigger valueText contract`: assert a custom trigger receives the existing selected label, not the search query.

The production mutation these catch is applying custom FilterSelect rendering to ordinary Select consumers or replacing the searchable combobox with a non-input element.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm exec vitest run packages/qizhi-react/src/select/Select.test.tsx`

Expected: FAIL because `valueRender` and `SelectValueRenderContext` do not exist; pre-existing Select tests remain green before the new assertions.

- [ ] **Step 3: Add the minimal opt-in rendering interface**

In `Select.types.ts`, define and export:

```ts
export interface SelectValueRenderContext {
  open: boolean;
  searching: boolean;
  query: string;
  selectedOptions: SelectOption[];
  valueText: string;
}
```

Add `valueRender?: (context: SelectValueRenderContext) => ReactNode` to `SelectCommonProps`. In `Select.tsx`, render its output in a `.qizhi-select__value-display` sibling before the existing input only when the prop is present; do not branch the existing tag/input code when absent. Keep the real input and current keyboard/ARIA handlers. Add only layout styles needed for ellipsis and coexistence with the input.

- [ ] **Step 4: Run Select tests and verify GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/select/Select.test.tsx`

Expected: PASS with zero warnings or failures.

- [ ] **Step 5: Run the focused typecheck**

Run: `pnpm --filter @wangxiaojinger/qizhi-react typecheck`

Expected: exit 0.

- [ ] **Step 6: Commit explicit Task 1 paths if the worktree is commit-safe**

Before committing, re-read `git status --short`. If the existing dirty `index.html` still prevents the required changelog update from being isolated safely, leave Task 1 uncommitted and record that condition; otherwise stage only the four Task 1 paths and the scoped changelog hunk.

### Task 2: Implement single-select FilterSelect and resilient option resolution

**Files:**
- Create: `packages/qizhi-react/src/select/FilterSelect.types.ts`
- Create: `packages/qizhi-react/src/select/FilterSelect.tsx`
- Create: `packages/qizhi-react/src/select/FilterSelect.test.tsx`
- Modify: `packages/qizhi-react/src/select/select.css`
- Modify: `packages/qizhi-react/src/index.ts`
- Modify: `packages/qizhi-react/scripts/exports-contract.mjs`

**Interfaces:**
- Consumes: `Select`, `SelectOption`, `SelectRawValue`, and `SelectValueRenderContext` from Task 1.
- Produces: `FilterSelect`, `FilterSelectValue`, `FilterSelectOption`, `FilterSelectFilterOption`, `FilterSelectSingleProps`, `FilterSelectMultipleProps`, and `FilterSelectProps` from the package root.

- [ ] **Step 1: Write failing public-export and single-select tests**

Test these observable behaviors with the real `Select`:

- default empty display is `所有者：全部`;
- selecting `企业管理员` immediately calls `onChange("enterprise", option)` and displays `所有者：企业管理员`;
- dropdown option names are `全部`, `企业管理员`, and `研究团队管理员`, never prefixed with `所有者：`;
- `allOption` is first, returns its real value, and a duplicate value produces one option plus a development warning;
- replacing remote `options` keeps the last resolved selected label;
- an initially unknown controlled value displays `String(value)` and no fake option appears in callbacks;
- clear emits `(undefined, undefined)` and restores `emptyText`;
- package-root runtime and type imports resolve.

The production mutations these catch are formatting option labels instead of only the trigger, losing labels when options refresh, and exporting runtime without types.

- [ ] **Step 2: Run FilterSelect tests and export contract to verify RED**

Run: `pnpm exec vitest run packages/qizhi-react/src/select/FilterSelect.test.tsx`

Expected: FAIL because the component does not exist.

Run: `pnpm --filter @wangxiaojinger/qizhi-react test:exports`

Expected: FAIL the new FilterSelect export assertions after adding those assertions to the contract script.

- [ ] **Step 3: Add the discriminated public types**

Implement the exact public API from the approved spec in `FilterSelect.types.ts`. Use `FilterSelectFilterOption = boolean | ((input: string, option: FilterSelectOption) => boolean)` and keep single-only `allOption` and multiple-only display props on their respective union members.

- [ ] **Step 4: Implement minimal single-select behavior**

Implement `FilterSelect` as a wrapper around `Select` with:

- all-option-first normalization using `Object.is` value equality;
- controlled/uncontrolled selection delegated to `Select`;
- a ref-backed label cache updated only from real options;
- trigger summary fallback order: current real option label, cached label, `String(value)`, then `emptyText ?? "全部"`;
- label/result output inside Task 1's `valueRender`, leaving `renderOption` restricted to popup content;
- `filterOption=true` mapped to existing default filtering, `false` mapped to a predicate that keeps all supplied remote options, and functions forwarded;
- no internal debounce or remote request logic.

- [ ] **Step 5: Export runtime and types**

Add `FilterSelect` and every public FilterSelect type to `packages/qizhi-react/src/index.ts`; update `exports-contract.mjs` to validate the runtime export without depending on source-text matching.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/select/FilterSelect.test.tsx packages/qizhi-react/src/select/Select.test.tsx`

Expected: PASS with no Select regressions.

Run: `pnpm --filter @wangxiaojinger/qizhi-react test:exports`

Expected: PASS.

- [ ] **Step 7: Commit explicit Task 2 paths if commit-safe**

Use the same dirty-worktree/changelog guard from Task 1; never stage the unrelated AutoComplete files or all of `index.html`.

### Task 3: Complete multiple display, search, keyboard, and accessibility contracts

**Files:**
- Modify: `packages/qizhi-react/src/select/FilterSelect.tsx`
- Modify: `packages/qizhi-react/src/select/FilterSelect.test.tsx`
- Modify: `packages/qizhi-react/src/select/select.css`

**Interfaces:**
- Consumes: public union types and single label cache from Task 2.
- Produces: complete v1 runtime behavior for multiple selection, retained display, local/remote search, and accessible naming.

- [ ] **Step 1: Write failing multiple-display tests**

Add literal assertions for:

- `标签：全部标签` with no values;
- `标签：research` with one value;
- `标签：标签A、标签B` with two values;
- `标签：标签A、标签B +3个更多` with five values and default `maxDisplayCount=2`;
- custom `separator` and `renderMore` output;
- `maxDisplayCount=-1`, `0`, and greater than the selection count produce non-negative, correct summaries;
- popup options retain the existing right-side QIZHI checkbox and multiple selections toggle immediately through `onChange`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `pnpm exec vitest run packages/qizhi-react/src/select/FilterSelect.test.tsx`

Expected: FAIL on missing multiple summary behavior.

- [ ] **Step 3: Implement multiple summary behavior**

Normalize `maxDisplayCount` with `Math.max(0, Math.floor(value))`; use cached/real labels in value order; append `renderMore(hiddenCount)` only when `hiddenCount > 0`. Continue delegating selection and checkbox rendering to `Select`; do not render tags or removal buttons in the trigger.

- [ ] **Step 4: Write failing search and accessibility tests**

Add tests for:

- local label/value filtering when `filterOption` is `true` or omitted;
- custom predicate filtering;
- `filterOption={false}` retaining all supplied remote options while `onSearch` receives each keyword;
- selected summary staying visible while the popup is open, while typing, while loading, and after options replacement when `retainDisplayValueWhenOpen` is true;
- selected summary being allowed to yield to search text only when the prop is false;
- ArrowDown/ArrowUp/Enter/Escape behavior and focus restoration through the real `Select`;
- `aria-multiselectable`, `aria-selected`, and the full accessible value text;
- non-text `label` warning without `aria-label`, and a correctly named combobox when `aria-label` is supplied.

- [ ] **Step 5: Run search/accessibility tests and verify RED**

Run: `pnpm exec vitest run packages/qizhi-react/src/select/FilterSelect.test.tsx`

Expected: FAIL only on the newly asserted search/display/accessibility branches.

- [ ] **Step 6: Implement search and accessible-name behavior**

Use the existing Select input for search; never add a second input. Keep the summary node visible by default and give search input layout space only while searching. Derive the fallback accessible name from text-only `label`; warn in development for non-text labels without an explicit name. Keep all keyboard and popup ARIA ownership inside `Select`.

- [ ] **Step 7: Run component and type verification**

Run: `pnpm exec vitest run packages/qizhi-react/src/select/FilterSelect.test.tsx packages/qizhi-react/src/select/Select.test.tsx`

Expected: PASS.

Run: `pnpm --filter @wangxiaojinger/qizhi-react typecheck`

Expected: exit 0.

- [ ] **Step 8: Commit explicit Task 3 paths if commit-safe**

Use the same dirty-worktree/changelog guard; do not stage unrelated files.

### Task 4: Add same-source documentation, classification, API metadata, and changelog

**Files:**
- Create: `apps/qizhi-docs/src/filter-select/demos/SingleDemo.tsx`
- Create: `apps/qizhi-docs/src/filter-select/demos/MultipleDemo.tsx`
- Create: `apps/qizhi-docs/src/filter-select/demos/SearchDemo.tsx`
- Create: `apps/qizhi-docs/src/filter-select/demos/RemoteDemo.tsx`
- Create: `apps/qizhi-docs/src/filter-select/demos/StatesDemo.tsx`
- Create: `apps/qizhi-docs/src/filter-select/filterSelectApi.ts`
- Create: `apps/qizhi-docs/src/filter-select/filterSelectDocs.registry.ts`
- Create: `apps/qizhi-docs/src/filter-select/FilterSelectDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/filter-select/FilterSelectDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/filter-select/FilterSelectApiTable.tsx`
- Create: `apps/qizhi-docs/src/filter-select/filterSelectDocs.css`
- Create: `apps/qizhi-docs/src/filter-select/filterSelectDocs.test.tsx`
- Create: `apps/qizhi-docs/src/filter-select/main.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: package-root `FilterSelect` and public types from Tasks 2-3; shared docs Codebox/API components and `qizhi:react-island-ready` convention.
- Produces: `#component-filter-select` documentation route under Data Input / Selectors, five same-source demos, and structured API metadata.

- [ ] **Step 1: Write failing docs structure tests**

Assert:

- exact demo order: single, multiple, local search, remote search, states;
- every source imports `FilterSelect` from `@wangxiaojinger/qizhi-react`;
- rendered docs contain unique `filter-select-API` and demo IDs;
- API metadata contains every approved public prop and exact documented defaults;
- island dispatches `qizhi:react-island-ready`;
- navigation text is `FilterSelect 筛选选择器` beneath the existing Data Input selector grouping.

- [ ] **Step 2: Run docs test and verify RED**

Run: `pnpm exec vitest run apps/qizhi-docs/src/filter-select/filterSelectDocs.test.tsx`

Expected: FAIL because docs files and route do not exist.

- [ ] **Step 3: Implement five same-source demos and metadata**

Follow the existing Select documentation components and shared Codebox/API conventions without copying the public component. RemoteDemo owns demo-only asynchronous filtering and cleans up pending timers; the component remains debounce/request agnostic.

- [ ] **Step 4: Register the island and information architecture**

Add a `#component-filter-select` section and `/apps/qizhi-docs/src/filter-select/main.tsx` module script to `index.html`, then add its navigation target adjacent to Select. In the existing 2026-10-10 changelog day, increment the count and prepend a FilterSelect entry without overwriting the current AutoComplete entry or its uncommitted text.

- [ ] **Step 5: Run docs and structural checks**

Run: `pnpm exec vitest run apps/qizhi-docs/src/filter-select/filterSelectDocs.test.tsx apps/qizhi-docs/src/select/selectDocs.test.tsx`

Expected: PASS.

Run `pnpm api:validate`. Then run an inline read-only Node check that parses `index.html`, reports duplicate `id` values, and verifies every local `href="#..."` and static `aria-controls` target exists exactly once; expected result is exit 0 with no reported target.

- [ ] **Step 6: Commit only FilterSelect docs plus the exact index/config hunks if commit-safe**

Use patch staging for `index.html`; verify `git diff --cached` contains the AutoComplete changelog text only if it was already part of the same user-approved commit scope. If isolation is not possible, leave the task uncommitted and report the blocker.

### Task 5: Add browser acceptance and run delivery verification

**Files:**
- Create: `tests/e2e/filter-select-react-island.spec.ts`
- Modify only if required by exact counts: existing docs/E2E contract files whose expectations are invalidated by the new route

**Interfaces:**
- Consumes: built package and docs route from Tasks 1-4.
- Produces: repeatable mouse, keyboard, responsive, geometry, console, and screenshot evidence.

- [ ] **Step 1: Write the failing Playwright acceptance test**

Cover at each configured 1440/1024/375 project:

- route and five demos render;
- single and multiple literal summaries match the spec;
- opening, typing, loading, and refreshed remote options never blank the retained summary;
- popup option text excludes the filter label;
- multiple option checkbox is to the far right and vertically centered;
- mouse selection and deselection immediately update demo state;
- keyboard open/navigation/select/Escape and focus restoration work;
- popup stays inside the viewport and is not clipped by ancestors;
- component and page have no horizontal overflow;
- browser console has no new errors;
- save and inspect focused screenshots for closed, open-multiple, and open-search states.

- [ ] **Step 2: Run the new E2E and verify RED**

Start the repository dev server on an unused explicit port, then run:

`QIZHI_DOCS_BASE_URL=http://127.0.0.1:<port> pnpm exec playwright test tests/e2e/filter-select-react-island.spec.ts`

Expected: FAIL before the new island is available or on the first missing acceptance behavior.

- [ ] **Step 3: Make only acceptance-required corrections**

Fix FilterSelect/component-doc code only. Do not opportunistically repair unrelated failures; record any pre-existing failure by exact test name and output.

- [ ] **Step 4: Re-run focused component, docs, and E2E verification**

Run:

- `pnpm exec vitest run packages/qizhi-react/src/select/FilterSelect.test.tsx packages/qizhi-react/src/select/Select.test.tsx apps/qizhi-docs/src/filter-select/filterSelectDocs.test.tsx apps/qizhi-docs/src/select/selectDocs.test.tsx`
- `QIZHI_DOCS_BASE_URL=http://127.0.0.1:<port> pnpm exec playwright test tests/e2e/filter-select-react-island.spec.ts`

Expected: all focused checks PASS across 1440/1024/375 with zero new console errors.

- [ ] **Step 5: Inspect screenshots rather than treating their existence as acceptance**

Open every generated FilterSelect screenshot and record conclusions for text retention, ellipsis, checkbox placement, popup bounds, focus styling, and 375px layout.

- [ ] **Step 6: Run final repository verification once**

Run:

- `node --check script.js`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm --filter @wangxiaojinger/qizhi-react test:exports`

Expected: exit 0 and zero failed tests. If the full suite exposes a pre-existing failure, report its exact scope separately from focused FilterSelect evidence.

- [ ] **Step 7: Audit final diff and delivery state**

Run `git status --short`, `git diff --check`, and an explicit path diff. Confirm no AutoComplete files, unrelated `index.html` hunks, generated build output, screenshots, credentials, or temporary files were added. Report code state, commit state, release state, and independent validation state separately.

- [ ] **Step 8: Commit final explicit paths only if commit-safe**

Do not use `git add .`. If the dirty shared `index.html` still prevents an isolated commit, leave the verified candidate uncommitted and state why; do not claim it is submitted, merged, released, or independently accepted.

