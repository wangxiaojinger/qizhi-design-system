# QIZHI Form v3 Complex Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保持 Form v2 完全兼容的前提下，为 QIZHI Form 增加嵌套字段路径、动态字段列表、显式依赖校验、精确字段监听和条件字段保留策略。

**Architecture:** 将现有 `Form.tsx` 中的数据路径和状态仓库拆为独立模块：`formPath.ts` 只负责不可变嵌套读写与路径关系，`formStore.ts` 负责字段注册、错误、依赖、监听和列表状态，`Form.tsx` 只保留 React 组件、上下文与控件绑定。全部公共定位接口统一消费 `FormNamePath`，内部 Map 使用可逆路径编码，公共结果始终还原为真实嵌套对象或数组。

**Tech Stack:** React、TypeScript、Vitest、Testing Library、Vite、Playwright、CSS。

**Spec:** `docs/specs/qizhi-form-contract-v3.md`

## Global Constraints

- 保留字符串字段名兼容；`"user.email"` 必须继续被视为单个字段名。
- 嵌套字段只使用 `(string | number)[]` 数组路径。
- 不实现异步校验防抖、取消或竞态管理，不实现远程候选查询状态。
- 不修改现有 4 个 Form Demo 的顺序、文案、数据和初始状态；新 Demo 追加在其后。
- 不新增第三方依赖，不重写文档站壳层，不修改全局设计变量。
- 每个生产行为先写测试并确认红灯，再写最小实现。
- 交付结论最多为 `candidate_pass`；独立最终验证保持 `pending`。

## Review Focus

- 字符串 `"0"` 与数字 `0` 必须编码为不同路径，避免对象键和数组索引串线；Task 1 添加路径编码测试。
- `setFieldsValue` 合并嵌套数据时不得覆盖未传入的兄弟字段；Task 2 添加局部合并测试。
- 动态列表删除或移动后，字段错误与稳定 key 必须随条目迁移；Task 4 添加列表状态迁移测试。
- `preserve={false}` 卸载必须清理字段及后代状态，但不得伪造用户变化回调；Task 3 添加生命周期测试。
- `useWatch` 监听父路径时响应后代变化，监听后代时忽略无关兄弟变化；Task 3 添加渲染次数测试。

---

### Task 1: 字段路径模型与公共类型

**Files:**
- Create: `packages/qizhi-react/src/form/formPath.ts`
- Create: `packages/qizhi-react/src/form/formPath.test.ts`
- Modify: `packages/qizhi-react/src/form/Form.types.ts`
- Modify: `packages/qizhi-react/src/form/Form.types.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `FormNameSegment`, `FormNamePath`, `FormListField`, `FormListOperations`, `normalizeNamePath`, `encodeNamePath`, `getValueAtPath`, `setValueAtPath`, `unsetValueAtPath`, `buildValueAtPath`, `isSameOrAncestorPath`。
- Consumes: 现有 `FormValues`, `FormInstance`, `FormErrorField`。

- [ ] **Step 1: 写路径工具失败测试**

在 `formPath.test.ts` 写入真实输入输出测试：

```ts
expect(normalizeNamePath("user.email")).toEqual(["user.email"]);
expect(encodeNamePath(["items", 0])).not.toBe(encodeNamePath(["items", "0"]));
expect(getValueAtPath({ user: { email: "a@qizhi.cn" } }, ["user", "email"])).toBe("a@qizhi.cn");
expect(setValueAtPath({ user: { name: "Iris" } }, ["user", "email"], "a@qizhi.cn"))
  .toEqual({ user: { name: "Iris", email: "a@qizhi.cn" } });
expect(unsetValueAtPath({ items: [{ name: "A" }, { name: "B" }] }, ["items", 0]))
  .toEqual({ items: [{ name: "B" }] });
expect(buildValueAtPath(["members", 1, "name"], "B"))
  .toEqual({ members: [undefined, { name: "B" }] });
```

- [ ] **Step 2: 运行路径测试并确认红灯**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formPath.test.ts`

Expected: FAIL，原因是 `formPath` 模块尚不存在。

- [ ] **Step 3: 实现最小不可变路径工具**

`normalizeNamePath` 对字符串返回单段数组；`encodeNamePath` 对每段记录类型与长度，禁止简单 `join('.')`；读写函数逐段克隆对象或数组，不能修改调用方输入。`unsetValueAtPath` 删除数组数字索引时使用 `splice` 语义，删除对象键时使用对象键删除语义。

- [ ] **Step 4: 扩展公共类型和实例方法签名**

把字段定位参数改为：

```ts
export type FormNameSegment = string | number;
export type FormNamePath = string | readonly FormNameSegment[];

export interface FormErrorField {
  name: FormNamePath;
  errors: string[];
}
```

同步更新 `FormInstance`、`FormItemProps.name`、`FormItemProps.dependencies`、`FormItemProps.preserve`、`FormProps.preserve`，新增 `FormListProps`、`FormListField`、`FormListOperations` 和 `FormComponent.List/useWatch` 类型。根入口导出全部新增公共类型。

- [ ] **Step 5: 扩展类型测试并确认绿灯**

类型测试至少编译以下调用：

```tsx
<Form preserve={false}>
  <Form.Item name={["user", "email"]} dependencies={[["user", "type"]]} preserve>
    <input />
  </Form.Item>
  <Form.List name="members">{(fields, operations) => fields.map((field) => field.key)}</Form.List>
</Form>
```

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formPath.test.ts packages/qizhi-react/src/form/Form.types.test.tsx`

Expected: PASS。

- [ ] **Step 6: 提交路径基础**

```bash
git add packages/qizhi-react/src/form/formPath.ts packages/qizhi-react/src/form/formPath.test.ts packages/qizhi-react/src/form/Form.types.ts packages/qizhi-react/src/form/Form.types.test.tsx packages/qizhi-react/src/index.ts
git commit -m "feat(form): add nested field path contract"
```

### Task 2: 嵌套表单仓库与实例方法

**Files:**
- Create: `packages/qizhi-react/src/form/formStore.ts`
- Create: `packages/qizhi-react/src/form/formStore.test.ts`
- Modify: `packages/qizhi-react/src/form/Form.tsx`
- Modify: `packages/qizhi-react/src/form/Form.test.tsx`

**Interfaces:**
- Consumes: Task 1 的路径工具和 `FormNamePath`。
- Produces: `createFormStore`, `getFormStore`, `FormStore`，以及支持嵌套路径的全部 Form v2 实例方法。

- [ ] **Step 1: 写仓库失败测试**

测试必须覆盖：

```ts
store.initialize({ user: { name: "Iris", email: "old@qizhi.cn" } });
store.instance.setFieldValue(["user", "email"], "new@qizhi.cn");
expect(store.instance.getFieldValue(["user", "email"])).toBe("new@qizhi.cn");
expect(store.instance.getFieldsValue()).toEqual({
  user: { name: "Iris", email: "new@qizhi.cn" },
});
```

另测 `setFieldsValue({ user: { email: "new@qizhi.cn" } })` 保留 `user.name`，以及 `setFieldErrors(["members", 1, "name"], ...)` 可读取同一路径错误。

- [ ] **Step 2: 运行仓库测试并确认红灯**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formStore.test.ts`

Expected: FAIL，原因是独立仓库模块不存在。

- [ ] **Step 3: 抽取并升级现有仓库**

把现有 `createFormStore`、实例映射和字段状态从 `Form.tsx` 移到 `formStore.ts`。所有 Map 以 `encodeNamePath` 为键，同时保存规范化路径。`getRegisteredValues` 使用 `buildValueAtPath` 重建嵌套结果；校验器第二参数使用完整嵌套值。

- [ ] **Step 4: 实现嵌套合并和状态清理**

`setFieldsValue` 递归枚举传入数据的叶子路径，逐路径写入并清理对应错误；不得浅覆盖父对象。字段用户变化生成嵌套 `changedValues`，而 `allValues` 只包含注册或保留路径。

- [ ] **Step 5: 将 Form React 层接回新仓库**

`Form.tsx` 使用 `getFormStore` 取得仓库；`Form.Item` 把 `FormNamePath` 传给注册、取值、失焦校验、错误关联和节点定位。DOM 标识继续使用 React `useId`，不拼接字段路径原文。

- [ ] **Step 6: 运行嵌套集成测试**

在 `Form.test.tsx` 增加真实输入与提交测试，断言：

```ts
expect(onFinish).toHaveBeenCalledWith({ user: { email: "a@qizhi.cn" } });
expect(onFinishFailed).toHaveBeenCalledWith({
  values: { user: { email: "" } },
  errorFields: [{ name: ["user", "email"], errors: ["请输入邮箱"] }],
});
```

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formPath.test.ts packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.test.tsx`

Expected: PASS，并且原有简单字符串字段测试继续通过。

- [ ] **Step 7: 提交嵌套仓库**

```bash
git add packages/qizhi-react/src/form/formStore.ts packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.tsx packages/qizhi-react/src/form/Form.test.tsx
git commit -m "feat(form): support nested field values"
```

### Task 3: 条件字段、依赖校验与精确监听

**Files:**
- Modify: `packages/qizhi-react/src/form/formStore.ts`
- Modify: `packages/qizhi-react/src/form/formStore.test.ts`
- Modify: `packages/qizhi-react/src/form/Form.tsx`
- Modify: `packages/qizhi-react/src/form/Form.test.tsx`

**Interfaces:**
- Consumes: Task 2 的嵌套仓库。
- Produces: `registerField(name, config)` 的保留与依赖语义、按路径订阅接口、`Form.useWatch`。

- [ ] **Step 1: 写 preserve 失败测试**

渲染可切换字段并依次断言：默认卸载后 `getFieldValue` 仍返回原值；字段级 `preserve={false}` 卸载后返回 `undefined`；表单级 `preserve={false}` 可被字段级 `preserve` 覆盖；清理不触发 `onValuesChange`。

- [ ] **Step 2: 写 dependencies 失败测试**

创建 `password` 与 `confirmPassword` 字段，确认密码规则读取完整值。修改 `password` 后只重新校验 `confirmPassword`，无关字段校验器调用次数不变；通过 `setFieldValue` 修改密码也执行相同行为。

- [ ] **Step 3: 写 useWatch 失败测试**

测试初始值、用户变化、程序化赋值和重置。用渲染计数断言监听 `["user"]` 会响应 `["user", "email"]`，监听 `["user", "email"]` 不响应 `["user", "name"]`。上下文外无 form 调用必须抛出 `Form.useWatch 必须在 Form 内使用或传入 form 实例。`。

- [ ] **Step 4: 运行定向测试并确认红灯**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.test.tsx`

Expected: FAIL，分别指向保留清理、依赖重新校验和 `useWatch` 缺失。

- [ ] **Step 5: 实现注册配置和卸载清理**

字段注册配置保存 `rules`、`validateTrigger`、`dependencies`、`preserve`。卸载时总是删除节点和当前注册；最终保留值取字段设置或 Form 默认值。关闭保留时递归清理值、错误、错误来源和校验状态，并通知路径订阅者，但不调用 `onValuesChange`。

- [ ] **Step 6: 实现依赖索引和精确订阅**

仓库维护“源路径键 → 依赖字段键”反向索引。任一写入结束后，只重新校验命中的依赖字段。订阅回调保存规范化监听路径与上次值，通知前用 `Object.is` 判断目标路径值是否实际改变。

- [ ] **Step 7: 实现 Form.useWatch**

Hook 使用显式 form 或 Form 上下文取得仓库，通过 `useSyncExternalStore` 订阅路径快照。不要让普通 `Form.Item` 因无关字段变化重新渲染。

- [ ] **Step 8: 运行测试并提交**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.test.tsx packages/qizhi-react/src/form/Form.types.test.tsx`

Expected: PASS。

```bash
git add packages/qizhi-react/src/form/formStore.ts packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.tsx packages/qizhi-react/src/form/Form.test.tsx
git commit -m "feat(form): add dependencies watch and preserve"
```

### Task 4: Form.List 动态字段列表

**Files:**
- Create: `packages/qizhi-react/src/form/FormList.test.tsx`
- Modify: `packages/qizhi-react/src/form/formStore.ts`
- Modify: `packages/qizhi-react/src/form/formStore.test.ts`
- Modify: `packages/qizhi-react/src/form/Form.tsx`

**Interfaces:**
- Consumes: Task 3 的路径订阅和嵌套状态迁移接口。
- Produces: `Form.List`、`add`、`remove`、`move` 以及稳定 `FormListField.key`。

- [ ] **Step 1: 写 Form.List 渲染与 add 失败测试**

以 `initialValues={{ members: [{ name: "A" }] }}` 渲染列表，断言一个字段；调用 `add({ name: "B" })` 后断言两个字段、一次 `onValuesChange`，提交结果为 `{ members: [{ name: "A" }, { name: "B" }] }`。

- [ ] **Step 2: 写 remove 与 move 失败测试**

给三项分别设置后端错误，记录三个稳定 key。删除索引 1 后，原索引 2 的值、错误和 key 移至索引 1；移动 1 到 0 后同一条目的值、错误和 key 一起移动。重复、负数和越界索引不得改变结果。

- [ ] **Step 3: 运行 Form.List 测试并确认红灯**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/FormList.test.tsx packages/qizhi-react/src/form/formStore.test.ts`

Expected: FAIL，原因是 `Form.List` 和列表迁移操作不存在。

- [ ] **Step 4: 实现列表 key 生命周期**

仓库按列表路径维护与数组同长度的稳定 key 数组。初始化时为现有条目生成 key；`add` 插入新 key；`remove` 删除对应 key；`move` 同步移动 key。key 只作为 React 标识，不进入表单提交值。

- [ ] **Step 5: 实现列表状态迁移**

列表操作先生成旧索引到新索引的映射，再一次性迁移字段注册路径、错误、错误来源、校验状态、依赖索引和字段节点。迁移完成后统一通知一次，统一触发一次 `onValuesChange`，避免中间状态暴露。

- [ ] **Step 6: 实现 Form.List React 组件**

组件读取列表路径订阅，生成 `{ key, name }[]`，向 children 提供稳定 memo 化的 `add/remove/move`。`initialValue` 只在表单值路径为 `undefined` 时初始化。

- [ ] **Step 7: 运行 Form 全部定向测试并提交**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formPath.test.ts packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.test.tsx packages/qizhi-react/src/form/FormList.test.tsx packages/qizhi-react/src/form/Form.types.test.tsx`

Expected: PASS。

```bash
git add packages/qizhi-react/src/form/formStore.ts packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.tsx packages/qizhi-react/src/form/FormList.test.tsx
git commit -m "feat(form): add dynamic field lists"
```

### Task 5: 复杂表单联动 Demo 与 API 文档

**Files:**
- Create: `apps/qizhi-docs/src/form/demos/ComplexFieldsDemo.tsx`
- Modify: `apps/qizhi-docs/src/form/formDocs.registry.ts`
- Modify: `apps/qizhi-docs/src/form/formDocs.test.tsx`
- Modify: `apps/qizhi-docs/src/form/formApi.ts`
- Modify: `apps/qizhi-docs/src/form/FormApiTable.tsx`
- Modify: `apps/qizhi-docs/src/form/formDocs.css`
- Modify: `apps/qizhi-docs/src/api/component-api.json`
- Modify: `index.html`

**Interfaces:**
- Consumes: Tasks 1–4 的完整 Form v3 公共 API。
- Produces: 第 5 个同源 Demo、Form.List API 表和结构化 API 数据。

- [ ] **Step 1: 写文档失败测试**

把 Demo 顺序期望更新为：

```ts
["基础用法", "表单布局", "受控表单", "业务校验闭环", "复杂表单联动"]
```

新增真实交互断言：新增成员、删除成员、移动成员；密码依赖错误；切换服务类型后条件字段按 `preserve={false}` 清理；通过数组路径展示模拟后端错误。断言新 Demo 源码仍来自自身 TSX raw import。

- [ ] **Step 2: 运行文档测试并确认红灯**

Run: `pnpm exec vitest run apps/qizhi-docs/src/form/formDocs.test.tsx`

Expected: FAIL，原因是新 Demo 和 v3 API 元数据不存在。

- [ ] **Step 3: 实现单一同源 Demo**

Demo 使用现有 `Input`、`Select`、`Button`、`Form` 和已有正式图标。页面只增加契约要求的操作，不创造新的业务组件或视觉模式。新增、删除、上移、下移按钮必须有中文可访问名称。

- [ ] **Step 4: 更新 API 表和结构化数据**

`formApi` 新增 `preserve`；`formItemApi` 更新 `name` 类型并新增 `dependencies/preserve`；新增 `formListApi`；实例方法路径类型更新；`FormApiTable` 渲染 Form.List 表。运行 `pnpm api:build` 生成 `component-api.json`，不得手工编辑生成文件。

- [ ] **Step 5: 更新局部样式和更新日志**

只增加 `.form-docs-complex-*` 局部类，复用现有表单间距和按钮组件。按 `AGENTS.md` 在 2026-09-24 更新日志分组顶部追加一条“新增复杂表单结构与动态字段能力”，并增加当日更新计数。

- [ ] **Step 6: 运行文档测试、API 检查并提交**

Run: `pnpm exec vitest run apps/qizhi-docs/src/form/formDocs.test.tsx packages/qizhi-react/src/form/Form.test.tsx packages/qizhi-react/src/form/FormList.test.tsx`

Run: `pnpm api:validate`

Expected: 全部 PASS，API manifest current。

```bash
git add apps/qizhi-docs/src/form apps/qizhi-docs/src/api/component-api.json index.html
git commit -m "docs(form): add complex fields demo"
```

### Task 6: 全量验证与浏览器验收

**Files:**
- Modify: `tests/e2e/form-react-island.spec.ts`
- Create: `docs/verification/qizhi-form-v3-complex-fields.md`

**Interfaces:**
- Consumes: 完整 Form v3 实现和文档 Demo。
- Produces: 可重跑的自动化与真实浏览器验收证据。

- [ ] **Step 1: 扩展 E2E 失败用例**

增加“复杂表单联动”测试路径：嵌套字段输入、动态成员新增/删除/移动、依赖错误、条件字段清理、数组后端错误、有效提交。三个视口分别断言新 Demo `scrollWidth === clientWidth`，并检查控制台错误。

- [ ] **Step 2: 运行新增 E2E 并修正测试暴露的问题**

Run: `pnpm exec playwright test tests/e2e/form-react-island.spec.ts`

Expected: 1440、1024、375 三项 PASS。若失败，只修正本契约范围内问题，不扩大到无关组件。

- [ ] **Step 3: 执行最终常规检查**

Run:

```bash
node --check script.js
pnpm typecheck
pnpm test
pnpm build
pnpm api:validate
git diff --check
```

Expected: 全部退出码为 0；构建允许记录既有 chunk size 警告，但不得新增错误。

- [ ] **Step 4: 完成真实浏览器验收**

在 `http://127.0.0.1:5173/#component-form` 实际操作新 Demo 全链路；分别设置 1440×900、1024×900、375×812，检查页面与 Demo 无横向溢出、焦点可见、按钮可操作、错误提示与字段关联、控制台无新增错误。

- [ ] **Step 5: 写验收记录并提交**

记录实际测试数量、构建结果、三视口结果、已知警告和 `candidate_pass/pending` 边界。

```bash
git add tests/e2e/form-react-island.spec.ts docs/verification/qizhi-form-v3-complex-fields.md
git commit -m "test(form): verify v3 complex fields"
```
