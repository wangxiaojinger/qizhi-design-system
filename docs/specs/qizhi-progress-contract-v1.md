# QIZHI Progress API 契约 v1

状态：已审定  
证据日期：2026-08-25

## 1. 目标与边界

- 将旧规范站 Progress 沉淀为 `@wangxiaojinger/qizhi-react` 正式组件。
- v1 保留线形、环形、微型、状态、尺寸、动画、渐变、步骤和剩余色。
- v1 不提供无旧站证据的 `format`、`showText`、`width` 或点击事件。

## 2. 证据与可见元素映射

| 旧站证据 | React 决策 |
|---|---|
| 9 个 Demo 的标题、说明、顺序和数值 | 逐字、逐顺序保留 |
| 线形、环形和步骤轨道 | 由公共 Progress 渲染 |
| 状态图标 | 由 Progress 内部渲染，Demo 不自写 SVG |
| 尺寸切换 | 复用公共 DemoSegmentedControl |
| 查看/复制操作区 | 复用 Button Demo 公共基线 |
| Demo 文件名、语言徽标、额外工具栏 | 禁止新增 |

## 3. 公共 API

| 属性 | 类型 | 默认值 | 规则 |
|---|---|---|---|
| `percent` | `number` | `0` | 渲染时限制到 0–100 |
| `type` | `"line" \| "circle"` | `"line"` | 线形或环形 |
| `status` | `"normal" \| "warning" \| "danger" \| "success"` | `"normal"` | 状态色与状态图标 |
| `size` | `"small" \| "default" \| "large" \| "mini"` | `"default"` | `mini` 仅用于环形 |
| `color` | `string \| Record<number, string>` | `undefined` | 自定义色优先于 `status` |
| `trailColor` | `string` | `undefined` | 剩余轨道色 |
| `animation` | `boolean` | `false` | 仅线形生效 |
| `steps` | `number` | `undefined` | 正数时将线形渲染为分段 |
| `stepWidth` | `number` | `undefined` | 固定步骤段宽并使整体宽度自适应 |
| `strokeWidth` | `number` | 由尺寸决定 | 控制轨道粗细 |

根节点继承 `HTMLAttributes<HTMLDivElement>`，支持 `className`、`style`、`ref`
与 `aria-label`。`color` 为渐变对象时按数字键排序。

## 4. DOM、状态与无障碍

- 根节点为 `div[role="progressbar"]`，设置 `aria-valuemin/max/now`。
- 线形使用轨道与填充子节点；步骤模式使用分段子节点。
- 环形使用 SVG 圆环；SVG 是公共组件实现，不暴露给 Demo。
- `success`、`warning`、`danger` 显示公共 QIZHI 图标；其他状态显示百分比。
- 动画在 `prefers-reduced-motion: reduce` 下停止。

## 5. Demo 顺序

1. 基本用法
2. 进度条状态
3. 环形进度条
4. 微型进度条
5. 不同尺寸
6. 动画效果
7. 渐变色进度条
8. 步骤进度条
9. 剩余进度条

## 6. 验收边界

- 类型、实现、API 元数据、Demo 与复制源一致。
- 1440、1024、375 三档检查尺寸、切换、溢出、控制台和局部截图。
- 自动化通过后最多标记 `candidate_pass`，独立最终验收保持 `pending`。
