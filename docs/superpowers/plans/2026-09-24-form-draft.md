# Form Draft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 QIZHI Form 增加与存储方式无关的企业级草稿编排能力，并先补齐动态列表恢复与可控步骤。

**Architecture:** `FormInstance` 仍是表单值的唯一权威；`Form.useDraft` 在独立模块中编排业务方传入的异步存储适配器，不绑定 HTTP、数据库或 `localStorage`。草稿恢复通过现有 Form 公共方法写回，步骤等非字段状态通过 metadata 回调恢复。

**Tech Stack:** React 19, TypeScript 7, Vitest, Testing Library, Playwright, Vite, pnpm.

**Spec:** `docs/specs/qizhi-form-draft-contract-v1.md`

## Global Constraints

- 不在 Form 核心中默认使用 `localStorage`；`storage` 必须由消费方显式传入。
- `selectValues` 必填；不默认保存整张表单。
- 不持久化校验错误、DOM、校验中或提交中状态。
- `setFieldsValue` 保持合并语义；数组在传入路径上作为完整值替换。
- `goTo()` 只校验当前步骤，不校验所有被跨过的步骤。
- 实现、类型、导出、API 表、Demo 源码、显示/复制代码、单测与 E2E 必须同步。
- 不修改 Advanced Form.List 或 Bulk Edit 能力。

## Review Focus

- 草稿中的空数组必须真正清空 Form.List，而不是无操作。
- 恢复数组长度变化时，Form.List 的稳定 key、值、错误路径不得错位。
- 草稿加载或保存重叠完成时，旧请求不得覆盖新状态。
- 版本不匹配或过期时，不得向 Form 写入任何值或 metadata。
- 冲突默认不覆盖远端；只有显式 `overwrite()` 才能带 `force=true` 保存。

---

### Task 1: 补齐数组写入与 Form.List 恢复语义

**Files:**
- Modify: `packages/qizhi-react/src/form/formStore.ts`
- Test: `packages/qizhi-react/src/form/formStore.test.ts`
- Test: `packages/qizhi-react/src/form/FormList.test.tsx`

**Interfaces:**
- Consumes: `FormInstance.setFieldsValue(values)`、`FormStore.initializeList(name)`、现有 list key 和路径迁移机制。
- Produces: 数组路径原子替换、Form.List key 数量同步，供 Task 3 的 `restore()` 调用。

- [ ] **Step 1: 写底层失败测试，固定空数组与数组整体替换**

```ts
it("setFieldsValue 把数组作为完整路径值替换", () => {
  const store = createFormStore();
  store.initialize({ team: { members: [{ name: "A" }, { name: "B" }] }, untouched: "keep" });
  store.initializeList(["team", "members"]);
  store.instance.setFieldsValue({ team: { members: [] } });
  expect(store.instance.getFieldValue(["team", "members"])).toEqual([]);
  expect(store.instance.getFieldValue("untouched")).toBe("keep");
  expect(store.getListKeys(["team", "members"])).toHaveLength(0);
});
```

- [ ] **Step 2: 运行底层测试并确认因空数组未写入而失败**

Run: `pnpm vitest run packages/qizhi-react/src/form/formStore.test.ts`
Expected: FAIL，`members` 仍为原数组或 list keys 仍为 2。

- [ ] **Step 3: 写 React 失败测试，覆盖 2→5、5→1 和嵌套列表**

```tsx
act(() => form?.setFieldsValue({ team: { members: [
  { name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }, { name: "E" },
] } }));
expect(screen.getAllByRole("textbox", { name: /恢复成员/ })).toHaveLength(5);
act(() => form?.setFieldsValue({ team: { members: [{ name: "Z" }] } }));
expect(screen.getAllByRole("textbox", { name: /恢复成员/ })).toHaveLength(1);
expect(screen.getByRole("textbox", { name: "恢复成员 1" })).toHaveValue("Z");
```

- [ ] **Step 4: 运行 Form.List 测试并确认条目数不同步的失败**

Run: `pnpm vitest run packages/qizhi-react/src/form/FormList.test.tsx`
Expected: FAIL，渲染条目数仍保持初始值。

- [ ] **Step 5: 实现数组原子写入和 list key 同步**

```ts
const valueEntries = (value: unknown, path: FormNameSegment[] = []): Array<[FormNameSegment[], unknown]> => {
  if (Array.isArray(value)) return [[path, value]];
  if (value && typeof value === "object") {
    const entries = Object.entries(value as FormValues);
    return entries.length ? entries.flatMap(([key, item]) => valueEntries(item, [...path, key])) : [[path, value]];
  }
  return [[path, value]];
};

const syncAffectedLists = (changedPath: FormNamePath) => {
  listPaths.forEach((listPath, listKeyValue) => {
    if (!isSameOrAncestorPath(changedPath, listPath) && !isSameOrAncestorPath(listPath, changedPath)) return;
    const listValue = getValueAtPath(values, listPath);
    lists.set(listKeyValue, Array.from({ length: Array.isArray(listValue) ? listValue.length : 0 }, nextListKey));
  });
};
```

Use `valueEntries` in `setFieldsValue`; after every changed path, call `syncAffectedLists(path)` before notification. When an array path is replaced, invalidate and clear descendant field errors whose indexes no longer exist, then allow mounted items to re-register against the new indexes.

- [ ] **Step 6: 验证数组恢复、dirty、依赖校验和既有移动语义**

Run: `pnpm vitest run packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/FormList.test.tsx packages/qizhi-react/src/form/Form.test.tsx`
Expected: PASS，且现有 remove/move 错误迁移测试不回归。

- [ ] **Step 7: 仅提交本任务文件**

```bash
git add packages/qizhi-react/src/form/formStore.ts packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/FormList.test.tsx
git commit -m "fix(form): support restoring list values"
```

### Task 2: 为 Form Steps 增加可控模式

**Files:**
- Modify: `packages/qizhi-react/src/form/Form.types.ts`
- Modify: `packages/qizhi-react/src/form/Form.tsx`
- Test: `packages/qizhi-react/src/form/FormSteps.test.tsx`
- Test: `packages/qizhi-react/src/form/Form.types.test.tsx`
- Modify: `docs/specs/qizhi-form-steps-contract-v1.md`

**Interfaces:**
- Consumes: `FormStepsOptions.form`、`steps`、`initialStep`、现有 `next/previous/goTo/submit`。
- Produces: `current?: number`、`onCurrentChange?: (current: number) => void`，供草稿 metadata 恢复步骤。

- [ ] **Step 1: 写可控步骤失败测试**

```tsx
it("受控模式以 current 为真实状态并只在导航成功后通知", async () => {
  const user = userEvent.setup();
  const onCurrentChange = vi.fn();
  function Example({ current }: { current: number }) {
    const [form] = Form.useForm();
    const wizard = Form.useSteps({ form, steps, current, onCurrentChange });
    return <Form form={form} initialValues={{ name: "ready" }}>
      <output aria-label="当前步骤">{wizard.current}</output>
      <Form.Item name="name" rules={[{ required: true }]}><input aria-label="名称" /></Form.Item>
      <button type="button" onClick={() => void wizard.next()}>下一步</button>
    </Form>;
  }
  const view = render(<Example current={1} />);
  await user.click(screen.getByRole("button", { name: "下一步" }));
  expect(onCurrentChange).toHaveBeenCalledWith(2);
  expect(screen.getByRole("status", { name: "当前步骤" })).toHaveTextContent("1");
  view.rerender(<Example current={2} />);
  expect(screen.getByRole("status", { name: "当前步骤" })).toHaveTextContent("2");
});
```

Add a second case: invalid current-step validation returns `false` and does not call `onCurrentChange`.

- [ ] **Step 2: 运行测试并确认类型或行为失败**

Run: `pnpm vitest run packages/qizhi-react/src/form/FormSteps.test.tsx packages/qizhi-react/src/form/Form.types.test.tsx`
Expected: FAIL because `current` and `onCurrentChange` are not public options.

- [ ] **Step 3: 实现受控/非受控状态分流**

```ts
export interface FormStepsOptions {
  form: FormInstance;
  steps: readonly FormStep[];
  initialStep?: number;
  current?: number;
  onCurrentChange?: (current: number) => void;
}
```

Inside `useSteps`, keep `internalCurrent`; derive `activeCurrent = current === undefined ? internalCurrent : safeStep(current)`. Route every successful transition through one `changeCurrent(next)` helper that mutates internal state only when uncontrolled and always invokes `onCurrentChange` after a real successful transition.

- [ ] **Step 4: 同步类型测试与 Steps 契约**

Add to `Form.types.test.tsx`:

```ts
Form.useSteps({ form, steps: [], current: 2, onCurrentChange: (next) => {
  expectTypeOf(next).toEqualTypeOf<number>();
} });
```

Document controlled authority, clamping and the unchanged `goTo()` validation rule in `qizhi-form-steps-contract-v1.md`.

- [ ] **Step 5: 运行 Steps 和 Form 回归**

Run: `pnpm vitest run packages/qizhi-react/src/form/FormSteps.test.tsx packages/qizhi-react/src/form/Form.types.test.tsx packages/qizhi-react/src/form/Form.test.tsx`
Expected: PASS.

- [ ] **Step 6: 仅提交本任务文件**

```bash
git add packages/qizhi-react/src/form/Form.types.ts packages/qizhi-react/src/form/Form.tsx packages/qizhi-react/src/form/FormSteps.test.tsx packages/qizhi-react/src/form/Form.types.test.tsx docs/specs/qizhi-form-steps-contract-v1.md
git commit -m "feat(form): support controlled form steps"
```

### Task 3: 实现存储无关的 Form.useDraft

**Files:**
- Create: `packages/qizhi-react/src/form/formDraft.ts`
- Create: `packages/qizhi-react/src/form/FormDraft.test.tsx`
- Modify: `packages/qizhi-react/src/form/Form.types.ts`
- Modify: `packages/qizhi-react/src/form/Form.tsx`
- Modify: `packages/qizhi-react/src/index.ts`
- Test: `packages/qizhi-react/src/form/Form.types.test.tsx`

**Interfaces:**
- Consumes: fixed `setFieldsValue`、`markFieldsClean`、`getFieldsValue`、`getFormStore(form).subscribe`。
- Produces: `FormDraftRecord`、`FormDraftStorage`、`FormDraftOptions`、`FormDraftController`、`Form.useDraft(options)`.

- [ ] **Step 1: 先写公共类型失败测试**

```ts
const storage: FormDraftStorage = {
  load: async () => null,
  save: async (input) => ({ status: "saved", record: {
    key: input.key,
    version: input.version,
    values: input.values,
    metadata: input.metadata,
    revision: "r1",
    updatedAt: "2026-09-24T00:00:00.000Z",
  } }),
  remove: async () => undefined,
};
const draft = Form.useDraft({
  form,
  draftKey: "service:create:user-1",
  version: "v1",
  storage,
  selectValues: (values) => ({ name: values.name }),
});
expectTypeOf(draft.save()).toEqualTypeOf<Promise<boolean>>();
```

- [ ] **Step 2: 运行类型测试并确认缺少 API**

Run: `pnpm vitest run packages/qizhi-react/src/form/Form.types.test.tsx`
Expected: FAIL because draft types and `Form.useDraft` do not exist.

- [ ] **Step 3: 实现类型和 Hook 骨架**

Define the exact interfaces from `docs/specs/qizhi-form-draft-contract-v1.md`. Implement `useDraft(options)` in `formDraft.ts` with React state/refs and monotonically increasing request IDs. Export it through `Form` and export all draft types from `packages/qizhi-react/src/index.ts`.

- [ ] **Step 4: 写 load/restore/remove 失败测试**

```tsx
await act(async () => {
  await result.current.load();
});
expect(result.current.status).toBe("ready");
act(() => expect(result.current.restore()).toBe(true));
expect(form.getFieldsValue()).toEqual({ name: "draft-name", members: [] });
expect(form.isFieldsDirty()).toBe(false);
expect(onRestoreMetadata).toHaveBeenCalledWith({ stepKey: "contact" });
await act(async () => {
  await result.current.remove();
});
expect(storage.remove).toHaveBeenCalledWith("service:create:user-1", "r1");
```

Use a real `Form` and real `FormInstance`; only the external storage boundary may be a deterministic fake.

- [ ] **Step 5: 实现 load/restore/remove，并保护版本与过期边界**

`load()` stores the latest record only when its request ID is current. Compare `record.version` to `options.version`; parse `expiresAt` and compare with `Date.now()`. `restore()` returns `false` unless status is `ready` or a remote conflict was explicitly selected. On successful restore call `form.setFieldsValue(record.values)`, `form.markFieldsClean()`, then `onRestoreMetadata?.(record.metadata)`.

- [ ] **Step 6: 写 save/conflict/overwrite 失败测试**

Cover all literal outcomes:

```ts
expect(storage.save).toHaveBeenCalledWith({
  key: "service:create:user-1",
  version: "v1",
  values: { name: "safe-name" },
  metadata: { stepKey: "contact" },
  expectedRevision: "r1",
  force: undefined,
});
expect(result.current.status).toBe("conflict");
expect(result.current.conflict?.revision).toBe("r2");
await act(() => result.current.overwrite());
expect(storage.save).toHaveBeenLastCalledWith(expect.objectContaining({ force: true }));
```

Also assert that `selectValues` excludes a password fixture and that a failed adapter call preserves the last successful record.

- [ ] **Step 7: 实现 save/useRemote/overwrite 和重叠请求保护**

Use the last successful `record.revision` as `expectedRevision`. A `conflict` result sets `status="conflict"` without mutating Form values. `useRemote()` writes the remote record and clears conflict. `overwrite()` sends `force: true`. Every async operation captures a sequence number; only the latest sequence may set controller state.

- [ ] **Step 8: 写并实现可选防抖自动保存**

Test with fake timers: three field changes inside `debounceMs=1000` produce one storage save containing only the last selected values. `autoSave=false` produces zero implicit calls. Subscribe to the internal Form store in an effect and clear the timer on unmount, draft-key change and manual remove.

- [ ] **Step 9: 运行 Draft 、Form 和类型回归**

Run: `pnpm vitest run packages/qizhi-react/src/form/FormDraft.test.tsx packages/qizhi-react/src/form/Form.types.test.tsx packages/qizhi-react/src/form/Form.test.tsx packages/qizhi-react/src/form/FormList.test.tsx packages/qizhi-react/src/form/FormSteps.test.tsx`
Expected: PASS with no React act warnings or unhandled rejections.

- [ ] **Step 10: 仅提交本任务文件**

```bash
git add packages/qizhi-react/src/form/formDraft.ts packages/qizhi-react/src/form/FormDraft.test.tsx packages/qizhi-react/src/form/Form.types.ts packages/qizhi-react/src/form/Form.tsx packages/qizhi-react/src/form/Form.types.test.tsx packages/qizhi-react/src/index.ts
git commit -m "feat(form): add storage-agnostic draft controller"
```

### Task 4: 同步 API 文档和表单草稿 Demo

**Files:**
- Create: `apps/qizhi-docs/src/form/demos/DraftDemo.tsx`
- Modify: `apps/qizhi-docs/src/form/formDocs.registry.ts`
- Modify: `apps/qizhi-docs/src/form/formApi.ts`
- Modify: `apps/qizhi-docs/src/form/FormApiTable.tsx`
- Modify: `apps/qizhi-docs/src/form/formDocs.css`
- Modify: `apps/qizhi-docs/src/form/formDocs.test.tsx`
- Modify: `apps/qizhi-docs/src/api/component-api.json`
- Modify: `scripts/build-component-api.mjs`
- Modify: `tests/e2e/form-react-island.spec.ts`

**Interfaces:**
- Consumes: `Form.useDraft`、draft public types and controlled `Form.useSteps`.
- Produces: same-source Draft Demo, `Form.useDraft API` table, three-viewport acceptance evidence.

- [ ] **Step 1: 写文档注册和 API 元数据失败测试**

Update literal expectations to append `"表单草稿"` after `"远程联动与未保存修改"`; assert eight code/copy actions, a `Form.useDraft API` table, and API option names:

```ts
expect(formDraftApi.map((item) => item.name)).toEqual([
  "form", "draftKey", "version", "storage", "selectValues",
  "getMetadata", "onRestoreMetadata", "autoSave",
]);
```

- [ ] **Step 2: 运行文档测试并确认 Draft Demo/API 缺失**

Run: `pnpm vitest run apps/qizhi-docs/src/form/formDocs.test.tsx`
Expected: FAIL because the eighth Demo and API table do not exist.

- [ ] **Step 3: 实现单源 Draft Demo**

`DraftDemo.tsx` must contain an in-memory async adapter with deterministic revision increments and explicit buttons for:

- 保存草稿；
- 检测草稿；
- 恢复草稿；
- 清除草稿；
- 模拟过期草稿；
- 模拟版本不匹配；
- 模拟远端冲突，然后选择远端版本或显式覆盖。

The sample form may contain `serviceName`, `description`, and a deliberately present `password` input; `selectValues` must persist only `serviceName` and `description`, and the rendered result must prove that password was not stored.

- [ ] **Step 4: 同步 registry、API table、生成清单和局部样式**

Append the Demo without reordering the first seven entries. Add `formDraftApi` and a `Form.useDraft` heading. Run `pnpm api:build` rather than editing generated JSON by hand after generator support is added.

- [ ] **Step 5: 扩展 E2E 的真实状态链**

In `form-react-island.spec.ts`, drive this sequence in every viewport:

1. Fill safe fields and password.
2. Save and assert `saved` plus revision text.
3. Change all fields; load and restore; assert safe fields recovered but password not recovered.
4. Load version-mismatched and expired records; assert Form values unchanged.
5. Trigger conflict; assert no automatic overwrite; choose remote and verify values.
6. Trigger another conflict; explicitly overwrite and verify new revision.
7. Assert no horizontal overflow and no console/page errors.

- [ ] **Step 6: 运行文档单测、API 校验和三视口 E2E**

Run: `pnpm vitest run apps/qizhi-docs/src/form/formDocs.test.tsx`
Expected: PASS.

Run: `pnpm api:validate`
Expected: PASS with current generated API manifest.

Run: `pnpm exec playwright test tests/e2e/form-react-island.spec.ts`
Expected: 3 passed for desktop-1440, narrow-1024 and mobile-375.

- [ ] **Step 7: 仅提交本任务文件**

```bash
git add apps/qizhi-docs/src/form/demos/DraftDemo.tsx apps/qizhi-docs/src/form/formDocs.registry.ts apps/qizhi-docs/src/form/formApi.ts apps/qizhi-docs/src/form/FormApiTable.tsx apps/qizhi-docs/src/form/formDocs.css apps/qizhi-docs/src/form/formDocs.test.tsx apps/qizhi-docs/src/api/component-api.json scripts/build-component-api.mjs tests/e2e/form-react-island.spec.ts
git commit -m "docs(form): demonstrate enterprise draft workflow"
```

### Task 5: 全量验证与契约收口

**Files:**
- Modify: `docs/specs/qizhi-form-draft-contract-v1.md`
- Verify only: all files changed by Tasks 1–4

**Interfaces:**
- Consumes: all public behavior and documentation from Tasks 1–4.
- Produces: final `candidate_pass` evidence; no new runtime API.

- [ ] **Step 1: 逐条对照契约和运行时实现**

Confirm every option, controller field, storage result and state literal in `qizhi-form-draft-contract-v1.md` exists in types, behavior tests, API metadata and Demo. If implementation intentionally differs, stop and request contract approval instead of silently editing the contract.

- [ ] **Step 2: 运行全量验证**

Run: `pnpm verify`
Expected: API validation, tokens, typecheck, all unit tests and all builds exit 0.

Run: `pnpm exec playwright test tests/e2e/form-react-island.spec.ts`
Expected: 3 passed.

Run: `git diff --check`
Expected: no output and exit 0.

- [ ] **Step 3: 复查工作区边界**

Run: `git status --short`
Expected: identify the exact Form Draft files separately from pre-existing unrelated changes; do not stage or revert unrelated files.

- [ ] **Step 4: 更新契约状态并提交**

Change the spec header only after all commands pass:

```md
状态：已确认并实施（candidate_pass，独立最终验证 pending）
```

```bash
git add docs/specs/qizhi-form-draft-contract-v1.md
git commit -m "docs(form): record draft candidate verification"
```

- [ ] **Step 5: 交付报告**

Report: exact files changed, red/green evidence, `pnpm verify` totals, Playwright viewport totals, remaining independent acceptance boundary, and any build warnings that did not fail the build.
