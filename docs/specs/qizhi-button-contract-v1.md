# QIZHI Button API 契约 v1

状态：已由用户于 2026-08-18 确认。

## 目标

以 Arco Design React Button 的公开属性、默认值和调用方式为参考，将经过 QIZHI 业务审定的 Button 能力沉淀为 `@wangxiaojinger/qizhi-react` 的正式组件。QIZHI 在无障碍、链接与原生按钮的 TypeScript 联合类型和 AI 结构化元数据方面采用更严格规则。

## Button 契约

- `type`: `default | primary | secondary | dashed | text`，默认 `default`，视觉等同 `secondary`。`secondary` 是中性线框次要按钮，背景透明、边框使用中性色；不再提供单独的品牌色线框按钮类型。
- `size`: `mini | small | default | large`，默认 `default`。
- `status`: `default | warning | danger | success`，默认 `default`。
- 普通按钮与纯图标按钮统一使用方形圆角，不提供 `shape` 属性。
- 支持 `icon`、`iconOnly`、`loading`、`loadingFixedWidth`、`long`、`disabled`。
- 无 `href` 时渲染 `<button>`，`htmlType` 默认为 `button`。
- 有 `href` 时渲染 `<a>`，支持 `target`、`anchorProps`，类型层禁止 `htmlType`。
- 支持 `children`、`className: string | string[]`、`style`、与实际元素匹配的 `onClick`、原生属性和 ref。
- `loading` 阻止重复点击并设置 `aria-busy`，但不通过原生 disabled 移除现有焦点。
- 禁用链接移除 `href`，设置 `aria-disabled=true` 和 `tabIndex=-1`。
- `_blank` 链接在调用方未提供安全 rel 时补充 `noopener noreferrer`。
- 纯图标按钮必须具有可访问名称；开发环境对缺失名称发出警告。

## 官网与元数据

Demo 顺序为：基本用法、图标按钮、按钮形状、按钮尺寸、按钮状态、禁用按钮、加载中按钮、长按钮、API。Demo 直接调用 `@wangxiaojinger/qizhi-react`，预览与展示代码来自同一源码。

TypeScript 契约为唯一行为来源；结构化元数据包含 `name`、`description`、`type`、`defaultValue`，供官网 API 表、搜索与后续 AI Skill 使用。

## 发布门槛

- 类型检查、单元测试、构建通过。
- 包构建产物可导入，样式入口有效。
- 官网 Demo、API 表和导出类型一致。
- 1440、1024、375 三个视口无横向溢出，焦点、禁用、加载和链接行为通过浏览器验收。
