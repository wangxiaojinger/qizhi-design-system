# QIZHI Divider v1 契约

## 证据与范围

Divider v1 迁移自静态规范站 `#components-divider`，保留“基本用法”“带有文字的分割线”“竖直分割线”三组 Demo。列表缩进属于消费场景布局，不进入公共 API。

## 公共 API

- `type`: `"horizontal" | "vertical"`，默认 `"horizontal"`。
- `lineStyle`: `"solid" | "dashed" | "dotted"`，默认 `"solid"`。
- `orientation`: `"left" | "center" | "right"`，默认 `"center"`，仅水平且有文字时生效。
- `children`: 水平分割线文字；垂直分割线不渲染文字。
- 继承原生 `div` 属性，支持 `className`、`style`、`ref` 和 `aria-*`。

## 语义与 DOM

根节点为 `div[role="separator"]`，`aria-orientation` 始终与 `type` 一致。文字放在 `.qizhi-divider__text` 中。公共类名只使用 `qizhi-*`。

## v1 不支持

不提供尺寸、颜色、边距、HTML 标签替换或垂直文字 API。自定义颜色和业务偏移通过消费场景的 `className` 与 CSS Token 覆盖完成。
