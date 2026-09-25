# QIZHI Form Draft API 契约 v1

状态：已确认并实施（candidate_pass，独立最终验证 pending）
负责人：林猫猫
证据日期：2026-09-24

## 1. 目标与核心边界

Form Draft 用于长表单、多步表单在刷新、关闭或中断后恢复未完成的填写状态。组件库定义通用草稿流程，不绑定任何 Demo 字段、业务表单结构或公司后端协议。

- 组件库负责：保存、读取、恢复、删除的状态编排，以及版本、过期和冲突的通用判断。
- 业务项目负责：草稿键、可保存字段、存储适配器、鉴权、服务端数据隔离、保留时间和冲突选择 UI。
- 不在 Form 核心中默认使用 `localStorage`。组件库 Demo 可使用明确标注的本地模拟适配器，不作为企业接入建议。
- 不保存字段校验错误、DOM 节点、校验中状态或提交中状态。
- 不包含 Advanced Form.List 数量限制、整行校验和批量操作；不包含 Bulk Edit。

## 2. 实施前必须完成的 Form 基础调整

### 2.1 数组与 Form.List 恢复

`setFieldsValue(values)` 继续只合并传入的字段路径，不覆盖无关兄弟字段；但数组在其所在路径上作为完整值替换。

- `setFieldsValue({ members: [] })` 必须真正清空 `members`。
- 写入非空数组时，Form.List 条目数和内部稳定 key 必须同步。
- 从 2 条恢复到 5 条、从 5 条恢复到 1 条、空数组和嵌套列表都必须有行为测试。
- 程序化恢复不触发 `onValuesChange`，但必须重新计算 dirty 状态和依赖校验。

### 2.2 Form Steps 可控步骤

`Form.useSteps` 新增可控模式，保留当前非受控用法。

```ts
Form.useSteps({
  form,
  steps,
  initialStep: 1,
  current,
  onCurrentChange,
});
```

- 非受控：未传 `current` 时继续使用内部状态，`initialStep` 只在首次生效。
- 受控：`current` 是唯一真实状态，导航成功后调用 `onCurrentChange(nextStep)`。
- 恢复草稿时，业务项目使用稳定 `step.key` 存储业务上的步骤身份，并在当前 `steps` 中映射为数字位置。
- `goTo()` 仍只校验当前步骤，不隐式校验所有跨越步骤；必须逐步完成的业务由消费方限制可访问步骤。

## 3. 草稿数据契约

```ts
interface FormDraftRecord<TValues extends FormValues = FormValues, TMetadata = unknown> {
  key: string;
  version: string;
  revision: string;
  values: TValues;
  metadata?: TMetadata;
  updatedAt: string;
  expiresAt?: string;
}
```

- `key` 由业务项目构造，必须能区分用户、业务对象和表单场景。
- `version` 表示业务表单结构版本，不匹配时禁止自动恢复。
- `revision` 由存储端生成，是乐观并发控制的不透明标识。
- `updatedAt` 和 `expiresAt` 使用 ISO 8601 字符串。过期草稿不自动恢复。
- `metadata` 可保存稳定步骤 key 等非字段业务状态，不混入 Form values。

## 4. 存储适配器

```ts
interface FormDraftStorage<TValues extends FormValues = FormValues, TMetadata = unknown> {
  load(key: string): Promise<FormDraftRecord<TValues, TMetadata> | null>;
  save(input: {
    key: string;
    version: string;
    values: TValues;
    metadata?: TMetadata;
    expectedRevision?: string;
    force?: boolean;
  }): Promise<
    | { status: "saved"; record: FormDraftRecord<TValues, TMetadata> }
    | { status: "conflict"; remote: FormDraftRecord<TValues, TMetadata> }
  >;
  remove(key: string, expectedRevision?: string): Promise<void>;
}
```

- 组件库不对 URL、HTTP 方法、数据库或鉴权方式做假设。
- 适配器必须将当前登录用户和业务权限应用到服务端，不得仅依赖客户端 `key` 做隔离。
- 网络异常与版本冲突是不同状态，不互相冒充。

## 5. `Form.useDraft` 公共 API

```ts
const draft = Form.useDraft({
  form,
  draftKey,
  version,
  storage,
  selectValues,
  getMetadata,
  onRestoreMetadata,
  autoSave: { debounceMs: 1000 },
});
```

### 5.1 选项

- `form: FormInstance`：要保存与恢复的表单实例。
- `draftKey: string`：业务草稿唯一标识。
- `version: string`：当前业务表单结构版本。
- `storage: FormDraftStorage`：由消费方显式提供，无默认存储。
- `selectValues(values): FormValues`：必填。消费方显式选择可持久化字段，排除密码、令牌、临时签名 URL、未上传文件等敏感或不可序列化内容。
- `getMetadata?()` / `onRestoreMetadata?(metadata)`：保存和恢复步骤 key 等业务状态。
- `autoSave?: false | { debounceMs: number }`：默认 `false`，避免组件库隐式产生网络请求。

### 5.2 控制器

```ts
interface FormDraftController<TValues extends FormValues = FormValues, TMetadata = unknown> {
  status: "idle" | "loading" | "ready" | "saving" | "saved" | "expired" | "version-mismatch" | "conflict" | "error";
  record: FormDraftRecord<TValues, TMetadata> | null;
  conflict: FormDraftRecord<TValues, TMetadata> | null;
  error: unknown;
  load(): Promise<FormDraftRecord<TValues, TMetadata> | null>;
  restore(): boolean;
  save(): Promise<boolean>;
  remove(): Promise<boolean>;
  useRemote(): boolean;
  overwrite(): Promise<boolean>;
}
```

- Hook 首次渲染不自动读取或恢复；消费方显式调用 `load()`，并决定是否展示“恢复草稿”提示。
- `restore()` 只在版本匹配且未过期时写入表单，然后恢复 metadata；不自动触发提交或校验。
- 恢复后默认将恢复值记为当前干净基线，避免“刚恢复就显示未保存”。
- `save()` 使用最近一次 revision 作为 `expectedRevision`。冲突时不覆盖远端，进入 `conflict` 状态。
- `useRemote()` 恢复冲突中的远端记录；`overwrite()` 必须显式调用并以 `force=true` 保存。
- 保存成功后更新 revision，并将已保存的字段记为干净基线。

## 6. 版本、过期和冲突

- 版本不匹配：状态为 `version-mismatch`，不写入 Form，不自动删除远端草稿。
- 草稿过期：状态为 `expired`，不写入 Form，由业务项目决定删除或保留。
- 冲突：远端 revision 与保存请求中的 `expectedRevision` 不一致。默认不自动合并，不自动覆盖。
- 网络或适配器异常：状态为 `error`，保留当前 Form 值和上次成功 record，允许业务 UI 重试。
- 同一 Hook 实例的重叠 `load`/`save` 只允许最新请求更新状态，防止旧请求回写。

## 7. Demo 与文档

- 新增独立“表单草稿” Demo，不改写现有 Form Steps Demo 和 Complex Form Demo 的业务内容。
- Demo 使用内存模拟的异步服务端适配器，明确展示保存、检测草稿、手动恢复、版本不匹配、过期和冲突。
- Demo 可持久化字段不包含密码、令牌或文件内容。
- Demo 预览、展示代码和复制代码继续来自同一 TSX 源文件。

## 8. 验收标准

- Form 基础：数组整体写入、空数组清空、Form.List 数量/key 同步、嵌套列表、dirty 和依赖回归。
- Form Steps：受控与非受控模式、边界限制、失败不通知变更、使用稳定 step key 恢复。
- Form Draft：保存、读取、恢复、删除、明确字段筛选、干净基线、版本不匹配、过期、冲突两种决策、重叠请求竞态、适配器异常。
- 同步公共类型、导出、API 表、契约文档、Demo、展示/复制代码、单元测试与 E2E。
- 执行 `pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check`，并在 1440、1024、375 三视口验证交互、焦点、溢出和控制台错误。
- 自动化通过最多记为 `candidate_pass`；独立最终验收保持 `pending`。
