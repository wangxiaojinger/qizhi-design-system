# QIZHI AutoComplete v1 组件契约

## 能力边界

- 支持受控和非受控输入值。
- 支持 `data` 和 `AutoComplete.Option` 两种候选声明方式。
- 支持自定义候选内容、分组、禁用候选和自定义输入组件。
- 支持默认包含过滤、严格区分大小写、自定义过滤以及关闭默认过滤。
- 支持鼠标选择、Enter 选择、Escape 关闭和上下方向键导航。
- 候选弹层使用 `listbox/option` 语义，不复用 `Dropdown.Menu`。

## 复用边界

- 默认输入复用 `Input`，自定义文本域 Demo 复用 `Input.TextArea`。
- 查询模式复用 `SearchIcon`。
- 复杂用法的提示浮层复用 `Popover` 的 tooltip 语义。

## DOM 和样式契约

- 默认 AutoComplete 通过正式 Input 继承 `qizhi-control-container`，由 Input 外层承担完整盒模型；候选弹层通过 Portal 挂载到 `document.body`，并根据视口空间在输入框上下翻转。
- 自定义 `triggerElement` 保留调用方提供的结构和视觉，组件只注入 value、事件、ref 与 combobox ARIA，不额外包一层输入边框。
- 统一结构不新增公共 Props，现有 TypeScript API 和官网 API 元数据保持不变。
