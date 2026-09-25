# Advanced Form.List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend QIZHI `Form.List` with enforceable quantity limits, Ant Design-style list rules and error rendering, row-level validation, atomic batch add, and verified nested-list migration.

**Architecture:** Keep `Form.List` as the React-facing adapter and move list constraints, stable-key state, validation versions, and mutations into `formStore`. Register every mounted list with its path and rules; store row errors by stable list key so reordering does not detach errors from data. Render errors through a stateless `Form.ErrorList`, while `validateFields` incorporates registered list and row errors into the existing form failure contract.

**Tech Stack:** React 19, TypeScript 7, Vitest, Testing Library, Playwright, Vite, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-25-advanced-form-list-design.md`

## Global Constraints

- Preserve existing `add`, `remove`, `move`, nested submission, error migration, Steps, Draft, and `preserve` behavior.
- `min` and `max` are optional non-negative safe integers; when both exist, `min <= max`.
- The library has no default `max`; the docs Demo alone uses `min={1}` and `max={10}`.
- User list operations enforce limits atomically; programmatic writes and draft restore preserve incoming data and report validation errors.
- List rules report through `meta.errors`; row rules report through `field.errors`; field rules remain owned by `Form.Item`.
- No batch move, clear API, selection model, server pagination, Bulk Edit behavior, storage implementation, or business-specific rule belongs in this phase.
- Displayed Demo code, copied code, API metadata, and runtime code must remain synchronized.
- Existing unrelated dirty-worktree changes must not be reverted, overwritten, formatted, or included in feature commits.
- Executor self-test status is at most `candidate_pass`; independent final acceptance remains `pending` until independently verified.

## Review Focus

- A zero-item list with `min={0}` must allow remaining empty and must not emit a quantity error.
- Duplicate and invalid delete indexes must be normalized before `min` is evaluated, so `canRemove` and `remove` agree.
- A late async list or row result must not reappear after a row is edited, moved, deleted, restored, or revalidated.
- Programmatic restore above `max` must retain every restored row and stable key while blocking successful validation.
- Nested list paths, keys, errors, configs, and validation versions must migrate with the owning outer row rather than remaining at stale indexes.

---

### Task 1: Lock the public type contract and add `Form.ErrorList`

**Files:**
- Modify: `packages/qizhi-react/src/form/Form.types.ts`
- Modify: `packages/qizhi-react/src/form/Form.types.test.tsx`
- Modify: `packages/qizhi-react/src/form/Form.tsx`
- Modify: `packages/qizhi-react/src/form/form.css`
- Modify: `packages/qizhi-react/src/index.ts`
- Test: `packages/qizhi-react/src/form/Form.test.tsx`

**Interfaces:**
- Consumes: existing `FormNamePath`, `FormValues`, `FormRuleFailure`, `FormComponent`.
- Produces: `FormListRule`, `FormListRowRule`, `FormListMeta`, `FormErrorListProps`, expanded `FormListField`, `FormListOperations`, `FormListProps`, and `Form.ErrorList`.

- [ ] **Step 1: Write failing public-type assertions**

Add a compile-time usage case to `Form.types.test.tsx` that fixes the complete surface:

```tsx
const listRule: FormListRule = {
  validator: async (rows, values) => {
    expectTypeOf(rows).toEqualTypeOf<unknown[]>();
    expectTypeOf(values).toEqualTypeOf<FormValues>();
  },
};
const rowRule: FormListRowRule = async (row, index, values) => {
  expectTypeOf(row).toEqualTypeOf<unknown>();
  expectTypeOf(index).toEqualTypeOf<number>();
  expectTypeOf(values).toEqualTypeOf<FormValues>();
};

<Form.List name="members" min={1} max={10} rules={[listRule]} rowRules={[rowRule]}>
  {(fields, operations, meta) => {
    operations.addMany([{ name: "A" }, { name: "B" }]);
    expectTypeOf(operations.canAdd(2)).toEqualTypeOf<boolean>();
    expectTypeOf(operations.canRemove([0, 1])).toEqualTypeOf<boolean>();
    expectTypeOf(fields[0]?.errors).toEqualTypeOf<string[] | undefined>();
    expectTypeOf(meta.errors).toEqualTypeOf<string[]>();
    return <Form.ErrorList errors={meta.errors} />;
  }}
</Form.List>;
```

- [ ] **Step 2: Run the typecheck and verify it fails on missing exports and members**

Run: `pnpm typecheck`

Expected: FAIL because the advanced list types, operation members, render meta, and `Form.ErrorList` do not exist.

- [ ] **Step 3: Add the exact public interfaces and exports**

Implement the signatures from the spec in `Form.types.ts`:

```ts
export interface FormListRule {
  message?: string;
  validator?: (listValue: unknown[], values: FormValues) =>
    void | FormRuleFailure | Promise<void | FormRuleFailure>;
}
export type FormListRowRule = (
  rowValue: unknown,
  index: number,
  allValues: FormValues,
) => void | FormRuleFailure | Promise<void | FormRuleFailure>;
export interface FormListMeta { errors: string[] }
export interface FormErrorListProps {
  errors?: readonly ReactNode[];
  className?: string;
  style?: CSSProperties;
}
```

Update `FormComponent` with `ErrorList: (props: FormErrorListProps) => ReactNode`, add all new types to `src/index.ts`, and keep every new `Form.List` prop optional except `name` and `children`.

- [ ] **Step 4: Write failing `Form.ErrorList` rendering tests**

Add tests that require no visible element for an empty array and ordered accessible output for errors:

```tsx
const { rerender } = render(<Form.ErrorList errors={[]} />);
expect(screen.queryByRole("alert")).not.toBeInTheDocument();

rerender(<Form.ErrorList errors={["数量不足", <span key="duplicate">成员重复</span>]} className="custom-errors" />);
const alert = screen.getByRole("alert");
expect(alert).toHaveClass("qizhi-form-error-list", "custom-errors");
expect(alert).toHaveTextContent("数量不足成员重复");
expect([...alert.children].map((node) => node.textContent)).toEqual(["数量不足", "成员重复"]);
```

- [ ] **Step 5: Implement the stateless error renderer and styles**

Add a focused component in `Form.tsx` and attach it to the namespace:

```tsx
function FormErrorList({ errors = [], className, style }: FormErrorListProps) {
  if (!errors.length) return null;
  return (
    <div className={joinClassNames("qizhi-form-error-list", className)} style={style} role="alert">
      {errors.map((error, index) => <div key={index}>{error}</div>)}
    </div>
  );
}

export const Form = Object.assign(FormRoot, {
  Item: FormItem,
  List: FormList,
  ErrorList: FormErrorList,
  useForm,
  useWatch,
  useDirty,
  useSteps,
  useDraft,
}) as FormComponent;
```

Style `.qizhi-form-error-list` with the existing danger token, 14px text, 22px line height, and an 8px vertical gap. Do not give it list-specific margins; Demo layout owns spacing.

- [ ] **Step 6: Run focused tests and typecheck**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/Form.test.tsx packages/qizhi-react/src/form/Form.types.test.tsx`

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 7: Commit only Task 1 files**

```bash
git add packages/qizhi-react/src/form/Form.types.ts packages/qizhi-react/src/form/Form.types.test.tsx packages/qizhi-react/src/form/Form.tsx packages/qizhi-react/src/form/form.css packages/qizhi-react/src/form/Form.test.tsx packages/qizhi-react/src/index.ts
git commit -m "feat(form): expose advanced list contracts"
```

### Task 2: Enforce quantity limits and atomic list operations in the store

**Files:**
- Modify: `packages/qizhi-react/src/form/formStore.ts`
- Modify: `packages/qizhi-react/src/form/formStore.test.ts`

**Interfaces:**
- Consumes: `FormListRule`, `FormListRowRule`, stable list keys, existing list mutation helpers.
- Produces: `registerList`, `updateListConfig`, `addListValues`, `canAddListValues`, and `canRemoveListValues`; existing single-add/remove/move methods remain compatible.

- [ ] **Step 1: Write failing store tests for configuration validation**

Test `min/max` independently and together:

```ts
expect(() => store.registerList("members", { min: -1, rules: [], rowRules: [] })).toThrow(/min/);
expect(() => store.registerList("members", { max: 1.5, rules: [], rowRules: [] })).toThrow(/max/);
expect(() => store.registerList("members", { min: 2, max: 1, rules: [], rowRules: [] })).toThrow(/min.*max/);
expect(() => store.registerList("members", { min: 0, max: 0, rules: [], rowRules: [] })).not.toThrow();
```

- [ ] **Step 2: Write failing tests for guards and atomic mutations**

Cover the Review Focus normalization rule and batch order:

```ts
store.initialize({ members: [{ name: "A" }, { name: "B" }] });
store.initializeList("members");
store.registerList("members", { min: 1, max: 4, rules: [], rowRules: [] });

expect(store.canAddListValues("members", 2)).toBe(true);
store.addListValues("members", [{ name: "C" }, { name: "D" }], 1);
expect(store.instance.getFieldValue("members")).toEqual([
  { name: "A" }, { name: "C" }, { name: "D" }, { name: "B" },
]);
expect(store.canAddListValues("members", 1)).toBe(false);
store.addListValues("members", [{ name: "E" }]);
expect(store.instance.getFieldValue("members")).toHaveLength(4);

expect(store.canRemoveListValues("members", [0, 0, -1, 99])).toBe(true);
store.removeListValue("members", [0, 0, -1, 99]);
expect(store.instance.getFieldValue("members")).toHaveLength(3);
expect(store.canRemoveListValues("members", [0, 1, 2])).toBe(false);
```

Also assert `addMany([])` is a no-op, `canAdd(0)` is true, a non-safe `count` is rejected consistently, and blocked operations leave values, keys, errors, notifications, and `onValuesChange` untouched.

- [ ] **Step 3: Run the focused tests and verify the new APIs fail**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formStore.test.ts`

Expected: FAIL because list registration, guards, and batch add are missing.

- [ ] **Step 4: Add list configuration state and validation**

Introduce internal state without replacing existing field state:

```ts
type ListConfig = {
  path: FormNameSegment[];
  min?: number;
  max?: number;
  rules: FormListRule[];
  rowRules: FormListRowRule[];
};

const assertListLimits = (min?: number, max?: number) => {
  if (min !== undefined && (!Number.isSafeInteger(min) || min < 0)) throw new Error("Form.List min 必须是非负安全整数。");
  if (max !== undefined && (!Number.isSafeInteger(max) || max < 0)) throw new Error("Form.List max 必须是非负安全整数。");
  if (min !== undefined && max !== undefined && min > max) throw new Error("Form.List min 不能大于 max。");
};
```

Store configs by encoded path. `registerList` returns an unregister function, `updateListConfig` replaces the active rule arrays and limits, and nested configs remain independently keyed.

- [ ] **Step 5: Implement shared normalization and atomic operations**

Use one normalization path for guards and mutations:

```ts
const validRemovalIndexes = (length: number, input: number | readonly number[]) =>
  [...new Set(Array.isArray(input) ? input : [input])]
    .filter((index) => Number.isSafeInteger(index) && index >= 0 && index < length)
    .sort((left, right) => right - left);
```

`addListValue` delegates to `addListValues(name, [value], index)`. Check the final length before generating keys or remapping state. `removeListValue` checks the normalized final length before mutation. Empty or blocked requests return without notifying.

- [ ] **Step 6: Run store tests and the existing list regression suite**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/FormList.test.tsx`

Expected: PASS, including existing add/remove/move and migration cases.

- [ ] **Step 7: Commit only Task 2 files**

```bash
git add packages/qizhi-react/src/form/formStore.ts packages/qizhi-react/src/form/formStore.test.ts
git commit -m "feat(form): enforce list quantity limits"
```

### Task 3: Add list-level and stable-key row validation

**Files:**
- Modify: `packages/qizhi-react/src/form/formStore.ts`
- Modify: `packages/qizhi-react/src/form/formStore.test.ts`
- Modify: `packages/qizhi-react/src/form/Form.test.tsx`

**Interfaces:**
- Consumes: registered list configs and stable keys from Task 2, existing `FormRuleFailure` and validation cancellation behavior.
- Produces: `validateList`, `getListErrors`, `getListRowErrors`, list validation inclusion in `validateFields`, and descendant fallback in `scrollToField`.

- [ ] **Step 1: Write failing list-rule tests**

Register a duplicate-name rule and assert the public failure shape:

```ts
store.registerList("members", {
  min: 1,
  max: 10,
  rowRules: [],
  rules: [{
    validator: (rows) => {
      const names = rows.map((row) => (row as { name: string }).name);
      return new Set(names).size === names.length
        ? undefined
        : { type: "field", message: "成员名称不能重复" };
    },
  }],
});

await expect(store.instance.validateFields()).rejects.toMatchObject({
  errorFields: [{ name: "members", errors: ["成员名称不能重复"] }],
});
expect(store.getListErrors("members")).toEqual(["成员名称不能重复"]);
```

Add separate cases for `min/max` ordering before custom errors, `rules` declaration order, network failure routing, and programmatic restore above `max` retaining all values while validation rejects.

- [ ] **Step 2: Write failing async race tests for whole-list rules**

Use two deferred validators. Start validation for the old value, change the list, start a second validation, resolve the second successfully, then reject the first. Assert the first result is cancelled or ignored and `getListErrors` remains empty.

- [ ] **Step 3: Write failing row-rule and stable-key migration tests**

Require errors to follow data rather than indexes:

```ts
store.registerList("members", {
  rules: [],
  rowRules: [row => (row as { start: number; end: number }).start < (row as { start: number; end: number }).end
    ? undefined
    : { type: "field", message: "开始值必须小于结束值" }],
});
await store.validateList("members");
const invalidKey = store.getListKeys("members")[1];
expect(store.getListRowErrors("members", invalidKey)).toEqual(["开始值必须小于结束值"]);
store.moveListValue("members", 1, 0);
expect(store.getListRowErrors("members", invalidKey)).toEqual(["开始值必须小于结束值"]);
store.removeListValue("members", 0);
expect(store.getListRowErrors("members", invalidKey)).toEqual([]);
```

Also test that editing a descendant reruns only its row plus whole-list rules, the row validator receives nested-list data, and stale async row errors cannot return after move/delete/revalidation.

- [ ] **Step 4: Run focused tests and verify validation support is missing**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.test.tsx`

Expected: FAIL on missing list validation APIs and missing `validateFields` integration.

- [ ] **Step 5: Implement isolated list validation state**

Keep list errors separate from field errors internally:

```ts
type ListValidationState = {
  errors: string[];
  rowErrors: Map<string, string[]>;
  version: number;
  rowVersions: Map<string, number>;
};
```

Validate quantity first, then custom list rules in declaration order. Validate rows against a snapshot of the current keys and values. Before writing any async result, verify the list registration, version, row key, and current key-to-value association are still current. Route `{ type: "network" }` through the existing validation-exception callback and do not store it as a content error.

- [ ] **Step 6: Trigger validation from every relevant value path**

After user or programmatic writes, find registered lists whose path is equal to or an ancestor of the changed path. Revalidate the whole list and, when the changed path contains a direct row index, that stable-key row. In `validateFields(names)`, await selected registered lists after field validation and append:

```ts
{ name: publicNamePath(list.path), errors: listErrors }
{ name: [...list.path, currentIndex], errors: rowErrors }
```

Deduplicate entries by encoded error path. Preserve current field validation ordering, with list errors emitted at the registered list position after descendant field errors have been evaluated.

- [ ] **Step 7: Make first-error scrolling work without expanding `Form.ErrorList` API**

Update `scrollToField` to use an exact registered node first, then the first descendant field node in document order. This lets a list path focus its first row and a row path focus its first input while `Form.ErrorList` remains display-only.

- [ ] **Step 8: Run validation, submission, Steps, and Draft regressions**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.test.tsx packages/qizhi-react/src/form/FormSteps.test.tsx packages/qizhi-react/src/form/FormDraft.test.tsx`

Expected: PASS.

- [ ] **Step 9: Commit only Task 3 files**

```bash
git add packages/qizhi-react/src/form/formStore.ts packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.test.tsx
git commit -m "feat(form): validate lists and rows"
```

### Task 4: Wire the React `Form.List` adapter and verify nested migration

**Files:**
- Modify: `packages/qizhi-react/src/form/Form.tsx`
- Modify: `packages/qizhi-react/src/form/FormList.test.tsx`
- Modify: `packages/qizhi-react/src/form/formStore.ts`

**Interfaces:**
- Consumes: public contracts from Task 1 and store registration, operations, and validation getters from Tasks 2–3.
- Produces: the final three-argument render function, `field.errors`, `meta.errors`, and nested-list-safe registration lifecycle.

- [ ] **Step 1: Write failing component tests for render metadata and guards**

Capture the public objects and assert component/store agreement:

```tsx
<Form.List name="members" min={1} max={2} rules={[duplicateRule]} rowRules={[rowRule]}>
  {(fields, operations, meta) => {
    latest = { fields, operations, meta };
    return <Form.ErrorList errors={meta.errors} />;
  }}
</Form.List>
```

Assert `canAdd/canRemove` changes with length, blocked operations are no-ops, `addMany` preserves order, `meta.errors` displays list failures, and each `field.errors` maps to the correct stable key.

- [ ] **Step 2: Write failing nested migration tests**

Build an outer member list containing an inner aliases list. Give inner lists independent limits and rules, create outer and inner errors, move the outer row, then delete another row. Assert:

```ts
expect(form.getFieldValue("members")).toEqual(expectedNestedValues);
expect(movedOuterKey).toBe(originalOuterKey);
expect(movedInnerKeys).toEqual(originalInnerKeys);
expect(movedRowErrors).toEqual(originalRowErrors);
expect(movedInnerMetaErrors).toEqual(originalInnerMetaErrors);
```

Include `preserve={false}` descendants and a programmatic restore that expands and then contracts both levels.

- [ ] **Step 3: Run the focused suite and verify the adapter is incomplete**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/FormList.test.tsx`

Expected: FAIL because `FormList` does not register config, expose meta/row errors, or provide advanced operations.

- [ ] **Step 4: Register and update lists from `FormList`**

Use effects keyed by normalized name and current props:

```tsx
useEffect(
  () => store.registerList(name, { min, max, rules, rowRules }),
  [nameKey, store],
);
useEffect(
  () => store.updateListConfig(name, { min, max, rules, rowRules }),
  [nameKey, max, min, rowRules, rules, store],
);
```

Keep `initializeList` idempotent. Build `fields` from stable keys and store-owned row errors. Memoize operations against `nameKey`, limits through registered store state, and the store instance. Pass `{ errors: store.getListErrors(name) }` as the third child argument.

- [ ] **Step 5: Remap all nested list-owned state**

Extend `remapListState` so outer mutations migrate not only fields and field errors, but also nested `lists`, `listPaths`, list configs, list validation errors, row-error maps, validating markers, and validation versions. Re-encode every migrated path and drop all state beneath deleted rows. Never regenerate surviving nested keys.

- [ ] **Step 6: Run all Form unit tests and typecheck**

Run: `pnpm exec vitest run packages/qizhi-react/src/form`

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 7: Commit only Task 4 files**

```bash
git add packages/qizhi-react/src/form/Form.tsx packages/qizhi-react/src/form/FormList.test.tsx packages/qizhi-react/src/form/formStore.ts
git commit -m "feat(form): connect advanced list behavior"
```

### Task 5: Add the Advanced Dynamic List Demo and synchronize API documentation

**Files:**
- Create: `apps/qizhi-docs/src/form/demos/AdvancedListDemo.tsx`
- Modify: `apps/qizhi-docs/src/form/formDocs.registry.ts`
- Modify: `apps/qizhi-docs/src/form/formApi.ts`
- Modify: `apps/qizhi-docs/src/form/FormApiTable.tsx`
- Modify: `apps/qizhi-docs/src/form/formDocs.css`
- Modify: `apps/qizhi-docs/src/form/formDocs.test.tsx`
- Modify: `scripts/build-component-api.mjs`
- Regenerate: `apps/qizhi-docs/src/api/component-api.json`

**Interfaces:**
- Consumes: final public API from Task 4.
- Produces: a ninth Form Demo, synchronized raw/copy source, API rows for all new props, and generated component metadata.

- [ ] **Step 1: Write failing docs registry and interaction tests**

Append exactly one Demo after “表单草稿”:

```ts
expect(formDemos.at(-1)).toMatchObject({
  id: "表单-高级动态列表",
  title: "高级动态列表",
  description: "演示数量限制、列表与整行校验、批量新增以及嵌套列表状态迁移。",
});
```

Update source-code assertions from 8 to 9. Add interactions that verify:

- one initial row makes Delete disabled under `min={1}`;
- “批量新增 2 项” creates two ordered rows;
- reaching ten rows disables Add and Batch Add according to `canAdd`;
- duplicate names show “成员名称不能重复” in `Form.ErrorList`;
- an invalid start/end pair shows a row-local error;
- moving a row retains its aliases and errors.

- [ ] **Step 2: Write failing API metadata expectations**

Require the exact order:

```ts
expect(formListApi.map((item) => item.name)).toEqual([
  "name", "initialValue", "min", "max", "rules", "rowRules", "children",
]);
```

Add a `Form.ErrorList` API table backed by `FormErrorListProps`, with `errors`, `className`, and `style`. Require generated JSON to contain the same names and descriptions.

- [ ] **Step 3: Run docs tests and verify the Demo and metadata are missing**

Run: `pnpm exec vitest run apps/qizhi-docs/src/form/formDocs.test.tsx`

Expected: FAIL on the ninth Demo and new API rows.

- [ ] **Step 4: Implement the business-neutral Demo**

Use neutral rows shaped like:

```ts
interface RuleRow {
  name: string;
  start: number | "";
  end: number | "";
  aliases: Array<{ value: string }>;
}
```

Use `min={1}` and `max={10}`. The list rule rejects duplicate non-empty names. The row rule rejects numeric `start >= end`. Buttons derive disabled state only from `canAdd/canRemove`; store operations remain the enforcement layer. Use explicit `aria-label` values for every input and action.

- [ ] **Step 5: Add responsive Demo styling**

Create scoped `.form-advanced-list-*` classes. Use CSS grid with `minmax(0, 1fr)`, wrapping action groups, and a single-column fallback at the existing Form mobile breakpoint. Place row errors beneath their row content and list errors beneath the full list without moving sibling action columns.

- [ ] **Step 6: Update hand-authored and generated API documentation**

Add `min`, `max`, `rules`, `rowRules`, and the three-argument `children` description to `formListApi`; add `formErrorListApi` and render its table. Update `build-component-api.mjs`, then run:

Run: `pnpm api:build`

Expected: `component-api.json` changes only in the relevant Form metadata plus deterministic generator formatting.

- [ ] **Step 7: Run docs, API, and type checks**

Run: `pnpm exec vitest run apps/qizhi-docs/src/form/formDocs.test.tsx`

Run: `pnpm api:validate`

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 8: Commit only Task 5 files**

```bash
git add apps/qizhi-docs/src/form/demos/AdvancedListDemo.tsx apps/qizhi-docs/src/form/formDocs.registry.ts apps/qizhi-docs/src/form/formApi.ts apps/qizhi-docs/src/form/FormApiTable.tsx apps/qizhi-docs/src/form/formDocs.css apps/qizhi-docs/src/form/formDocs.test.tsx scripts/build-component-api.mjs apps/qizhi-docs/src/api/component-api.json
git commit -m "docs(form): demonstrate advanced lists"
```

### Task 6: Complete browser acceptance and regression verification

**Files:**
- Modify: `tests/e2e/form-react-island.spec.ts`

**Interfaces:**
- Consumes: the completed runtime, docs Demo, and API metadata.
- Produces: real-browser evidence across the configured desktop, tablet, and narrow-screen Playwright projects.

- [ ] **Step 1: Write failing E2E expectations for the ninth Demo**

Update counts from 8 to 9 and add an advanced-list flow:

```ts
const advanced = page.locator("#表单-高级动态列表");
await expect(advanced.getByRole("button", { name: "删除第 1 行" })).toBeDisabled();
await advanced.getByRole("button", { name: "批量新增 2 项" }).click();
await expect(advanced.getByRole("textbox", { name: /第 \d+ 行名称/ })).toHaveCount(3);
await advanced.getByRole("textbox", { name: "第 2 行名称" }).fill("成员甲");
await advanced.getByRole("textbox", { name: "第 3 行名称" }).fill("成员甲");
await advanced.getByRole("button", { name: "校验高级列表" }).click();
await expect(advanced.getByRole("alert")).toContainText("成员名称不能重复");
```

Add row-error migration and nested-alias movement checks. Include the new Demo in screenshot output and overflow geometry assertions.

- [ ] **Step 2: Run the focused E2E and verify the old counts fail**

Run: `pnpm exec playwright test tests/e2e/form-react-island.spec.ts`

Expected: FAIL before the E2E is updated, then PASS after the new expectations match the implemented Demo.

- [ ] **Step 3: Run the complete verification ladder**

Run: `pnpm api:validate`

Run: `pnpm typecheck`

Run: `pnpm exec vitest run packages/qizhi-react/src/form apps/qizhi-docs/src/form/formDocs.test.tsx`

Run: `pnpm exec playwright test tests/e2e/form-react-island.spec.ts`

Run: `pnpm build`

Expected: every command exits 0; browser console/page errors are empty; all three configured viewports have no horizontal overflow.

- [ ] **Step 4: Inspect generated browser evidence**

Open the desktop, tablet, and narrow-screen advanced-list screenshots. Confirm list errors stay below the list, row errors stay with their row, action columns do not shift when errors appear, disabled states match limits, and no field is clipped.

- [ ] **Step 5: Review the final diff for scope and dirty-tree safety**

Run: `git diff --check`

Run: `git status --short`

Run: `git diff -- packages/qizhi-react/src/form apps/qizhi-docs/src/form tests/e2e/form-react-island.spec.ts scripts/build-component-api.mjs apps/qizhi-docs/src/api/component-api.json`

Expected: no whitespace errors; only planned Advanced Form.List changes are staged for the final task; unrelated pre-existing modifications remain unstaged and untouched.

- [ ] **Step 6: Commit the E2E acceptance update**

```bash
git add tests/e2e/form-react-island.spec.ts
git commit -m "test(form): accept advanced list behavior"
```

- [ ] **Step 7: Record completion status honestly**

Report the exact command results and artifact paths. Mark implementation as `candidate_pass`. Mark independent final acceptance as `pending` unless a separate reviewer reruns the checks and inspects the rendered evidence.
