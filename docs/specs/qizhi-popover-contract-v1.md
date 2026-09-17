# QIZHI Popover API 契约 v1

状态：已审定  
负责人：QIZHI Design System  
证据日期：2026-08-21

## 1. 目标与边界

- 迁移旧站“基础用法”“触发方式”“位置”“浮层内关闭”4 个 Demo。
- v1 支持任意单一 React 触发元素、4 种触发方式、12 个方位和受控/非受控显示。
- v1 不提供颜色、自定义箭头、延迟、自动销毁或其他无 QIZHI 证据的能力。

## 2. 能力决策

| 能力 | 决策 | 契约结论 |
|---|---|---|
| 标题与内容 | 保留 | `title?: ReactNode`、`content: ReactNode` |
| 触发方式 | 保留 | `hover / click / focus / contextMenu`，默认 `hover` |
| 方位 | 保留 | 12 方位，默认 `top` |
| 显示状态 | 保留 | `popupVisible / defaultPopupVisible / onVisibleChange` |
| 浮层挂载容器 | 保留 | `getPopupContainer`，默认挂载到 `document.body` |
| 弹层语义 | 保留 | `role?: "tooltip" | "dialog" | "menu"` |
| 浮层样式扩展 | 待定 | v1 不导出 |

## 3. 公共 API

| 属性 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `children` | `ReactElement` | — | 唯一触发元素，保留原有事件与 ref |
| `title` | `ReactNode` | — | 浮层标题；空值不渲染标题节点 |
| `content` | `ReactNode` | — | 浮层内容 |
| `trigger` | `PopoverTrigger` | `"hover"` | 触发方式 |
| `position` | `PopoverPosition` | `"top"` | 浮层相对触发器的方位 |
| `popupVisible` | `boolean` | — | 受控显示状态 |
| `defaultPopupVisible` | `boolean` | `false` | 非受控初始状态 |
| `onVisibleChange` | `(visible: boolean) => void` | — | 显示状态请求变化时回调 |
| `getPopupContainer` | `(trigger: HTMLElement) => Element` | `() => document.body` | 返回浮层挂载容器 |
| `role` | `"tooltip" | "dialog" | "menu"` | `"tooltip"` | 浮层语义 |

`PopoverPosition` 为 `topLeft | top | topRight | bottomLeft | bottom | bottomRight | leftTop | left | leftBottom | rightTop | right | rightBottom`。

## 4. DOM、交互与无障碍

- 触发元素增加 `aria-expanded`、`aria-controls`，非 tooltip 角色增加 `aria-haspopup`。
- 浮层默认通过 Portal 挂载到 `document.body`；可通过 `getPopupContainer` 指定其他挂载容器，定位仍使用视口 fixed 坐标。
- click/contextMenu 支持外部点击关闭；Escape 关闭并恢复触发器焦点。
- hover 触发器与 Portal 浮层之间保留可操作的移入路径；focus 在焦点离开触发器与浮层后关闭。
- 位置计算保留 12 个方向，同时将浮层边界限制在视口 8px 安全区内。
- 动效兼容 `prefers-reduced-motion: reduce`。

## 5. Demo 与发布门槛

- Demo 顺序与旧站一致：基础用法、触发方式、位置、浮层内关闭。
- 全部 Demo 使用 `Button`，触发方式行使用 `Space`；不添加 Tag 或额外图标。
- 位置 Demo 在窄屏下自适应，不保留旧站的页面横向溢出。
- 类型检查、单元测试、文档测试、构建和 1440/1024/375 浏览器验收是交付门槛；执行者结论最多为 `candidate_pass`。
