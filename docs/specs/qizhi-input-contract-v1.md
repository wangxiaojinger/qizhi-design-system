# QIZHI Input v1 契约

## 证据与范围

Input v1 迁移自静态规范站 `#component-input` 的 14 组 Demo，公共组件族包含 `Input`、`Input.Search`、`Input.TextArea`、`Input.Password` 和 `Input.Group`。InputNumber、InputTag、VerificationCode 属于独立组件，不进入本契约。

## 公共能力

- 原生 input/textarea 属性、受控与非受控值、事件和 ref。
- `mini`、`small`、`default`、`large` 四种尺寸，分别为 24、28、32、36px。
- `default`、`error`、`warning` 状态；错误状态同步 `aria-invalid`。
- 普通可编辑 Input 默认允许清空；disabled、readOnly、Search Loading、字数统计和 Password 按交互语义处理清空入口。
- `prefix`、`suffix`、`addBefore`、`addAfter` 和紧凑 Group。
- 通过公共 `style.height` 设置组合输入框高度时，输入框与前后附加项保持等高。
- 字数限制、超限只报错、TextArea 自动高度、Password 可见性、Search Loading、值格式化和自动宽度。

## 行为优先级

- disabled 高于清空、搜索和输入行为。
- readOnly 保持可聚焦和可复制，但不显示清空入口。
- `maxLength.errorOnly` 不截断输入，超限后设置错误视觉和 `aria-invalid`。
- Search Loading 阻止按钮和 Enter 重复触发 `onSearch`。
- Password 切换可见性后焦点返回原输入框。
- normalize 仅在指定触发时机运行，结果变化时报告 `onChange`。

## DOM 和样式契约

- Input、Search、Password 与 TextArea 的视觉边界使用内部统一结构标记 `qizhi-control-container`。
- 外层控件容器承担尺寸、边框、圆角、背景以及 hover、focus、disabled、error、warning 状态；内部原生 `input` / `textarea` 只承担值、焦点、事件、ref 和原生语义。
- TextArea 的内部计数器位于视觉容器内；`wordLimitPlacement="outside"` 时计数器位于视觉容器外，但仍属于 TextArea 组件。
- TextArea 的 disabled、readOnly 状态由组件根节点状态类统一驱动，不依赖 Demo 容器补样式。
- 统一结构不新增公共 Props；现有 `className`、`style`、ref 与事件类型保持不变。

## 文档与消费

每个 Demo 的预览与 TSX 来自同一模块；Demo CSS 来自同一共享 CSS 文件并可独立查看、复制。尺寸选项复用公共 `Radio.Group`，自定义高度滑杆保留原生 `range` 作为文档控制器，因为当前公共导出中没有 Slider。独立 smoke 应用必须通过 `@wangxiaojinger/qizhi-react` 与 `@wangxiaojinger/qizhi-react/style.css` 的公开 exports 消费正式构建产物，不得使用根 Vite alias。

## v1 不支持

不提供 InputNumber、InputTag、VerificationCode 的行为，不新增无 QIZHI 证据的主题和边框类型。
