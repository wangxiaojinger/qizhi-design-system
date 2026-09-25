# Advanced Form.List 设计规格

## 目标

在不重复已有基础 `Form.List` 能力的前提下，为公司真实项目提供可复用的高级动态列表约束：数量上下限、列表级校验、整行校验、原子批量新增，以及可验证的嵌套列表稳定性。

组件库只提供通用机制，不内置成员、服务地址或其他业务字段和文案。业务项目负责传入真实数据、规则、错误文案和持久化实现。

## 已确认基础

- 基础 `add`、`remove`、`move` 已完成。
- `remove` 已接受单个索引或索引数组。
- 嵌套列表、嵌套提交、列表移动和删除时的值与错误迁移已有基础实现。
- `Form Steps` 与 `Form Draft` 属于前置阶段，本阶段不得重新实现。
- `Form Draft` 恢复的数据可能包含超过当前数量限制的历史内容，因此限制校验不得静默删改恢复数据。

## 范围

本阶段包含：

- `Form.List` 的 `min`、`max` 数量限制。
- Ant Design 风格的列表级 `rules`、第三个渲染参数 `meta.errors` 和 `Form.ErrorList`。
- `rowRules` 整行校验与 `field.errors`。
- `addMany(values)`、`canAdd(count?)`、`canRemove(index | index[])`。
- 嵌套列表在高级能力下的隔离和迁移契约。
- 对应类型、实现、测试、文档、演示、复制代码与 E2E 验收。

本阶段不包含：

- 批量移动、清空列表、选择态或服务端分页。
- Bulk Edit 的混合值、差异提交、部分成功与失败回填。
- 草稿存储实现或业务接口。
- 任何具体业务字段、固定错误文案或默认 `max=10`。

## 公共 API

### Form.List

```ts
export interface FormListProps {
  name: FormNamePath;
  initialValue?: unknown[];
  min?: number;
  max?: number;
  rules?: FormListRule[];
  rowRules?: FormListRowRule[];
  children: (
    fields: FormListField[],
    operations: FormListOperations,
    meta: FormListMeta,
  ) => ReactNode;
}
```

`min` 和 `max` 均为非负安全整数。两者同时存在时必须满足 `min <= max`。无效配置在开发和测试中直接抛出明确错误，不做猜测性修正。

不传 `min` 或 `max` 表示对应方向无限制。组件库没有默认 `max=10`；文档演示使用 `min={1}`、`max={10}` 说明能力。

### 列表级规则

```ts
export interface FormListRule {
  message?: string;
  validator?: (
    listValue: unknown[],
    values: FormValues,
  ) => void | FormRuleFailure | Promise<void | FormRuleFailure>;
}
```

`rules` 校验整个数组，适合重复项、至少一个负责人或跨行关系等约束。它只接受自定义校验器，不复用字段规则中的 `required`、`pattern`、字符串长度等标量语义。

列表规则产生的错误与 `min/max` 数量错误合并到 `meta.errors`。错误顺序固定为数量限制在前、`rules` 声明顺序在后。异步规则采用最新一次校验结果生效，过期结果不得覆盖新结果。

### 整行规则

```ts
export type FormListRowRule = (
  rowValue: unknown,
  index: number,
  allValues: FormValues,
) => void | FormRuleFailure | Promise<void | FormRuleFailure>;
```

`rowRules` 校验同一条数据内部或该行与表单全值的关系。规则按声明顺序执行；错误写入对应 `FormListField.errors`，不混入 `meta.errors`。

```ts
export interface FormListField {
  key: string;
  name: number;
  errors: string[];
}
```

行内任意后代字段变化时重新校验该行。列表移动后错误跟随稳定 `key` 对应的数据移动；删除行时该行错误一并删除。异步行校验同样只接受最新结果。

### 列表元信息与错误展示

```ts
export interface FormListMeta {
  errors: string[];
}

export interface FormErrorListProps {
  errors?: readonly ReactNode[];
  className?: string;
  style?: CSSProperties;
}
```

`Form.ErrorList` 仅负责渲染传入错误，不注册字段、不执行校验、不修改数据。无错误时不渲染可见错误容器；有错误时使用可访问的错误语义，并保持传入顺序。

推荐用法：

```tsx
<Form.List
  name="members"
  min={1}
  max={10}
  rules={[{ validator: validateUniqueMembers }]}
  rowRules={[validateMemberRow]}
>
  {(fields, operations, meta) => (
    <>
      {fields.map((field) => (
        <MemberRow key={field.key} field={field} operations={operations} />
      ))}
      <Form.ErrorList errors={meta.errors} />
    </>
  )}
</Form.List>
```

### 列表操作

```ts
export interface FormListOperations {
  add: (defaultValue?: unknown, insertIndex?: number) => void;
  addMany: (values: readonly unknown[], insertIndex?: number) => void;
  remove: (index: number | readonly number[]) => void;
  move: (from: number, to: number) => void;
  canAdd: (count?: number) => boolean;
  canRemove: (index: number | readonly number[]) => boolean;
}
```

`canAdd()` 等价于 `canAdd(1)`。`count` 必须是非负安全整数；零返回 `true`。`canRemove` 按去重后的有效索引计算实际删除数量。

`add`、`addMany`、`remove` 必须在数据操作层强制执行 `min/max`，不能只依赖按钮禁用。越界操作原子失败：不产生部分数据、部分 key 或部分错误迁移。失败为无操作，不抛出用户运行时异常；调用方通过 `canAdd/canRemove` 提前控制交互。

`addMany([])` 是无操作。`addMany` 保持输入顺序，并从指定位置连续插入。无效插入位置沿用现有 `add` 的边界语义。

批量删除先去重索引；无效索引被忽略。若删除全部有效目标后会低于 `min`，整个操作不执行。`move` 不改变数量，因此不受 `min/max` 阻止，并沿用现有边界行为。

## 数据与校验流程

用户通过操作对象修改列表时，流程为：

1. 根据当前数组和限制判断操作是否允许。
2. 允许时一次性更新数组、稳定 key 及关联错误；不允许时保持全部状态不变。
3. 通知列表路径和受影响后代订阅者。
4. 重新运行列表级和受影响行的校验。
5. 将数量及列表规则错误暴露为 `meta.errors`，将行规则错误暴露为 `field.errors`。

`setFieldValue`、`setFieldsValue`、初始值和草稿恢复属于程序化写入。它们不得因为 `min/max` 截断、补齐或拒绝原始数据；写入后通过正常校验暴露数量错误。这保证历史数据可见且可由用户修正。

`validateFields()` 和表单提交必须等待列表级及行级异步规则结束。列表错误进入 `FormErrorField[]`，名称为该列表的 `name`；行错误名称为列表路径加当前行索引。`scrollToFirstError` 因而可以定位列表或对应行。

网络类型失败继续遵循现有 `FormValidationException` 与 `onValidationException` 契约，不得伪装成内容错误。

## 嵌套列表契约

内外层 `Form.List` 分别拥有自己的 `min`、`max`、`rules`、`rowRules`、key 和错误状态，任何操作只影响目标路径。

- 内层增删不得改变外层数量或 key。
- 外层移动时，整行值、内层数组、内外层错误及所有稳定 key 一起迁移。
- 外层删除时，对应后代值、错误、校验状态和 key 一起删除，其余条目稳定迁移。
- 外层行规则接收完整行值，包括内层列表数据。
- 同一路径下的过期异步结果不得在移动、删除或新校验完成后重新写回。

本阶段不增加新的嵌套专用 API；以上行为通过实现加固和回归测试保证。

## 兼容性

已有只使用两个渲染参数的代码继续工作，因为第三参数是追加参数。现有 `add/remove/move` 签名保持兼容；`remove` 将数组参数收紧为只读输入仍兼容普通数组。

新增属性全部可选。不使用高级能力时，行为与当前基础 `Form.List` 一致。

API 形态有意接近 Ant Design：保留 `fields / operations / meta` 渲染结构、`rules → meta.errors → Form.ErrorList` 路径和 `add/remove/move` 命名。`min/max`、`rowRules`、`addMany`、`canAdd/canRemove` 是 QIZHI 的增量能力，不宣称与 Ant Design 可直接替换。

## 文档与演示

新增独立“高级动态列表”演示，保留现有“复杂表单联动”演示，避免把基础、草稿和高级列表混成一个示例。

演示至少覆盖：

- `min={1}`、`max={10}` 及按钮禁用。
- 原子批量新增。
- 整个列表的重复值校验，并通过 `Form.ErrorList` 展示。
- 单行跨字段校验，并在对应行下展示。
- 一层嵌套列表及移动后的状态保持。

实现、类型导出、API 表、结构化 API 数据、展示代码、复制代码和测试源码必须同步，不能只修改可见 Demo。

## 测试与验收

单元和集成测试必须覆盖：

- 未配置限制、仅 `min`、仅 `max`、`min=max`、零限制和无效配置。
- 边界位置的单条与批量新增、空批次、输入顺序和原子失败。
- 单个及批量删除、重复索引、无效索引、低于 `min` 时的原子失败。
- `canAdd/canRemove` 与实际操作结果一致。
- 程序化写入和草稿恢复超限时保留数据并在校验中报错。
- 列表级同步/异步规则、规则顺序、最新异步结果胜出、网络异常。
- 行级同步/异步规则、后代变化触发、最新结果胜出、错误跟随移动并在删除时清理。
- `Form.ErrorList` 空状态、错误顺序、样式透传和可访问性。
- 内外层限制隔离，外层移动/删除时值、错误、校验状态和 key 的迁移。
- 与现有 `preserve=false`、Steps、Draft 恢复和基础 `Form.List` 用法的兼容性。

文档 E2E 在桌面、平板和窄屏三种视口验证：内容不溢出、操作按钮状态正确、列表和行错误位置稳定、首错定位可用、复制代码与展示一致。

## 完成标准

- 公共类型、运行时行为、文档和复制代码一致。
- 所有新增及相关回归测试通过。
- 真实浏览器完成三种视口的关键交互验收。
- 不修改既有基础列表、Steps、Draft 的业务语义。
- 实现者自测最多记录为 `candidate_pass`；独立最终验收在独立验证前保持 `pending`。
