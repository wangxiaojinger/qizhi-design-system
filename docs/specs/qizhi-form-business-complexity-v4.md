# QIZHI Form 真实业务复杂度契约 v4

状态：已确认并实施（candidate_pass，独立最终验证 pending）
负责人：林猫猫
设计日期：2026-09-24

## 1. 目标

在 Form v3 已具备嵌套字段、条件字段、依赖校验和动态列表的基础上，补齐真实网络业务中的异步一致性、远程候选状态、错误分层、未保存修改判断，以及多类输入控件的统一联动。

完成后必须满足：

- 字段联动隐藏内容时不会提交失效值。
- 条件字段的保留与删除由 `preserve` 明确控制。
- 同一字段的异步校验只允许最新一次结果生效。
- AutoComplete 能展示加载、空结果、失败和重试。
- 网络错误进入表单级异常通道，不显示成字段内容错误。
- 消费方能够判断表单是否存在未保存修改，并在保存后更新干净基线。
- 多层对象能够正确提交、局部重置和整体重置。
- Input、Select 和 AutoComplete 均能作为 Form.Item 控件并参与字段联动。

## 2. 范围边界

本阶段包含：

- Form 异步校验竞态治理。
- 字段校验错误与网络/系统异常分流。
- Form 脏状态查询、订阅和基线更新。
- AutoComplete 远程查询四态展示。
- 三类输入控件的统一联动 Demo 与测试。
- 多层数据提交和重置验收。

本阶段不包含：

- 多步骤表单、草稿持久化、批量编辑。
- 请求库、缓存、自动防抖、自动重试或服务端接口封装。
- 路由框架集成和强制导航拦截。
- 动态字段列表的新功能；Form.List 已提前实现，只做兼容回归。

## 3. 兼容性原则

- Form v2、v3 的既有公共接口和默认行为保持兼容。
- 既有校验器抛出普通 `Error` 时继续作为字段内容错误处理。
- 网络异常必须显式使用带类型的失败结果，避免通过错误文案猜测错误类别。
- AutoComplete 的静态数据、过滤、分组、自定义触发器和键盘行为保持不变。
- 组件只表达状态和事件，不直接发起网络请求，不引入请求依赖。

## 4. 异步校验与错误分层

新增公共类型：

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

`FormRule.validator` 扩展为：

```ts
validator?: (
  value: unknown,
  values: FormValues,
) => void | FormRuleFailure | Promise<void | FormRuleFailure>;
```

`Form` 新增：

```ts
onValidationException?: (exception: FormValidationException) => void;
```

行为规则：

- 普通同步规则失败和 `type: "field"` 的结果写入字段错误。
- 为兼容既有消费方，校验器抛出的普通 `Error` 继续作为字段错误。
- `type: "network"` 的结果不写入字段错误，通过 `onValidationException` 上报。
- 网络异常不会让字段获得 `aria-invalid="true"`，也不会进入 `validateFields()` 的 `errorFields`。
- 每个字段维护单调递增的校验版本。开始新校验、字段卸载或字段重置时，旧版本立即失效。
- 只有仍为最新版本的校验可以写入错误和结束 `validating` 状态；旧请求成功或失败均不得覆盖新状态。
- `validateFields()` 遇到最新网络异常时向调用方抛出该异常，不调用 `onFinishFailed`；表单提交路径仍通过 `onValidationException` 通知消费方。

## 5. 未保存修改

`FormInstance` 新增：

```ts
isFieldsDirty: (names?: FormNamePath[]) => boolean;
markFieldsClean: (names?: FormNamePath[]) => void;
```

`Form` 新增：

```ts
Form.useDirty(form?: FormInstance): boolean;
```

行为规则：

- 脏状态表示当前值与最近一次干净基线不同，使用结构值比较，不依赖是否触发过输入事件。
- 初始干净基线来自 `initialValues`。
- 用户输入、`setFieldValue`、`setFieldsValue`、Form.List 操作及条件字段删除都重新计算脏状态。
- `resetFields()` 恢复初始值；当全部相关值与基线一致时，脏状态恢复为 `false`。
- `markFieldsClean()` 把当前值写入干净基线，用于保存成功后继续编辑；传入字段路径时只更新指定路径。
- `Form.useDirty()` 仅在布尔结果变化时重新渲染。在 Form 外调用时必须显式传入实例。
- 组件不主动绑定 `beforeunload`。文档 Demo 展示消费方如何根据 `Form.useDirty()` 添加和清理离开页面提醒。

## 6. AutoComplete 远程查询状态

`AutoCompleteProps` 新增：

```ts
loading?: boolean;
emptyContent?: ReactNode;
error?: ReactNode;
onRetry?: () => void;
```

显示优先级：

1. `loading=true`：显示“正在加载”，容器使用 `role="status"` 和 `aria-live="polite"`。
2. `error` 有值：显示错误内容；提供 `onRetry` 时显示“重试”按钮。
3. 查询文本非空且候选为空：显示 `emptyContent`，默认“暂无匹配结果”。
4. 有候选项：显示正常列表。

其他约束：

- 四种状态均在现有弹层内展示，输入框保持可编辑。
- 加载和失败状态不允许键盘误选旧候选项。
- 重试按钮支持键盘操作，并调用一次 `onRetry`；组件不自动重复请求。
- 查询为空时默认不打开状态弹层，消费方可通过输入后显示远程状态。
- 错误内容由消费方提供，组件不展示底层异常、请求地址或敏感数据。

## 7. 字段联动和多层数据

- Input、Select 和 AutoComplete 必须遵循 `value`、`onChange`、`onBlur`、`status` 以及无障碍属性的 Form.Item 注入约定。
- 三类控件的用户变化都进入 `onValuesChange`，触发依赖校验和 `Form.useWatch`。
- 条件字段隐藏时，`preserve={false}` 删除字段值及全部后代状态；`preserve={true}` 保留并在重新挂载后恢复。
- 多层对象提交保持真实对象结构，不暴露内部路径编码。
- `resetFields([parentPath])` 恢复该父路径的完整初始子树，并清理该子树的字段错误、校验版本和校验中状态。
- 无参数 `resetFields()` 恢复完整初始值树，包括此前因 `preserve={false}` 卸载的初始字段，并重新计算相对当前干净基线的脏状态。

## 8. 文档示例

在 Form 文档页增加“远程联动与未保存修改”Demo，展示：

- Select 控制服务类型，隐藏时清理远程地址和区域候选。
- Input 输入服务名称并触发可控的异步校验竞态示例。
- AutoComplete 作为 Form.Item 字段，依次可切换加载、空结果、失败、重试和成功候选。
- 网络失败展示为表单级提示，不把 AutoComplete 标记成字段内容错误。
- 页面显示“有未保存修改/所有修改已保存”，保存动作调用 `markFieldsClean()`。
- 多层数据提交、局部重置和全部重置结果可观察。
- Demo 预览、展示代码和复制代码继续使用同一 TSX 源文件。

## 9. 测试矩阵

| 层级 | 必测内容 |
|---|---|
| 类型 | 新校验失败类型、异常回调、脏状态实例方法与 Hook、AutoComplete 四态属性 |
| 校验 | 慢旧请求不能覆盖快新请求；卸载和重置使旧请求失效；网络异常不进入字段错误 |
| 脏状态 | 初始干净、用户及程序化修改、条件字段删除、列表变化、局部/全部重置、保存后更新基线 |
| 自动补全 | 加载、空结果、失败、重试、成功候选、键盘和无障碍状态 |
| 控件集成 | Input、Select、AutoComplete 都能修改表单值并触发联动 |
| 嵌套数据 | 多层提交、父路径局部重置、全部重置、错误和校验状态清理 |
| 兼容 | Form v2/v3、AutoComplete v1 和 Form.List 既有测试继续通过 |
| 浏览器 | 新 Demo 全链路；1440×900、1024×900、375×812；真实键盘、无横向溢出、无新增控制台错误 |

## 10. 完成门槛

- [x] 契约经用户审阅确认。
- [x] 实施计划经用户确认。
- [x] 每项新增行为完成红灯到绿灯过程。
- [x] `pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm api:validate` 通过。
- [x] Form 与 AutoComplete 定向测试通过。
- [x] 新 Demo 完成三视口真实浏览器验收。
- [x] 执行者声明 `candidate_pass`；独立最终验证保持 `pending`。
