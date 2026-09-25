# Form Bulk Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a headless `Form.useBulkEdit` API that derives mixed values for homogeneous records, validates and submits only explicit edits, distinguishes keep/set/clear, and reconciles partial success without owning business requests or UI.

**Architecture:** Keep immutable snapshot and patch rules in a pure `formBulkEditCore` module, and keep React subscriptions plus Form integration in a focused `formBulkEdit` hook. The hook reuses the existing `FormInstance` and internal store subscriptions, while public contracts live in `Form.types.ts` and the Form namespace remains a thin adapter. Docs provide one accessible business Demo without introducing a second visual component.

**Tech Stack:** React 19, TypeScript 7, Vitest 4, Testing Library, Vite 8, Playwright 1.62, pnpm 11.

**Spec:** `docs/superpowers/specs/2026-09-25-form-bulk-edit-design.md`

## Global Constraints

- Support only homogeneous records and explicitly declared `FormNamePath` fields.
- Keep mixed state outside form values; never write a display sentinel into business data.
- Preserve `keep / set / clear` as distinct states and never submit `keep` fields.
- The library must not send requests, assume authentication, or translate `clearedFields` into a business-specific value.
- Arrays and objects are compared and replaced as whole field values; v1 does not merge array entries.
- Reuse existing Form validation, async-race handling, network-exception separation, error shape and scroll behavior.
- Do not alter behavior for consumers that do not call `Form.useBulkEdit`.
- Do not rewrite Form Steps, Form Draft, Advanced Form.List, or existing Demo copy.
- The worktree contains user-owned changes in shared Form and docs files. Never reset, clean, reformat, or stage an entire dirty shared file without proving every staged hunk belongs to this plan.
- For shared dirty files, stage an index-only patch for Bulk Edit hunks and inspect `git diff --cached`; never use broad `git add packages apps` commands.
- Do not push, publish, release, or modify package versions.
- Completion is at most `candidate_pass`; independent final verification stays `pending` until actually performed.

## File Structure

- Create `packages/qizhi-react/src/form/formBulkEditCore.ts` — pure validation, snapshot, equality, field-state and patch/result transitions.
- Create `packages/qizhi-react/src/form/formBulkEditCore.test.ts` — pure model tests and malformed-input coverage.
- Create `packages/qizhi-react/src/form/formBulkEdit.ts` — React hook, store subscriptions, validation and source-change lifecycle.
- Create `packages/qizhi-react/src/form/FormBulkEdit.test.tsx` — rendered hook and Form integration tests.
- Modify `packages/qizhi-react/src/form/Form.types.ts` — public Bulk Edit types and `FormComponent.useBulkEdit`.
- Modify `packages/qizhi-react/src/form/Form.tsx` — attach the hook to the Form namespace only.
- Modify `packages/qizhi-react/src/form/Form.types.test.tsx` — generic inference and controller types.
- Modify `packages/qizhi-react/src/index.ts` — public type exports.
- Create `apps/qizhi-docs/src/form/demos/BulkEditDemo.tsx` — accessible member bulk-edit scenario.
- Modify `apps/qizhi-docs/src/form/formDocs.registry.ts`, `formApi.ts`, `FormApiTable.tsx`, `formDocs.test.tsx`, and `formDocs.css`.
- Regenerate `apps/qizhi-docs/src/api/component-api.json` through `pnpm api:build`.
- Modify `tests/e2e/form-react-island.spec.ts` — real workflow and three-viewport geometry.

## Review Focus

- `NaN`, `Date`, sparse arrays and object-key order must not make equal values appear mixed; unsupported cycles fail clearly. Covered in Task 1.
- Parent and child fields such as `profile` and `["profile", "remark"]` would overlap in a patch and must be rejected. Covered in Task 1.
- Rerenders recreate arrays and callbacks; semantically unchanged inputs must not reset sessions or loop. Covered in Task 2.
- Late async validation must not create a patch after records changed or a newer validation began. Covered in Task 3.
- Partial results may contain multiple failures for one key, duplicated successes, overlap, omission or unknown keys; only complete unambiguous classifications are accepted. Covered in Task 3.

---

### Task 1: Build the pure snapshot and patch model

**Files:**
- Create: `packages/qizhi-react/src/form/formBulkEditCore.ts`
- Create: `packages/qizhi-react/src/form/formBulkEditCore.test.ts`
- Modify: `packages/qizhi-react/src/form/Form.types.ts`

**Interfaces:**
- Consumes: `FormNamePath`, `FormNameSegment`, `FormValues`, `getValueAtPath`, `setValueAtPath`, `encodeNamePath`, `normalizeNamePath`.
- Produces: `createBulkEditSnapshot(options)`, `buildBulkEditPatch(snapshot, modes, values, targetKeys)`, `validateBulkEditResult(targetKeys, fields, result)`, and public types from the spec.

- [ ] **Step 1: Add public contracts and failing input tests**

Add these exact foundations to `Form.types.ts`:

```ts
export type FormBulkEditKey = string | number;
export type FormBulkEditMode = "keep" | "set" | "clear";
export type FormBulkEditStatus = "ready" | "sourceChanged" | "complete";
export type FormBulkEditBlockedCode = "no-changes" | "no-targets" | "source-changed";

export interface FormBulkEditBlockedError extends Error {
  code: FormBulkEditBlockedCode;
}
export interface FormBulkEditOptions<TRecord, TKey extends FormBulkEditKey> {
  form: FormInstance;
  records: readonly TRecord[];
  getRowKey: (record: TRecord) => TKey;
  fields: readonly FormNamePath[];
  getFieldValue?: (record: TRecord, name: FormNamePath) => unknown;
  isEqual?: (left: unknown, right: unknown, name: FormNamePath) => boolean;
}
export interface FormBulkEditFieldState {
  name: FormNamePath;
  mixed: boolean;
  mode: FormBulkEditMode;
  initialValue: unknown;
}
export interface FormBulkEditPatch<TKey extends FormBulkEditKey> {
  targetKeys: readonly TKey[];
  values: FormValues;
  clearedFields: readonly FormNamePath[];
}
export interface FormBulkEditFailure<TKey extends FormBulkEditKey> {
  key: TKey;
  field?: FormNamePath;
  message: string;
}
export interface FormBulkEditResult<TKey extends FormBulkEditKey> {
  succeededKeys: readonly TKey[];
  failures: readonly FormBulkEditFailure<TKey>[];
}
```

In the new test, call `createBulkEditSnapshot` with empty fields, duplicate normalized paths, overlapping parent/child paths, duplicate row keys, a boolean key forced through `unknown`, and cyclic default values. Assert an exact descriptive throw for every invalid case.

- [ ] **Step 2: Run the test and verify red**

Run:

```bash
pnpm exec vitest run packages/qizhi-react/src/form/formBulkEditCore.test.ts
```

Expected: FAIL because the core module does not exist.

- [ ] **Step 3: Implement deterministic equality and snapshots**

Use this internal shape:

```ts
export interface BulkEditSnapshot<TRecord, TKey extends FormBulkEditKey> {
  records: readonly TRecord[];
  rowKeys: readonly TKey[];
  fields: readonly {
    name: readonly FormNameSegment[];
    encodedName: string;
    mixed: boolean;
    initialValue: unknown;
  }[];
}
```

Default equality must explicitly support primitives, `NaN`, `Date`, plain objects and arrays; ignore plain-object key insertion order; preserve sparse-array positions; and detect cycles with paired-object tracking. A cycle throws `Form.useBulkEdit 默认比较器不支持循环引用，请提供 isEqual。`.

`createBulkEditSnapshot` normalizes paths, rejects zero/duplicate/overlapping fields, resolves each row key once, requires string/number unique keys, reads through the custom getter or `getValueAtPath`, and computes common versus mixed values. Empty-record fields are non-mixed with `undefined`.

- [ ] **Step 4: Add equality and snapshot cases**

Assert mixed department, common status, equal Dates, reordered object keys, nested arrays, `NaN`, sparse versus explicit-`undefined` arrays, custom equality, and `["profile", "remark"]` nested access. Use:

```ts
expect(snapshot.fields).toMatchObject([
  { name: ["department"], mixed: true, initialValue: undefined },
  { name: ["status"], mixed: false, initialValue: "enabled" },
]);
```

- [ ] **Step 5: Implement transitions and patch creation**

Represent modes as `ReadonlyMap<string, FormBulkEditMode>`. `buildBulkEditPatch` uses `setValueAtPath` for `set`, adds normalized paths for `clear`, and omits `keep`. Add:

```ts
export const createBulkEditBlockedError = (code: FormBulkEditBlockedCode): FormBulkEditBlockedError =>
  Object.assign(new Error(messageByCode[code]), {
    name: "FormBulkEditBlockedError",
    code,
  });
```

No targets throws `no-targets`; no changed modes throws `no-changes`.

- [ ] **Step 6: Implement strict result classification**

Allow multiple failure entries for one key. Require the unique failure-key set plus unique successful keys to equal current targets. Reject duplicate successes, success/failure overlap, unknown/omitted keys, empty messages, and failure fields outside declared fields.

- [ ] **Step 7: Run focused tests and typecheck**

```bash
pnpm exec vitest run packages/qizhi-react/src/form/formBulkEditCore.test.ts
pnpm --filter @wangxiaojinger/qizhi-react typecheck
```

Expected: PASS.

- [ ] **Step 8: Review and commit only Task 1 hunks**

Run `git diff --check`. Stage new files normally and stage only Bulk Edit hunks from dirty `Form.types.ts` through an index-only patch. Inspect `git diff --cached --name-only` and `git diff --cached`, then commit:

```bash
git commit -m "feat(form): add bulk edit model"
```

---

### Task 2: Add the React hook and stable field lifecycle

**Files:**
- Create: `packages/qizhi-react/src/form/formBulkEdit.ts`
- Create: `packages/qizhi-react/src/form/FormBulkEdit.test.tsx`
- Modify: `packages/qizhi-react/src/form/Form.types.ts`

**Interfaces:**
- Consumes: Task 1 helpers, `getFormStore(form)`, `subscribePath`, `setFieldValue`, and `markFieldsClean`.
- Produces: `useBulkEdit<TRecord, TKey>(options): FormBulkEditController<TKey>`.

- [ ] **Step 1: Add the controller and failing initialization test**

Add:

```ts
export interface FormBulkEditController<TKey extends FormBulkEditKey> {
  getFieldState: (name: FormNamePath) => FormBulkEditFieldState;
  getFieldFailures: (name: FormNamePath) => readonly FormBulkEditFailure<TKey>[];
  clearField: (name: FormNamePath) => void;
  keepField: (name: FormNamePath) => void;
  validate: () => Promise<FormBulkEditPatch<TKey>>;
  applyResult: (result: FormBulkEditResult<TKey>) => void;
  rebase: () => void;
  reset: () => void;
  status: FormBulkEditStatus;
  failures: readonly FormBulkEditFailure<TKey>[];
  succeededKeys: readonly TKey[];
  remainingKeys: readonly TKey[];
  hasChanges: boolean;
}
```

Render two members. Assert mixed department, common status value, both modes `keep`, false `hasChanges`, and no initialization `onValuesChange`.

- [ ] **Step 2: Run the hook test and verify red**

```bash
pnpm exec vitest run packages/qizhi-react/src/form/FormBulkEdit.test.tsx
```

Expected: FAIL because `useBulkEdit` does not exist.

- [ ] **Step 3: Implement guarded initialization and subscriptions**

Require a valid Form store. Keep accepted/latest semantic snapshots in refs. Guard internal writes while setting common values or clearing mixed values, then call `markFieldsClean(fields)`. Subscribe by normalized encoded path.

On a user change: common value equal to initial becomes `keep`; a different common value becomes `set`; any explicit mixed-field input becomes `set`; matching business failures clear. Internal initialization, `keepField`, `reset`, and `rebase` writes never become `set`.

- [ ] **Step 4: Add and pass transition tests**

Test control input, common-value restoration, mixed editing, `clearField`, `keepField`, full reset, nested paths and failure clearing. `clearField` writes `undefined` and mode `clear`; `keepField` restores the common value or mixed empty presentation.

- [ ] **Step 5: Pin semantically stable rerenders**

Rerender with newly allocated but semantically equal records, fields and callbacks. After a user edit, assert mode stays `set`, input is preserved, status remains `ready`, and no update-depth error appears.

- [ ] **Step 6: Implement source protection and rebase**

A semantic source change auto-initializes only without edits. With edits it sets `sourceChanged` without overwriting values. `rebase()` accepts latest data and discards edits; `reset()` restores the accepted snapshot. After partial success, monitor only `remainingKeys`; acknowledged successes may refresh or disappear without blocking retry.

- [ ] **Step 7: Run focused regressions**

```bash
pnpm exec vitest run packages/qizhi-react/src/form/FormBulkEdit.test.tsx packages/qizhi-react/src/form/Form.test.tsx packages/qizhi-react/src/form/formStore.test.ts
```

Expected: PASS.

- [ ] **Step 8: Precisely stage and commit**

Inspect cached hunks, then:

```bash
git commit -m "feat(form): add bulk edit lifecycle"
```

---

### Task 3: Integrate selective validation and partial recovery

**Files:**
- Modify: `packages/qizhi-react/src/form/formBulkEdit.ts`
- Modify: `packages/qizhi-react/src/form/formBulkEditCore.ts`
- Modify: `packages/qizhi-react/src/form/FormBulkEdit.test.tsx`

**Interfaces:**
- Consumes: `FormInstance.validateFields(names)`, Task 1 validators and Task 2 state.
- Produces: complete `validate()` and `applyResult()`.

- [ ] **Step 1: Write failing selective-validation tests**

Register required department/status/remark rules. Assert untouched mixed required department is skipped, only edited status validates, clearing required remark fails with existing `errorFields`, and blocked states return exact codes `no-changes`, `no-targets`, and `source-changed`.

- [ ] **Step 2: Run the focused test and verify red**

```bash
pnpm exec vitest run packages/qizhi-react/src/form/FormBulkEdit.test.tsx -t "validates only bulk edits"
```

Expected: FAIL on missing validation behavior.

- [ ] **Step 3: Implement request-versioned validation**

Capture validation request id, accepted snapshot id, modes and remaining keys before awaiting `validateFields(changedNames)`. After await, cancel if a newer validation started, source changed, modes changed, or remaining keys changed. Only then build the patch. Preserve existing field failures and `FormValidationException`; only preconditions create Bulk Edit blocked errors.

- [ ] **Step 4: Test and implement partial success**

Use three records, one success, and two failures with two field errors for one key. Assert success/remaining ordering, field failure lookup, and a retry patch containing only failures. Validate the entire result before mutation. Keep modes and values for failures. On a full successful retry, clear failures and set `complete`.

- [ ] **Step 5: Add malformed-result and async-race tests**

Cover duplicate success, unknown key, omission, overlap, empty message, undeclared field, multiple valid failures for one key, and atomic rejection. Start deferred validation, change records or start a newer validation, resolve the old promise, and assert no stale patch returns.

- [ ] **Step 6: Run all Form tests and typecheck**

```bash
pnpm exec vitest run packages/qizhi-react/src/form
pnpm --filter @wangxiaojinger/qizhi-react typecheck
```

Expected: PASS.

- [ ] **Step 7: Precisely stage and commit**

```bash
git commit -m "feat(form): validate and reconcile bulk edits"
```

---

### Task 4: Publish the namespace and package contract

**Files:**
- Modify: `packages/qizhi-react/src/form/Form.tsx`
- Modify: `packages/qizhi-react/src/form/Form.types.ts`
- Modify: `packages/qizhi-react/src/form/Form.types.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Consumes: `useBulkEdit` and all new public types.
- Produces: `Form.useBulkEdit` and root-package exports.

- [ ] **Step 1: Write the failing type test**

Add:

```tsx
function BulkEditState() {
  const [form] = Form.useForm();
  const bulk = Form.useBulkEdit({
    form,
    records: [{ id: "1", department: "研发部" }],
    getRowKey: (record) => record.id,
    fields: ["department", ["profile", "remark"]],
  });
  expectTypeOf(bulk.validate()).toEqualTypeOf<Promise<FormBulkEditPatch<string>>>();
  expectTypeOf(bulk.status).toEqualTypeOf<FormBulkEditStatus>();
  return <Form form={form} />;
}
```

Import every new public type from the root barrel so missing exports fail.

- [ ] **Step 2: Run the type test and verify red**

```bash
pnpm exec vitest run packages/qizhi-react/src/form/Form.types.test.tsx
```

Expected: FAIL because FormComponent/root exports are absent.

- [ ] **Step 3: Attach and export**

Import `useBulkEdit` into `Form.tsx`, add it to the existing `Object.assign`, and add:

```ts
useBulkEdit: <TRecord, TKey extends FormBulkEditKey>(
  options: FormBulkEditOptions<TRecord, TKey>,
) => FormBulkEditController<TKey>;
```

Export all eleven Bulk Edit types from `src/index.ts`.

- [ ] **Step 4: Verify types, exports and build**

```bash
pnpm exec vitest run packages/qizhi-react/src/form/Form.types.test.tsx packages/qizhi-react/src/form/FormBulkEdit.test.tsx
pnpm typecheck
pnpm test:exports
pnpm --filter @wangxiaojinger/qizhi-react build
```

Expected: PASS.

- [ ] **Step 5: Precisely stage and commit**

Inspect the index-only patch so no prior Steps/Draft/Advanced List hunks enter the commit:

```bash
git commit -m "feat(form): expose bulk edit API"
```

---

### Task 5: Add the accessible Demo and API documentation

**Files:**
- Create: `apps/qizhi-docs/src/form/demos/BulkEditDemo.tsx`
- Modify: `apps/qizhi-docs/src/form/formDocs.registry.ts`
- Modify: `apps/qizhi-docs/src/form/formApi.ts`
- Modify: `apps/qizhi-docs/src/form/FormApiTable.tsx`
- Modify: `apps/qizhi-docs/src/form/formDocs.test.tsx`
- Modify: `apps/qizhi-docs/src/form/formDocs.css`
- Regenerate: `apps/qizhi-docs/src/api/component-api.json`

**Interfaces:**
- Consumes: Task 4 public API.
- Produces: one same-source Demo/display/copy entry and a `Form.useBulkEdit API` table.

- [ ] **Step 1: Write failing docs tests**

Update Demo/form counts from 9 to 10 and assert final title `批量编辑`. Add `formBulkEditApi` expected names:

```ts
[
  "form", "records", "getRowKey", "fields", "getFieldValue", "isEqual",
  "getFieldState", "getFieldFailures", "clearField", "keepField", "validate",
  "applyResult", "rebase", "reset", "status", "failures", "succeededKeys",
  "remainingKeys", "hasChanges",
]
```

Assert `Form.useBulkEdit API` renders and registry source contains `Form.useBulkEdit`.

- [ ] **Step 2: Run docs tests and verify red**

```bash
pnpm exec vitest run apps/qizhi-docs/src/form/formDocs.test.tsx
```

Expected: FAIL because Demo/API metadata are absent.

- [ ] **Step 3: Implement the Demo**

Use three members with mixed department, common status and mixed nested remark. Render a selected-member summary; department/status/remark fields; visible mixed text connected through `aria-describedby`; explicit clear, undo, validate, simulated partial success, failure-only retry, simulated source change and rebase actions; an `aria-label="批量编辑补丁"` status region; and success/failure counts with per-record reasons.

The partial result must classify every target. The retry marks every remaining key successful. Visible copy labels both as simulations.

- [ ] **Step 4: Add behavioral/accessibility tests**

Drive role/name selectors. Assert described mixed state, patch contains only department plus cleared nested remark, untouched status is absent, partial counts and failure text appear, retry contains only failures, source change blocks without overwriting input, and rebase clears warning/recomputes state.

- [ ] **Step 5: Add API metadata and table**

Describe inputs, controller outputs, blocked codes and business-result responsibilities. Render after `Form.useDraft`, before `FormInstance`.

- [ ] **Step 6: Add scoped responsive CSS**

Use only `.form-docs-bulk-edit-*`. At `<= 720px`, stack controls/actions, wrap results, and apply `min-width: 0` plus `overflow-wrap: anywhere`. Do not change generic controls or existing Demo styles.

- [ ] **Step 7: Regenerate and validate**

```bash
pnpm api:build
pnpm api:validate
pnpm exec vitest run apps/qizhi-docs/src/form/formDocs.test.tsx
```

Expected: PASS and generated JSON contains the Bulk Edit API group.

- [ ] **Step 8: Precisely stage and commit**

Inspect generated/handwritten changes and stage only Bulk Edit hunks:

```bash
git commit -m "docs(form): demonstrate bulk editing"
```

---

### Task 6: Browser acceptance and complete regression verification

**Files:**
- Modify: `tests/e2e/form-react-island.spec.ts`
- Verify only: all Task 1–5 files.

**Interfaces:**
- Consumes: complete package/docs feature.
- Produces: browser evidence and final `candidate_pass` report.

- [ ] **Step 1: Extend E2E and verify red**

Update Form Demo/form counts from 9 to 10, assert Bulk Edit title/API, and drive:

```ts
const bulk = page.locator("#表单-批量编辑");
await expect(bulk.getByText("多个不同值").first()).toBeVisible();
await bulk.getByRole("combobox", { name: "统一部门" }).selectOption("product");
await bulk.getByRole("button", { name: "清空备注" }).click();
await bulk.getByRole("button", { name: "校验并生成补丁" }).click();
await expect(bulk.getByRole("status", { name: "批量编辑补丁" }))
  .not.toContainText("status");
```

Continue through partial success, retry, source-change block and rebase. Expect new assertions to fail before feature completion.

- [ ] **Step 2: Add geometry assertions**

For every Playwright project, assert Demo root, rows, actions, preview and failure list stay inside codebox bounds. At mobile width assert one action column and no document horizontal overflow.

- [ ] **Step 3: Run focused package/docs gates**

```bash
pnpm exec vitest run packages/qizhi-react/src/form apps/qizhi-docs/src/form/formDocs.test.tsx
pnpm typecheck
pnpm api:validate
```

Expected: PASS.

- [ ] **Step 4: Run full unit/build/export gates**

```bash
pnpm test
pnpm build
pnpm test:exports
```

Expected: PASS. Record exact test-file/test totals.

- [ ] **Step 5: Run three browser projects**

Use the current docs server, restarting only if stale:

```bash
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test tests/e2e/form-react-island.spec.ts
```

Expected: desktop 1440, narrow 1024 and mobile 375 all PASS with no console/page errors.

- [ ] **Step 6: Audit final scope**

```bash
git diff --check
git status --short
git log --oneline -8
```

Review each Bulk Edit commit with `git show --stat`. Confirm unrelated icon, Select and prior Form-phase changes were not included. Do not clean or revert unrelated files.

- [ ] **Step 7: Commit only E2E hunks**

```bash
git commit -m "test(form): cover bulk edit workflow"
```

- [ ] **Step 8: Report boundaries**

Report public APIs, files, hashes, red/green evidence, full totals, three Playwright results, preview URL, unrelated dirty files and warnings. Mark `candidate_pass`, independent verification `pending`; do not push or publish.
