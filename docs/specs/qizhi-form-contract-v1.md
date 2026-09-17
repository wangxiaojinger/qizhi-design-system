# QIZHI Form API 契约 v1

状态：已审定  
负责人：林猫猫  
证据日期：2026-08-24

## 1. 目标与边界

- 用户任务：将旧规范站 Form 的 3 个 Demo 迁移为正式 React 组件和文档岛。
- 业务场景：组织字段标签、必填标记、辅助说明以及垂直/水平布局。
- v1 解决的问题：提供正式 `Form` 和 `Form.Item` 布局组件，复用现有输入组件，并保留旧站 Demo 契约。
- v1 明确不解决的问题：字段注册、统一 values store、内建校验、`setFieldsValue`、异步提交和刷新请求。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 原规范站 Demo | `index.html#component-form` | 3 个 Demo 的标题、说明、顺序、字段、初始状态和布局 | 完整 Form 状态管理 API |
| 原规范站样式 | `styles.css` 的 `.qizhi-form-*` | 606/710/558px、24/8/4px 和响应式布局 | 可直接公开的 React Props |
| 原规范站脚本 | `script.js#initFormDemos` | 字数、布局、分段和刷新动画 | 统一收集、校验和提交行为 |
| 正式组件包 | `packages/qizhi-react/src/index.ts` | 可复用 Input、Select、Button、Radio、Tooltip 和图标 | 已存在 Form 或 Segmented |

## 3. 能力决策

| 能力 | 决策 | 契约结论 | 依据 |
|---|---|---|---|
| 垂直布局 | 保留 | `layout="vertical"`，默认值 | 旧站基础用法 |
| 水平布局 | 保留 | `layout="horizontal"` | 旧站表单布局 |
| 字段标签 | 保留 | `Form.Item label` | 3 个 Demo |
| 必填标记 | 保留 | `Form.Item required` 只表达视觉和语义 | 3 个 Demo |
| 辅助说明 | 保留 | `Form.Item extra` | 服务名称字段 |
| 原生表单属性 | 保留 | 根节点继承 `FormHTMLAttributes` | 旧站使用 `<form>` |
| 统一值管理 | 待定 | 不进入 v1 | 旧站没有运行时证据 |
| 内建校验/提交 | 待定 | 不进入 v1 | 旧站没有运行时证据 |

## 4. 公共 API

| 属性 | 类型 | 默认值 | 描述 | 组合/互斥规则 |
|---|---|---|---|---|
| `layout` | `"vertical" | "horizontal"` | `vertical` | 字段排列方式 | 水平布局在窄屏回退单列 |
| `children` | `ReactNode` | — | Form 内容 | — |
| `className` | `string` | — | 根 form 类名 | 与公共类名合并 |
| `style` | `CSSProperties` | — | 根 form 样式 | — |

`Form.Item`：

| 属性 | 类型 | 默认值 | 描述 | 组合/互斥规则 |
|---|---|---|---|---|
| `label` | `ReactNode` | — | 字段标签 | 缺省时不渲染标签节点 |
| `required` | `boolean` | `false` | 显示必填标记并为字段组设置语义 | 不触发校验 |
| `extra` | `ReactNode` | — | 主控件下方的辅助说明 | 缺省时不渲染说明节点 |
| `children` | `ReactNode` | — | 字段主控件 | — |
| `className` | `string` | — | 字段根节点类名 | 与公共类名合并 |
| `style` | `CSSProperties` | — | 字段根节点样式 | — |

- 根元素：`<form>`，ref 指向 `HTMLFormElement`。
- `Form.Item` 根元素：`<div role="group">`。
- 受控状态：由 Demo 和被组合组件的 `value/onChange` 管理，Form v1 不持有字段值。

## 5. DOM 和样式契约

- Form 公共类：`qizhi-form`、`qizhi-form-layout-vertical`、`qizhi-form-layout-horizontal`。
- Item 公共类：`qizhi-form-item`、`qizhi-form-item-label`、`qizhi-form-item-control`、`qizhi-form-item-extra`。
- 垂直最大宽 606px，水平最大宽 710px；字段间距 24px。
- 标签与控件间距 8px；主控件与辅助说明间距 4px。
- 水平标签列 112px；720px 以下回退单列。
- Demo 专属宽度和组合布局不得暴露为 Form 公共 API。

## 6. 交互和状态

Form 本身不引入交互状态。Input、Select、Button、Radio 和 Tooltip 的 hover、active、focus、disabled 等状态由各正式组件负责。

## 7. 键盘与无障碍

- 根节点保留原生 form 语义及原生属性。
- Item 以 `role="group"` 组织标签和主控件；标签通过稳定 ID 与 `aria-labelledby` 关联。
- `required` 只增加可见星号和 `aria-required="true"`，不声称原生输入已自动 required。
- 键盘行为由子组件契约负责。

## 8. Demo 与 API 元数据

- Demo 顺序：基础用法、表单布局、受控表单。
- 标题、说明、字段顺序、选项、占位文案和初始状态必须逐字保留。
- 每个 Demo 为独立 TSX；预览、展示代码和复制代码读取同一 raw 源文件。
- API 表只列出本契约已审定的 Form 和 Form.Item 能力。

## 9. 测试矩阵

| 层级 | 必测内容 |
|---|---|
| 类型 | `layout` 值域、原生 form 属性、ref、Form.Item 属性 |
| 单元 | 根 DOM、默认/水平类名、字段标签、必填标记、辅助说明、ref |
| 文档 | 3 个 Demo 顺序和原文、正式导入、源码同源、API 一致 |
| E2E | 字数、Select、布局切换、受控字段、Tooltip、几何、三视口、控制台 |

## 10. 发布门槛

- [x] 契约已由用户确认。
- [ ] 类型检查、单元测试和构建通过。
- [ ] 包产物可导入，样式入口有效。
- [ ] 官网消费正式包，Demo 和展示源码同源。
- [ ] 1440/1024/375、键盘、截图和控制台完成验收。

