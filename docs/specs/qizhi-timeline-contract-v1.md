# QIZHI Timeline API 契约 v1

状态：已审定  
负责人：Iris  
证据日期：2026-08-24

## 1. 目标与边界

- 将旧规范站 9 个 Timeline Demo 迁移为 `@wangxiaojinger/qizhi-react` 正式组件。
- v1 支持纵向、横向、左右、交替、倒序、自定义节点、轴线、幽灵节点和标签位置。
- v1 不提供节点点击、时间解析、自动排序、加载完成回调或旧站未展示的组合能力。

## 2. 公共 API

`Timeline`：`children`、`direction`、`mode`、`reverse`、`labelPosition`、
`pending`、`pendingDot`、`className`、`style`、`ref`。

`TimelineItem`：`children`、`label`、`description`、`dot`、`dotColor`、
`dotType`、`lineType`、`position`、`className`、`style`、`ref`。

默认值：

- `direction="vertical"`
- `mode="left"`
- `reverse=false`
- `labelPosition="same"`
- `dotType="hollow"`
- `lineType="solid"`

组合规则：

- `dot` 高于 `dotColor` 和 `dotType`。
- `position` 仅在 `mode="alternate"` 时改变单项位置。
- `mode` 仅影响纵向时间轴；横向时降级为横向默认布局。
- `labelPosition` 控制标签与内容的 DOM 顺序。

## 3. DOM、样式和无障碍

- `Timeline` 根节点使用 `role="list"`；`TimelineItem` 使用 `role="listitem"`。
- 内容 14px/20px，标签 12px/17px，内容区间距 4px。
- 默认圆点 12px，轴线 2px；普通纵向前序项最小高度 72px。
- Pending 图标动效兼容 `prefers-reduced-motion: reduce`。
- Demo 布局类不属于公共 API。

## 4. Demo 原始契约

顺序固定为：基础用法、自定义节点内容、自定义节点、自定义轴线样式、
幽灵节点、时间轴展示类型、纵向时间轴、横向时间轴、标签文本位置。

标题、说明、数据、日期、英文文案、重复文案和 Reverse 初始关闭状态均按旧站保留。

## 5. 同源与测试

- 每个 Demo 使用独立 TSX 文件并真实导入 `@wangxiaojinger/qizhi-react`。
- 预览直接渲染该文件；展示代码与复制代码读取同一 `?raw` 源文件。
- 类型、运行时、API 元数据、Demo 和复制源码保持一致。
- 测试锁定 API、9 个 Demo 原始顺序与文案、Reverse 行为、节点优先级、
  三档视口几何、溢出、控制台和截图人工对照。

