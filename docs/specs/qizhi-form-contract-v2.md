# QIZHI Form API 契约 v2

状态：已审定
负责人：林猫猫
证据日期：2026-09-24

## 1. 目标与边界

- 用户任务：在不改变 Form v1 布局与旧 Demo 可见内容的前提下，补齐数据录入的基础业务闭环。
- 业务场景：字段收集、前端校验、提交、后端字段错误回填、修改后清理失效错误。
- v2 第一期解决：简单字符串字段名、初始值、字段值收集、同步/异步校验、提交成功/失败回调、后端字段错误、重置、首错定位与无障碍关联。
- 第一期明确不解决：嵌套字段路径、动态字段列表、跨字段依赖、条件字段保留、异步校验防抖与竞态管理、远程候选查询状态。

## 2. 能力决策

| 能力 | 决策 | 契约结论 |
|---|---|---|
| v1 布局、标签、必填标记和辅助说明 | 保留 | 原 DOM 与样式契约保持兼容 |
| 表单控制对象 | 新增 | `Form.useForm()` 返回稳定的 `FormInstance` |
| 字段注册与收集 | 新增 | 仅 `Form.Item name` 参与表单数据 |
| 声明式校验 | 新增 | 支持 required/min/max/length/pattern/validator |
| 后端字段错误 | 新增 | `setFieldErrors(name, errors)` 回填，字段真实改变后清理 |
| 提交 | 新增 | 校验通过调用 `onFinish`，失败调用 `onFinishFailed` |
| 重复提交 | 新增 | `onFinish` 返回的 Promise 未结束时忽略重复提交 |
| 多层路径与动态列表 | 待定 | 不进入第一期 |

## 3. 公共 API

`Form`：

- `form?: FormInstance`：外部表单控制对象。
- `initialValues?: Record<string, unknown>`：字段初始值。
- `onValuesChange?: (changedValues, allValues) => void`：用户改变字段后触发。
- `onFinish?: (values) => void | Promise<void>`：校验通过后触发。
- `onFinishFailed?: (result) => void`：校验失败后触发。
- `scrollToFirstError?: boolean`：提交失败后定位并聚焦第一个错误字段。

`Form.Item`：

- `name?: string`：第一期仅支持简单字符串字段名。
- `rules?: FormRule[]`：校验规则。
- `validateTrigger?: "onChange" | "onBlur"`：默认 `onChange`。
- `validateStatus?: "default" | "validating" | "success" | "warning" | "error"`：手动状态优先于自动状态。
- `help?: ReactNode`：手动帮助文案优先于自动错误文案。
- `required`：继续只负责可见标记和语义；真实必填校验由 `rules` 决定。

`FormInstance`：

- `getFieldsValue`、`getFieldValue`
- `setFieldsValue`、`setFieldValue`
- `getFieldError`、`setFieldErrors`
- `validateFields`、`resetFields`、`scrollToField`、`submit`

## 4. 交互、错误与无障碍

- 子控件值变化后，Form 更新字段值并保留子控件原有事件。
- `onChange` 触发的前端校验错误通过后自动清除。
- `setFieldErrors` 写入的后端错误只在该字段真实变化时清除。
- 错误文案以 `role="alert"` 暴露，并通过 `aria-describedby` 与子控件关联。
- 错误字段自动获得 `aria-invalid="true"`。
- `scrollToField` 定位 Form.Item 容器，然后聚焦容器内第一个可聚焦表单控件。

## 5. 测试与发布门槛

- 单元测试覆盖：字段收集、值变化、同步/异步校验、提交分支、后端错误清理、重置、首错聚焦和无障碍关联。
- 类型测试覆盖新增公共契约。
- 文档 API 元数据与 TypeScript 契约保持一致，旧 Demo 顺序与可见内容不变。
- 交付前执行 `pnpm typecheck`、`pnpm test`、`pnpm build`，并完成 Form 文档页真实浏览器验收。
