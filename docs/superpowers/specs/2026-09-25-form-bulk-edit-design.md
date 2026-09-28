# Form Bulk Edit 设计规格

## 1. 目标

为 QIZHI Form 提供无 UI 的批量编辑能力，供公司真实项目对同一类业务记录执行统一修改。能力必须识别混合值，只校验和提交用户实际修改的字段，明确区分“不修改”“设置新值”“主动清空”，并支持部分成功、失败回填和仅重试失败记录。

组件库负责状态、校验和通用提交协议，不负责业务请求、权限判断、并发版本协议或固定界面。

## 2. 范围

### 2.1 包含

- 同一数据结构下多条记录的共同值与混合值计算。
- 嵌套 `FormNamePath` 字段。
- 字段级 `keep / set / clear` 三态。
- 仅校验已修改字段。
- 生成与业务接口解耦的批量补丁。
- 无改动提交拦截。
- 部分成功与失败结果回填。
- 仅针对失败记录重新生成补丁。
- 编辑期间数据源变化保护。
- 公共类型、文档、Demo 和浏览器验收。

### 2.2 不包含

- 不提供固定的弹窗、抽屉、表格、字段布局或结果页面。
- 不发送网络请求，不内置 URL、鉴权、重试次数或业务错误码。
- 不负责不同数据结构之间的联合编辑。
- 不定义业务接口如何表达清空；业务方自行将 `clearedFields` 转成 `null`、空字符串或其他协议。
- 不实现逐数组元素合并；字段值包括数组、对象时按字段整体比较和整体设置。
- 不重新实现 Form Steps、Form Draft 或 Advanced Form.List。

## 3. 设计原则

1. **无 UI**：以 `Form.useBulkEdit` 暴露能力，业务项目自由组合 QIZHI 输入、选择、表格、抽屉等组件。
2. **不污染字段值**：混合值是元状态，不把特殊字符串或哨兵对象写入业务值。
3. **显式清空**：未操作与主动清空必须通过不同状态表达。
4. **差异提交**：未修改字段不得出现在补丁中，避免覆盖原数据。
5. **业务解耦**：组件库消费通用成功/失败回执，不假设后端协议。
6. **失败可恢复**：部分成功后保留失败记录、用户修改和错误，允许仅重试失败记录。

## 4. 公共 API

### 4.1 初始化

```tsx
const [form] = Form.useForm();
const bulk = Form.useBulkEdit({
  form,
  records: selectedMembers,
  getRowKey: (member) => member.id,
  fields: ["department", "role", "status", ["profile", "remark"]],
});
```

建议类型：

```ts
export type FormBulkEditMode = "keep" | "set" | "clear";

export interface FormBulkEditOptions<TRecord, TKey extends string | number> {
  form: FormInstance;
  records: readonly TRecord[];
  getRowKey: (record: TRecord) => TKey;
  fields: readonly FormNamePath[];
  getFieldValue?: (record: TRecord, name: FormNamePath) => unknown;
  isEqual?: (left: unknown, right: unknown, name: FormNamePath) => boolean;
}
```

默认 `getFieldValue` 按 `FormNamePath` 从记录中读取值。默认 `isEqual` 使用适合表单值的深度相等比较，使值相同但引用不同的对象或数组不被误判为混合值。自定义比较器只改变共同值判断，不改变提交载荷。

`fields` 必须去重。空字段列表、重复路径、重复记录 key 或不支持的 key 类型在开发阶段抛出清晰错误，避免产生不可预测的补丁。

### 4.2 字段状态

```ts
export interface FormBulkEditFieldState {
  name: FormNamePath;
  mixed: boolean;
  mode: FormBulkEditMode;
  initialValue: unknown;
}
```

- `mixed: true` 表示源记录在该字段上存在多个不同值。
- 共同值直接写入 Form；混合值不向 Form 写入伪造值。
- 初始化完成后所有字段均为 `mode: "keep"`。
- 用户通过表单控件修改字段后进入 `mode: "set"`。
- 共同值字段如果被改回初始值，恢复为 `mode: "keep"`。
- 混合值字段一旦由用户输入明确值，即使该值等于某一条记录的原值，也保持 `mode: "set"`，因为它仍会统一覆盖其他记录。

控制器提供：

```ts
export interface FormBulkEditController<TKey extends string | number> {
  getFieldState: (name: FormNamePath) => FormBulkEditFieldState;
  getFieldFailures: (name: FormNamePath) => readonly FormBulkEditFailure<TKey>[];
  clearField: (name: FormNamePath) => void;
  keepField: (name: FormNamePath) => void;
  validate: () => Promise<FormBulkEditPatch<TKey>>;
  applyResult: (result: FormBulkEditResult<TKey>) => void;
  rebase: () => void;
  reset: () => void;
  status: "ready" | "sourceChanged" | "complete";
  failures: readonly FormBulkEditFailure<TKey>[];
  succeededKeys: readonly TKey[];
  remainingKeys: readonly TKey[];
  hasChanges: boolean;
}
```

`clearField(name)` 将字段切换为 `clear`，同时清理该字段当前表单值。`keepField(name)` 撤销该字段本轮编辑并恢复共同值或混合值状态。`reset()` 撤销整轮编辑并回到当前已接纳数据源的初始状态。

### 4.3 补丁

```ts
export interface FormBulkEditPatch<TKey extends string | number> {
  targetKeys: readonly TKey[];
  values: FormValues;
  clearedFields: readonly FormNamePath[];
}
```

示例：

```ts
{
  targetKeys: ["member-1", "member-2"],
  values: { department: "研发部" },
  clearedFields: [["profile", "remark"]]
}
```

`values` 保留嵌套路径结构。`keep` 字段不得出现在 `values` 或 `clearedFields` 中；`set` 字段进入 `values`；`clear` 字段只进入 `clearedFields`。同一路径不得同时出现于两处。

`validate()` 在没有修改时拒绝并返回可识别的 `no-changes` 原因，不生成空请求。它只校验 `set` 和 `clear` 字段，并等待现有同步、异步规则完成。校验失败继续使用 Form 当前的 `errorFields` 结构和首错定位能力。

提交前状态拦截统一抛出带稳定 `code` 的错误对象：

```ts
export type FormBulkEditBlockedCode = "no-changes" | "no-targets" | "source-changed";

export interface FormBulkEditBlockedError extends Error {
  code: FormBulkEditBlockedCode;
}
```

### 4.4 结果回填

```ts
export interface FormBulkEditFailure<TKey extends string | number> {
  key: TKey;
  field?: FormNamePath;
  message: string;
}

export interface FormBulkEditResult<TKey extends string | number> {
  succeededKeys: readonly TKey[];
  failures: readonly FormBulkEditFailure<TKey>[];
}
```

调用：

```ts
bulk.applyResult({
  succeededKeys: ["member-1"],
  failures: [
    { key: "member-2", field: "department", message: "没有修改该部门的权限" },
  ],
});
```

约束：

- 每个当前目标 key 必须归入成功或失败集合之一，两个集合不得相交；同一失败 key 可以有多条字段错误。遗漏和未知 key 必须拒绝，不能静默猜测。
- 成功记录退出待处理集合。
- 失败记录、用户修改和失败原因保留。
- `getFieldFailures(name)` 返回对应字段的逐记录失败，业务界面可通过 `Form.ErrorList` 汇总展示；Hook 不自动把业务失败写成前端规则错误。
- 无 `field` 的失败作为记录级错误暴露。
- 再次调用 `validate()` 时，`targetKeys` 仅包含失败记录。
- 当所有记录成功后，待处理集合为空，失败清空，状态进入 `complete`。
- 请求超时、断网和未取得业务回执不调用 `applyResult()`；业务项目保留当前编辑状态并处理请求级错误。

## 5. 初始化与重新计算

对每个声明字段读取全部记录值：

1. 全部值相等时，将共同值写入 Form，并记录 `mixed: false`。
2. 存在不同值时，不写入伪造值，记录 `mixed: true`。
3. 初始化写入不得触发业务 `onValuesChange`，不得被记为用户修改。
4. 初始化完成后建立干净基线。

空记录集合是合法输入：控制器保持 `ready`，`remainingKeys` 为空，`validate()` 返回 `no-targets`，不得生成请求。

## 6. 数据源变化保护

Hook 必须比较最新 `records` 中目标 key、声明字段值与当前已接纳快照：

- 没有本轮修改时，自动接纳新记录并重新计算共同值和混合值。
- 存在本轮修改时，不静默覆盖，进入 `sourceChanged`。
- `sourceChanged` 状态下 `validate()` 必须拒绝，避免向旧目标或旧版本数据提交。
- `sourceChanged` 状态下 `applyResult()` 也必须拒绝，避免较早发出的请求回填后覆盖冲突保护。
- `rebase()` 明确放弃本轮修改，接纳最新记录并建立新基线。
- 部分成功后只监测仍待处理的失败记录；已由 `applyResult()` 确认成功的记录后续刷新或移除，不得阻断失败记录重试。
- 业务项目如果希望保留旧修改并合并新数据，应在组件外完成业务冲突决策；v1 不提供自动合并。

## 7. 校验与错误语义

- `keep` 字段不参与本轮校验，混合值缺少统一表单值时不会误触发必填规则。
- `set` 字段使用当前表单值和既有 `Form.Item rules`。
- `clear` 字段按空值校验；必填字段主动清空应失败。
- 异步竞态、网络异常和首错定位沿用现有 Form 语义。
- 业务失败不是前端规则失败。字段级业务失败通过 `getFieldFailures(name)` 提供给界面汇总，但必须同时保留逐记录失败明细。
- 用户再次编辑相应字段时，清理该字段旧的业务失败展示，但不擅自把对应记录标记为成功。

普通 `form.submit()` 会校验所有注册字段，不适合批量编辑的“只校验改动字段”语义。批量编辑页面必须通过 `bulk.validate()` 生成补丁，再由业务方发送请求。

## 8. 状态与订阅边界

`Form.useBulkEdit` 复用同一个 `FormInstance`，通过 Form store 的订阅能力观察声明字段。新增逻辑应封装在独立模块中，避免把结果回填和补丁生成堆入 `Form.tsx`。

建议模块边界：

- `formBulkEdit.ts`：Hook、快照、三态、补丁与回执状态机。
- `formBulkEditUtils.ts`：路径读取、深度比较、共同值计算等纯函数；如现有 `formPath` 足够则直接复用，不重复实现。
- `Form.types.ts`：公共契约。
- `Form.tsx`：仅把 `useBulkEdit` 挂到 `Form` 命名空间。

该能力不得改变不使用 `Form.useBulkEdit` 时的 Form 行为。

## 9. 界面与可访问性要求

组件库不提供固定 UI，但 Demo 和文档必须给出正确接入方式：

- 混合值提示不能只放在 placeholder；必须通过可见说明及 `aria-describedby` 或等效关联供辅助技术读取。
- 修改状态不能只通过颜色表达。
- 结果区域同时展示成功数量、失败数量和逐条失败原因。
- 失败项支持聚焦或定位到对应说明。
- 375px 下字段、操作区和结果内容不得横向溢出。

## 10. Demo

新增独立“批量编辑”Demo，不改写已有 Form Demo 的业务内容。Demo 使用同一成员结构展示：

1. 选择多名成员后，部门为混合值、状态为共同值。
2. 将部门统一设置为新值。
3. 主动清空备注。
4. 预览补丁，证明未操作字段没有提交。
5. 模拟部分成功和字段级失败。
6. 仅重试失败成员并完成。
7. 编辑过程中模拟外部记录变化，显示 `sourceChanged` 并要求重新基线化。

Demo 中的网络和后端结果均明确标注为模拟，不把模拟成功视为真实服务回执。

## 11. 测试与验收

### 11.1 单元和类型测试

- 公共类型、导出和 `Form.useBulkEdit` 可用性。
- 共同值、混合值、嵌套路径和深度相等。
- 空记录、重复 key、重复字段路径和无效回执。
- `keep / set / clear` 转换及撤销。
- 共同值改回原值恢复 `keep`；混合值输入后保持 `set`。
- 嵌套 `values` 与 `clearedFields` 互斥。
- 只校验改动字段、必填清空失败、异步校验竞态和无改动拦截。
- 部分成功、失败明细、字段失败汇总和仅重试失败记录。
- 数据源无修改时自动接纳；有修改时进入 `sourceChanged`；`rebase()` 后恢复。
- Form Steps、Draft、Advanced Form.List 及现有 Form 回归。

### 11.2 文档和浏览器验收

- API 表、结构化 API 清单、Demo 展示代码和复制代码同源。
- 完成完整 Demo 流程并核对补丁内容。
- 验证字段提示、错误关联、键盘操作和首错定位。
- 桌面 1440px、窄屏 1024px、移动端 375px 均无内容溢出或操作遮挡。

## 12. 兼容性与版本边界

- 所有新增能力均为可选 Hook；现有 Form 公共属性和实例方法保持兼容。
- v1 只支持同构记录和显式声明字段，不自动扫描任意对象。
- v1 不包含跨页面选择持久化、服务端全选、权限预检、撤销已成功请求或自动冲突合并。
- Form Draft 如需保存批量编辑会话，应由业务方显式保存目标 key、字段模式和表单值；本阶段不自动整合 Draft。

## 13. 完成标准

- 公共 API、实现、类型、文档和 Demo 一致。
- 所有新增测试及既有 Form 回归测试通过。
- API 清单重新生成且无手工漂移。
- 三个目标视口的浏览器验收通过。
- 不包含无关工作区改动，不发布、不推送。
- 实现者最多声明 `candidate_pass`；独立最终验证在实际完成前保持 `pending`。
