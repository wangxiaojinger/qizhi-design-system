# QIZHI Form API 契约 v3

状态：待审阅  
负责人：林猫猫  
证据日期：2026-09-24

## 1. 目标与边界

- 用户任务：在 Form v2 基础业务闭环保持兼容的前提下，支持复杂数据结构、动态字段和显式字段联动。
- 业务场景：对象嵌套录入、数组条目增删移动、确认字段校验、条件字段显示，以及后端对嵌套字段的精确错误回填。
- v3 第二阶段 A 解决：嵌套字段路径、动态字段列表、跨字段依赖、精确字段监听、条件字段卸载后的值保留策略。
- 本阶段明确不解决：点号字符串路径解析、异步校验防抖、异步请求取消与竞态管理、远程候选查询状态、步骤导航和业务流程编排。

## 2. 兼容性原则

- Form v2 的简单字符串字段名继续有效，不要求消费方迁移。
- 字符串字段名始终作为完整字段名处理；`"user.email"` 不解析为嵌套路径。
- 嵌套字段统一使用 `(string | number)[]` 数组路径表达。
- 聚合值、提交值和失败结果返回真实嵌套对象或数组，不暴露内部扁平键。
- 未使用 v3 新能力的 Form v2 页面，其 DOM、样式、值结构和交互保持不变。

## 3. 公共类型

```ts
export type FormNameSegment = string | number;
export type FormNamePath = string | readonly FormNameSegment[];

export interface FormListField {
  key: string;
  name: number;
}

export interface FormListOperations {
  add: (defaultValue?: unknown, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}
```

- `FormNamePath` 是 Form v3 所有字段定位接口的唯一公共路径类型。
- 数字段表示数组索引；实现不得把数字 `0` 与字符串 `"0"` 混为同一路径。
- `FormListField.key` 在条目移动时保持稳定，`name` 始终反映当前数组索引。

## 4. Form 与 Form.Item

`Form` 新增：

- `preserve?: boolean`：条件字段卸载后的默认保留策略，默认 `true`。

`Form.Item` 调整与新增：

- `name?: FormNamePath`：支持简单字符串和嵌套数组路径。
- `dependencies?: FormNamePath[]`：任一依赖字段真实改变后，重新校验当前字段。
- `preserve?: boolean`：覆盖 Form 的全局保留策略。

行为约束：

- 依赖字段变化只重新校验声明依赖的字段，不触发全表单重新校验。
- 依赖字段的程序化赋值同样触发依赖字段重新校验，但不触发 `onValuesChange`。
- `preserve={true}` 时，字段卸载后保留值和错误；重新挂载后恢复。
- `preserve={false}` 时，字段卸载后删除值、错误、校验中状态和字段注册信息。
- 字段级 `preserve` 优先于 Form 的全局设置。

## 5. FormInstance

以下方法的 `name` 或 `names` 参数升级为 `FormNamePath`：

- `getFieldValue(name)`
- `setFieldValue(name, value)`
- `getFieldError(name)`
- `setFieldErrors(name, errors)`
- `resetFields(names?)`
- `scrollToField(name)`

其余行为：

- `getFieldsValue()` 仍只返回当前已注册字段，以及因 `preserve={true}` 被保留的已卸载字段。
- `setFieldsValue(values)` 接受嵌套对象或数组，并只合并传入路径，不覆盖无关兄弟字段。
- `validateFields()` 校验全部当前已注册字段；失败结果中的 `errorFields[].name` 使用 `FormNamePath`。
- 后端错误可通过数组路径精确回填，例如 `setFieldErrors(["members", 1, "name"], ["名称已存在"])`。

## 6. Form.List

新增 `Form.List`：

```tsx
<Form.List name="members">
  {(fields, { add, remove, move }) => (
    // 渲染动态字段
  )}
</Form.List>
```

公共属性：

- `name: FormNamePath`：列表所在字段路径。
- `initialValue?: unknown[]`：仅当表单初始值未提供该路径时生效。
- `children: (fields: FormListField[], operations: FormListOperations) => ReactNode`。

操作行为：

- `add(defaultValue?, insertIndex?)`：默认在末尾新增；合法插入位置为 `0` 到当前长度，超出范围时夹紧到合法范围。
- `remove(index | index[])`：删除合法索引；重复、负数和越界索引被忽略。
- `move(from, to)`：两个索引均合法且不相等时移动；否则不改变数据。
- 新增、删除和移动均视为用户操作，触发一次 `onValuesChange`。
- 删除和移动必须同步迁移或清理相关字段错误、校验状态、依赖关系和字段节点。
- 列表操作后，提交值与当前可见顺序保持一致。

## 7. Form.useWatch

新增：

```ts
Form.useWatch(name: FormNamePath, form?: FormInstance): unknown
```

- 传入 `form` 时监听该控制对象；未传入时读取最近的 Form 上下文。
- 只在目标路径值发生实际变化时触发使用方重新渲染。
- 初次渲染返回当前字段值；路径不存在时返回 `undefined`。
- 用户输入、程序化赋值、重置和 Form.List 操作均可触发对应路径监听。
- 监听父路径时，任一后代路径改变都触发；监听后代路径时，无关兄弟字段改变不触发。
- 在 Form 上下文外且未传入 `form` 时抛出清晰的开发错误。

## 8. 数据、错误与路径迁移

- 内部允许使用可逆的路径编码建立 Map，但公共 API 不得暴露编码字符串。
- 删除对象字段时清理该字段及全部后代错误和状态。
- 删除列表项时清理该项状态，并把后续索引对应的状态迁移到新索引。
- 移动列表项时，值、错误和稳定 key 必须作为同一条目一起移动。
- `onValuesChange(changedValues, allValues)` 的 `changedValues` 保持与实际字段路径一致的嵌套结构。
- 条件字段采用 `preserve={false}` 卸载时属于字段生命周期清理，不触发 `onValuesChange`。

## 9. 无障碍与交互

- 嵌套路径生成的内部 DOM 标识必须稳定且合法，不直接拼接用户字段文本。
- 动态列表不强制规定新增、删除或排序按钮的视觉与文案；按钮由消费方提供并负责可访问名称。
- 后端错误、依赖校验错误继续使用 `role="alert"`、`aria-invalid` 和 `aria-describedby`。
- `scrollToField` 与 `scrollToFirstError` 必须支持嵌套路径和动态列表字段。

## 10. 文档示例

在保留现有 4 个 Demo 顺序与内容的基础上，新增一个“复杂表单联动”Demo，至少展示：

- 嵌套对象字段。
- 动态列表的新增、删除和移动。
- 依赖字段重新校验。
- `Form.useWatch` 控制条件字段。
- `preserve={false}` 条件字段清理。
- 数组路径的后端字段错误回填。

Demo 的实际预览、展示代码和复制代码继续读取同一个 TSX 源文件。

## 11. 测试矩阵

| 层级 | 必测内容 |
|---|---|
| 类型 | `FormNamePath`、嵌套实例方法、Form.List、dependencies、preserve、useWatch |
| 单元 | 嵌套读写与合并、字符串点号不解析、数组索引、列表增删移动和稳定 key |
| 校验 | 嵌套错误、依赖重新校验、后端数组错误、首错滚动 |
| 生命周期 | 表单级和字段级 preserve、卸载后恢复或清理 |
| 监听 | 初始值、用户输入、程序化赋值、重置、父子路径与无关兄弟字段 |
| 兼容 | Form v2 全部测试继续通过；简单字符串字段结果不变 |
| 文档 | 新 Demo 同源、API 元数据与 TypeScript 契约一致 |
| 浏览器 | 新 Demo 全链路、键盘、控制台及 1440/1024/375 无横向溢出 |

## 12. 发布门槛

- [ ] 契约经用户审阅确认。
- [ ] 实施计划经用户确认执行方式。
- [ ] 定向测试完成红灯到绿灯过程。
- [ ] `pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm api:validate` 通过。
- [ ] Form 文档页完成真实浏览器交互和三视口验收。
- [ ] 执行者最多声明 `candidate_pass`；独立最终验证保持 `pending`。
