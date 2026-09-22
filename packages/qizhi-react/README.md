# @wangxiaojinger/qizhi-react

QIZHI Design System 的正式 React 组件包。

## 安装

```bash
pnpm add @wangxiaojinger/qizhi-react
```

## 使用

```tsx
import { Button } from "@wangxiaojinger/qizhi-react";
import "@wangxiaojinger/qizhi-react/style.css";

export function Example() {
  return <Button type="primary">确认</Button>;
}
```

该包要求 React 和 React DOM 19 或更高版本。

## 图标来源

标准界面图标默认优先使用公开的 [Remix Icon](https://remixicon.com/) `ri-*` 资产。Remix Icon 中没有语义匹配的图标，或场景明确需要启智专属业务、多色、品牌图形时，再从独立入口导入启智图标资产：

```tsx
import { ArrowDownIcon } from "@wangxiaojinger/qizhi-react/icon";
```

业务代码不得使用字符、Unicode 符号、Emoji、CSS 绘制、硬编码 SVG path 或 data URL 临时创造图标；两个图标库均无法满足时，应补充经过审核的 SVG 资产或 React 图标组件。
