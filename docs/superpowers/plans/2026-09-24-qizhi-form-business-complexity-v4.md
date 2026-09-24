# QIZHI Form 真实业务复杂度 v4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 补齐 Form 异步校验一致性、错误分层、未保存修改判断和 AutoComplete 远程查询四态，并完成三类录入控件联动与多层重置验收。

**Architecture:** FormStore 继续作为唯一表单状态源，在字段级增加校验版本和干净基线；Form React 层只暴露 Hook 与异常回调。AutoComplete 只消费外部数据和状态，不直接发请求。业务 Demo 负责模拟请求、重试与页面离开提醒。

**Tech Stack:** React、TypeScript、Vitest、Testing Library、Vite、Playwright、CSS。

**Spec:** `docs/specs/qizhi-form-business-complexity-v4.md`

## Global Constraints

- 保持 Form v2/v3、AutoComplete v1 与 Form.List 兼容。
- 普通 `Error` 继续作为字段错误；网络异常必须使用结构化 `FormRuleFailure`。
- 组件不得直接发起网络请求或引入请求依赖。
- 不实现多步骤、草稿持久化、批量编辑或新的动态列表能力。
- 新增 Demo 的预览、展示代码和复制代码必须同源。
- 保留工作区既有未提交改动，只提交本计划明确列出的文件。
- 执行采用用户已选择的 Native（原生执行），不创建子智能体。

## Review Focus

- 同一字段连续两次异步校验乱序完成时，旧结果不得覆盖新结果；Task 2 覆盖。
- 字段在异步校验期间卸载或重置时，旧请求不得恢复错误或校验中状态；Task 2 覆盖。
- 嵌套字段局部 `markFieldsClean` 后，兄弟字段的脏状态不得被误清；Task 3 覆盖。
- AutoComplete 失败或加载时按 Enter 不得选择旧候选项；Task 4 覆盖。
- 条件字段删除后，提交结果和脏状态必须同时反映删除；Task 5 覆盖。

---

### Task 1: 锁定 Form v4 公共类型

**Files:**
- Modify: `packages/qizhi-react/src/form/Form.types.ts`
- Modify: `packages/qizhi-react/src/form/Form.types.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Consumes: `FormNamePath`、`FormValues`、既有 `FormRule` 与 `FormInstance`。
- Produces: `FormRuleFailure`、`FormValidationException`、`onValidationException`、`isFieldsDirty`、`markFieldsClean`、`Form.useDirty`。

- [ ] **Step 1: 写失败类型测试**

在 `Form.types.test.tsx` 增加编译期使用：

```tsx
const failure: FormRuleFailure = { type: "network", message: "服务暂不可用" };
const exception: FormValidationException = { name: ["service", "region"], ...failure };

function DirtyState() {
  const [form] = Form.useForm();
  const dirty = Form.useDirty(form);
  form.isFieldsDirty([["service", "region"]]);
  form.markFieldsClean([["service", "region"]]);
  return <Form form={form} onValidationException={(current) => current.message}>{String(dirty)}</Form>;
}
```

- [ ] **Step 2: 运行类型测试并确认红灯**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/Form.types.test.tsx`

Expected: 因新增类型、实例方法和 `Form.useDirty` 尚不存在而失败。

- [ ] **Step 3: 增加最小公共类型与出口**

按规格定义：

```ts
export interface FormRuleFailure {
  type: "field" | "network";
  message: string;
  cause?: unknown;
}

export interface FormValidationException {
  name: FormNamePath;
  type: "network";
  message: string;
  cause?: unknown;
}
```

同步扩展 `FormRule.validator`、`FormProps`、`FormInstance` 和 `FormComponent`，并从根入口导出新增公共类型。

- [ ] **Step 4: 运行类型检查并确认绿灯**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/Form.types.test.tsx && pnpm typecheck`

Expected: 全部通过。

- [ ] **Step 5: 提交公共契约**

```bash
git add packages/qizhi-react/src/form/Form.types.ts packages/qizhi-react/src/form/Form.types.test.tsx packages/qizhi-react/src/index.ts
git commit -m "feat(form): define v4 business state contracts"
```

### Task 2: 消除异步校验竞态并分流网络异常

**Files:**
- Modify: `packages/qizhi-react/src/form/formStore.ts`
- Modify: `packages/qizhi-react/src/form/formStore.test.ts`
- Modify: `packages/qizhi-react/src/form/Form.tsx`
- Modify: `packages/qizhi-react/src/form/Form.test.tsx`

**Interfaces:**
- Consumes: Task 1 的 `FormRuleFailure`、`FormValidationException`、`onValidationException`。
- Produces: 字段级最新校验生效规则和表单级网络异常通道。

- [ ] **Step 1: 写乱序校验失败测试**

使用两个可控 Promise：先触发值 `old`，再触发值 `new`；先解决 `new`，再拒绝 `old`。断言最终字段无错误、`isFieldValidating` 为 `false`，旧结果未写回。

```ts
expect(store.instance.getFieldError("serviceName")).toEqual([]);
expect(store.isFieldValidating("serviceName")).toBe(false);
```

- [ ] **Step 2: 写卸载、重置和网络异常失败测试**

分别断言：

```ts
unregister();
resolveOldValidation();
expect(store.instance.getFieldError("serviceName")).toEqual([]);

store.instance.resetFields(["serviceName"]);
rejectOldValidation(new Error("旧错误"));
expect(store.instance.getFieldError("serviceName")).toEqual([]);

return { type: "network", message: "校验服务不可用" };
```

网络失败必须调用 `onValidationException`，字段不出现 `aria-invalid`，`onFinishFailed` 不执行。

- [ ] **Step 3: 运行定向测试并确认红灯**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.test.tsx`

Expected: 旧请求覆盖新状态，且网络失败被写成字段错误。

- [ ] **Step 4: 实现字段校验版本**

在 FormStore 中维护：

```ts
const validationVersions = new Map<string, number>();
const nextValidationVersion = (key: string) => {
  const version = (validationVersions.get(key) ?? 0) + 1;
  validationVersions.set(key, version);
  return version;
};
```

每次校验捕获本次版本；写入错误、清除 `validating` 前检查仍为最新版本。字段卸载和重置时递增版本使旧请求失效。

- [ ] **Step 5: 实现结构化失败分流**

字段失败继续写入 `errors`；网络失败构造 `FormValidationException`，交由 Form 提供的回调处理，并使 `validateFields()` 抛出该异常。不得把网络文案写入字段帮助文本。

- [ ] **Step 6: 运行定向与兼容测试并确认绿灯**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.test.tsx packages/qizhi-react/src/form/FormList.test.tsx`

Expected: 全部通过。

- [ ] **Step 7: 提交校验一致性**

```bash
git add packages/qizhi-react/src/form/formStore.ts packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.tsx packages/qizhi-react/src/form/Form.test.tsx
git commit -m "feat(form): isolate async validation results"
```

### Task 3: 增加未保存修改判断

**Files:**
- Modify: `packages/qizhi-react/src/form/formStore.ts`
- Modify: `packages/qizhi-react/src/form/formStore.test.ts`
- Modify: `packages/qizhi-react/src/form/Form.tsx`
- Modify: `packages/qizhi-react/src/form/Form.test.tsx`

**Interfaces:**
- Consumes: Task 1 的 `isFieldsDirty`、`markFieldsClean` 和 `Form.useDirty` 签名。
- Produces: 结构值脏状态、局部干净基线和精确 Hook 订阅。

- [ ] **Step 1: 写脏状态失败测试**

覆盖初始干净、用户输入、程序化修改、恢复原值、列表变化和条件字段删除：

```ts
expect(form.isFieldsDirty()).toBe(false);
form.setFieldValue(["service", "name"], "new");
expect(form.isFieldsDirty()).toBe(true);
form.resetFields();
expect(form.isFieldsDirty()).toBe(false);
```

- [ ] **Step 2: 写局部基线与 Hook 失败测试**

修改两个兄弟字段后只调用 `markFieldsClean` 更新其中一个；断言整体仍脏、已保存字段不脏。`Form.useDirty()` 只在布尔状态翻转时重新渲染。

- [ ] **Step 3: 运行定向测试并确认红灯**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.test.tsx`

Expected: 实例方法与 Hook 尚无实现。

- [ ] **Step 4: 实现干净基线与结构比较**

在 FormStore 内保存 `cleanValues`，初始化时与 `initialValues` 相同。复用路径工具读取指定字段；使用稳定的递归结构比较，支持普通对象、数组和基础值，不依赖对象引用相等。

- [ ] **Step 5: 实现脏状态订阅与 Form.useDirty**

FormStore 暴露 `subscribeDirty`，只在整体脏状态布尔值变化时通知。所有值变化、重置、列表操作和条件字段清理后重新计算；`markFieldsClean` 更新全部或指定路径基线。

- [ ] **Step 6: 运行 Form 全部定向测试并确认绿灯**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/Form.test.tsx packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/FormList.test.tsx packages/qizhi-react/src/form/Form.types.test.tsx`

Expected: 全部通过。

- [ ] **Step 7: 提交脏状态能力**

```bash
git add packages/qizhi-react/src/form/formStore.ts packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.tsx packages/qizhi-react/src/form/Form.test.tsx
git commit -m "feat(form): track unsaved changes"
```

### Task 4: 为 AutoComplete 增加远程查询四态

**Files:**
- Modify: `packages/qizhi-react/src/auto-complete/AutoComplete.types.ts`
- Modify: `packages/qizhi-react/src/auto-complete/AutoComplete.types.test.tsx`
- Modify: `packages/qizhi-react/src/auto-complete/AutoComplete.tsx`
- Modify: `packages/qizhi-react/src/auto-complete/AutoComplete.test.tsx`
- Modify: `packages/qizhi-react/src/auto-complete/autoComplete.css`

**Interfaces:**
- Consumes: 既有 `data`、`onSearch`、候选键盘行为和 QIZHI Button/Empty 视觉语义。
- Produces: `loading`、`emptyContent`、`error`、`onRetry` 四态公共 API。

- [ ] **Step 1: 写类型和渲染失败测试**

依次渲染并断言：

```tsx
<AutoComplete aria-label="区域" value="华" loading />
<AutoComplete aria-label="区域" value="华" data={[]} emptyContent="没有区域" />
<AutoComplete aria-label="区域" value="华" error="查询失败" onRetry={onRetry} />
```

加载使用 `role="status"`；空结果可见；失败内容和“重试”按钮可见。

- [ ] **Step 2: 写状态优先级与键盘失败测试**

同时传入旧候选与 `loading`/`error`，按 Enter 后 `onSelect` 不得执行。点击或键盘激活重试按钮时 `onRetry` 只执行一次。

- [ ] **Step 3: 运行 AutoComplete 测试并确认红灯**

Run: `pnpm exec vitest run packages/qizhi-react/src/auto-complete/AutoComplete.test.tsx packages/qizhi-react/src/auto-complete/AutoComplete.types.test.tsx`

Expected: 新属性不存在且状态弹层未渲染。

- [ ] **Step 4: 实现状态模型和弹层**

计算 `panelState`：`loading > error > empty > options > closed`。状态弹层与候选列表共用现有 popup 容器；loading/error 时令可选候选为空，Enter 不触发选择。

- [ ] **Step 5: 补充局部样式和无障碍状态**

只新增 `.qizhi-auto-complete__state`、`__retry` 等局部类，复用现有颜色、边框、间距和按钮焦点规范；不修改全局 token。

- [ ] **Step 6: 运行 AutoComplete 全部测试并确认绿灯**

Run: `pnpm exec vitest run packages/qizhi-react/src/auto-complete/AutoComplete.test.tsx packages/qizhi-react/src/auto-complete/AutoComplete.types.test.tsx`

Expected: 全部通过。

- [ ] **Step 7: 提交远程状态**

```bash
git add packages/qizhi-react/src/auto-complete/AutoComplete.types.ts packages/qizhi-react/src/auto-complete/AutoComplete.types.test.tsx packages/qizhi-react/src/auto-complete/AutoComplete.tsx packages/qizhi-react/src/auto-complete/AutoComplete.test.tsx packages/qizhi-react/src/auto-complete/autoComplete.css
git commit -m "feat(auto-complete): add remote query states"
```

### Task 5: 验证三类控件联动和多层重置

**Files:**
- Modify: `packages/qizhi-react/src/form/Form.test.tsx`
- Modify: `packages/qizhi-react/src/form/formStore.test.ts`

**Interfaces:**
- Consumes: 完整 Form v4、Input、Select、AutoComplete。
- Produces: 跨控件集成和嵌套重置回归证据。

- [ ] **Step 1: 写三类控件联动失败测试**

同一 Form 内注册 Input、Select 和 AutoComplete；依次操作并断言 `onValuesChange`、`Form.useWatch` 和依赖校验接收到真实值。AutoComplete 选择候选后必须写入表单字段。

- [ ] **Step 2: 写父路径局部重置失败测试**

修改 `service.name`、`service.region` 和无关的 `owner`，回填子字段错误后执行：

```ts
form.resetFields([["service"]]);
```

断言 service 完整子树恢复、子字段错误和旧校验失效、owner 保持修改值，脏状态只反映 owner。

- [ ] **Step 3: 运行测试并确认红灯**

Run: `pnpm exec vitest run packages/qizhi-react/src/form/Form.test.tsx packages/qizhi-react/src/form/formStore.test.ts`

Expected: AutoComplete 集成或父路径状态清理断言失败。

- [ ] **Step 4: 完成最小兼容修正**

若 Form.Item 的通用注入已满足控件协议，仅修复测试暴露的真实缺口；不得为 AutoComplete 增加专用分支。父路径重置复用 `isSameOrAncestorPath` 清理后代错误、校验版本和校验中状态。

- [ ] **Step 5: 运行 Form 与 AutoComplete 定向集合**

Run: `pnpm exec vitest run packages/qizhi-react/src/form packages/qizhi-react/src/auto-complete`

Expected: 全部通过。

- [ ] **Step 6: 提交集成保障**

```bash
git add packages/qizhi-react/src/form/Form.test.tsx packages/qizhi-react/src/form/formStore.test.ts packages/qizhi-react/src/form/Form.tsx packages/qizhi-react/src/form/formStore.ts
git commit -m "test(form): cover business control integration"
```

### Task 6: 增加同源业务 Demo、API 文档与浏览器验收

**Files:**
- Create: `apps/qizhi-docs/src/form/demos/RemoteBusinessDemo.tsx`
- Modify: `apps/qizhi-docs/src/form/formDocs.registry.ts`
- Modify: `apps/qizhi-docs/src/form/formDocs.test.tsx`
- Modify: `apps/qizhi-docs/src/form/formApi.ts`
- Modify: `apps/qizhi-docs/src/form/FormApiTable.tsx`
- Modify: `apps/qizhi-docs/src/form/formDocs.css`
- Modify: `scripts/build-component-api.mjs`
- Modify: `tests/e2e/form-react-island.spec.ts`
- Create: `docs/verification/qizhi-form-business-complexity-v4.md`
- Modify: `index.html`

**Interfaces:**
- Consumes: Tasks 1–5 的所有公共能力。
- Produces: 用户可操作的第二期 Demo、结构化 API 和验收证据。

- [ ] **Step 1: 写文档失败测试**

锁定新增 Demo 标题“远程联动与未保存修改”、同源代码、Form/AutoComplete 新 API 行和既有 Demo 顺序不变。

- [ ] **Step 2: 运行文档测试并确认红灯**

Run: `pnpm exec vitest run apps/qizhi-docs/src/form/formDocs.test.tsx`

Expected: 新 Demo 与 API 行不存在。

- [ ] **Step 3: 实现同源 Demo**

Demo 用受控 Promise 或短定时器模拟最新异步校验；AutoComplete 提供加载、空结果、失败、重试和成功入口；网络异常显示表单级 `role="alert"`；用 `Form.useDirty()` 展示保存状态并绑定/清理 `beforeunload`；提供局部重置、全部重置、保存和提交按钮。

- [ ] **Step 4: 更新 API 表和结构化清单**

同步 Form、Form.Item、FormInstance、AutoComplete API 数据和根导出。运行 `pnpm api:build` 生成 `component-api.json`，不得手工编辑生成文件。

- [ ] **Step 5: 更新局部样式与更新日志**

只新增 `.form-docs-remote-*` 局部类，复用既有控件、提示和按钮。更新 2026-09-24 更新日志计数与说明，不覆盖既有记录。

- [ ] **Step 6: 扩展 E2E 全链路**

在三个既有视口验证：旧异步结果不覆盖新结果；AutoComplete 四态和重试；网络错误不标红字段；Input/Select/AutoComplete 联动；条件字段清理；脏状态、保存、局部/全部重置；多层提交；真实 Tab/Enter；无横向溢出与控制台错误。

- [ ] **Step 7: 运行文档、API 与浏览器测试**

Run:

```bash
pnpm exec vitest run apps/qizhi-docs/src/form/formDocs.test.tsx packages/qizhi-react/src/form packages/qizhi-react/src/auto-complete
pnpm api:validate
pnpm exec playwright test tests/e2e/form-react-island.spec.ts
```

Expected: 全部通过，三个视口均完成新 Demo 全链路。

- [ ] **Step 8: 写验收记录并提交**

记录实际测试数量、三视口结果、既有构建警告和 `candidate_pass/pending` 边界。

```bash
git add apps/qizhi-docs/src/form packages/qizhi-react/src/form packages/qizhi-react/src/auto-complete scripts/build-component-api.mjs tests/e2e/form-react-island.spec.ts docs/verification/qizhi-form-business-complexity-v4.md index.html component-api.json
git commit -m "docs(form): add remote business workflow"
```

### Task 7: 最终回归与契约收口

**Files:**
- Modify: `docs/specs/qizhi-form-business-complexity-v4.md`
- Modify: `docs/superpowers/plans/2026-09-24-qizhi-form-business-complexity-v4.md`
- Modify: `docs/verification/qizhi-form-business-complexity-v4.md`

**Interfaces:**
- Consumes: 完整实现、文档与自动化结果。
- Produces: 可追溯的 candidate_pass 记录。

- [ ] **Step 1: 执行最终常规检查**

Run:

```bash
node --check script.js
pnpm typecheck
pnpm test
pnpm build
pnpm api:validate
git diff --check
```

Expected: 全部退出码为 0；允许记录既有 chunk size 警告，不得新增错误。

- [ ] **Step 2: 重跑真实浏览器验收**

Run: `pnpm exec playwright test tests/e2e/form-react-island.spec.ts`

Expected: 1440×900、1024×900、375×812 全部通过。

- [ ] **Step 3: 更新规格和计划状态**

只有在上述命令均有新鲜成功回执后，勾选完成门槛和计划步骤；规格状态写为“已确认并实施（candidate_pass，独立最终验证 pending）”。

- [ ] **Step 4: 提交验收记录**

```bash
git add docs/specs/qizhi-form-business-complexity-v4.md docs/superpowers/plans/2026-09-24-qizhi-form-business-complexity-v4.md docs/verification/qizhi-form-business-complexity-v4.md
git commit -m "docs(form): record v4 acceptance"
```
