# QIZHI Token 第二阶段 B：Overlay 组件 Token 正式接入设计

## 目标

在不改变 Tooltip、Popover、Dropdown 的公共 API、DOM 语义、触发方式、定位算法和默认视觉的前提下，为三者建立独立、稳定、可覆盖的 Component Token，并保留现有公共变量与 Tooltip 实例颜色的覆盖能力。

本阶段完成后：

- 消费者可以只覆盖某个组件的公开变量，不影响另外两个 Overlay 组件；
- 旧公共颜色、圆角、阴影、字号、间距和动效变量仍能沿 Component Token 默认值驱动组件；
- Tooltip 的 `color` 属性继续优先于默认背景 Token；
- 三个组件及其主要下游消费者在 1440、1024、375px 下保持现有交互、几何和视觉。

## 已确认现状

- 当前 Token 清单没有 `component.tooltip.*`、`component.popover.*` 或 `component.dropdown.*`。
- Tooltip 与 Popover 使用 `position: fixed` 并挂载到 Portal；两者当前层级均为 1200。
- 当前通用层级仅有 `z.index.tooltip = 1200`，没有语义独立的 Popover 层级 Token；本阶段补充 `z.index.popover = 1200`，避免 Popover 错误依赖 Tooltip 的变量。
- Dropdown 使用组件内部的 `position: absolute`，当前层级为 20；它不是 Portal，不能与 Tooltip、Popover 强制共用层级。
- Tooltip 通过内部变量 `--qizhi-tooltip-bg` 支持 `color` 属性覆盖，箭头与主体共享该变量。
- Popover 的主体与箭头共享背景及边框，但宽度、阴影和箭头几何与 Tooltip 不同。
- Dropdown 的当前有效阴影来自旧变量 `--shadow`；直接改用 `--shadow-popup` 会改变默认计算值，不能在本阶段替换。
- Tooltip、Popover、Dropdown 已分别具有组件测试、文档测试和三档 Playwright 契约；BusinessObjects、Table、LogViewer、SideNavigation、Input 等存在直接下游消费。

## 方案选择

采用三个独立组件命名空间：

- `component.tooltip.*`
- `component.popover.*`
- `component.dropdown.*`

不建立统一的 `component.overlay.*`。三者在挂载方式、层级、尺寸、内容密度和箭头结构上没有足够稳定的共同契约；共享组件 Token 会让一个组件的覆盖意外改变另外两个组件。相同基础值通过现有 Map/Alias Token 复用，而不是通过跨组件变量复用。

## Token 清单

### Tooltip

| Token | 默认值 | 职责 |
| --- | --- | --- |
| `component.tooltip.background` | `var(--color-neutral-10)` | 默认主体和箭头背景 |
| `component.tooltip.text` | `var(--color-white)` | 文字颜色 |
| `component.tooltip.z.index` | `var(--z-index-tooltip)` | Portal 层级 |
| `component.tooltip.min.height` | `32px` | 默认最小高度 |
| `component.tooltip.padding.block` | `var(--space-6)` | 默认纵向内边距 |
| `component.tooltip.padding.inline` | `var(--space-12)` | 默认横向内边距 |
| `component.tooltip.radius` | `var(--border-radius-medium)` | 圆角 |
| `component.tooltip.font.size` | `var(--font-size-14)` | 默认字号 |
| `component.tooltip.line.height` | `var(--line-height-20)` | 默认行高 |
| `component.tooltip.shadow` | `0 8px 20px rgba(15, 23, 42, 0.18)` | 阴影 |
| `component.tooltip.arrow.size` | `8px` | 箭头方形边长 |
| `component.tooltip.mini.min.height` | `34px` | mini 最小高度 |
| `component.tooltip.mini.padding.inline` | `14px` | mini 横向内边距 |
| `component.tooltip.mini.font.size` | `var(--font-size-16)` | mini 字号 |
| `component.tooltip.mini.line.height` | `var(--line-height-22)` | mini 行高 |
| `component.tooltip.motion.duration` | `var(--motion-duration-fast)` | 进入动效时长 |
| `component.tooltip.motion.easing` | `var(--motion-easing-enter)` | 进入动效缓动 |

Tooltip 根节点将 `--qizhi-tooltip-bg` 的默认值改为 `var(--component-tooltip-background, var(--color-neutral-10, #1d2129))`。实例 `color` 仍通过内联 `--qizhi-tooltip-bg` 覆盖，因此保持最高优先级。

箭头的半尺寸定位必须由 `component.tooltip.arrow.size` 计算，不能继续写死 4px；这样直接覆盖箭头尺寸时，主体连接点仍然正确。

### Popover

| Token | 默认值 | 职责 |
| --- | --- | --- |
| `component.popover.background` | `var(--color-bg-5)` | 主体和箭头背景 |
| `component.popover.text` | `var(--color-text-1)` | 主文字颜色 |
| `component.popover.content.text` | `var(--color-text-2)` | 内容文字颜色 |
| `component.popover.border` | `var(--color-border-2)` | 主体和箭头边框 |
| `component.popover.z.index` | `var(--z-index-popover)` | Portal 层级 |
| `component.popover.width` | `360px` | 内容驱动宽度的最大值 |
| `component.popover.padding.block` | `14px` | 纵向内边距 |
| `component.popover.padding.inline` | `var(--space-16)` | 横向内边距 |
| `component.popover.radius` | `var(--border-radius-medium)` | 圆角 |
| `component.popover.shadow` | `0 10px 28px rgba(15, 23, 42, 0.12)` | 阴影 |
| `component.popover.font.size` | `var(--font-size-14)` | 字号 |
| `component.popover.line.height` | `var(--line-height-22)` | 行高 |
| `component.popover.title.margin.block.end` | `var(--space-8)` | 标题与内容间距 |
| `component.popover.title.font.weight` | `var(--font-weight-500)` | 标题字重 |
| `component.popover.arrow.size` | `10px` | 箭头方形边长 |
| `component.popover.motion.duration` | `180ms` | 进入动效时长 |
| `component.popover.motion.easing` | `var(--motion-easing-enter)` | 进入动效缓动 |

Popover 箭头的中心偏移由 `component.popover.arrow.size / 2` 计算，外伸距离在半尺寸基础上保留当前 1px 边框补偿；覆盖箭头尺寸不能破坏主体与箭头的连接。

### Dropdown

| Token | 默认值 | 职责 |
| --- | --- | --- |
| `component.dropdown.popup.background` | `var(--color-bg-popup)` | 弹层背景 |
| `component.dropdown.popup.border` | `var(--color-border-1)` | 弹层边框 |
| `component.dropdown.popup.z.index` | `20` | 局部绝对定位层级 |
| `component.dropdown.popup.min.width` | `112px` | 默认最小宽度 |
| `component.dropdown.popup.padding` | `var(--space-4)` | 弹层内边距 |
| `component.dropdown.popup.radius` | `var(--border-radius-medium)` | 弹层圆角 |
| `component.dropdown.popup.shadow` | `var(--shadow)` | 保持当前有效阴影 |
| `component.dropdown.item.min.height` | `32px` | 菜单项最小高度 |
| `component.dropdown.item.padding.block` | `5px` | 菜单项纵向内边距 |
| `component.dropdown.item.padding.inline` | `var(--space-12)` | 菜单项横向内边距 |
| `component.dropdown.item.radius` | `var(--border-radius-small)` | 菜单项圆角 |
| `component.dropdown.item.text` | `var(--color-text-2)` | 菜单项文字颜色 |
| `component.dropdown.item.font.size` | `var(--font-size-14)` | 菜单项字号 |
| `component.dropdown.item.line.height` | `var(--line-height-22)` | 菜单项行高 |
| `component.dropdown.item.hover.background` | `var(--color-fill-2)` | hover/focus-visible 背景 |
| `component.dropdown.item.hover.text` | `var(--color-text-1)` | hover/focus-visible 文字 |
| `component.dropdown.trigger.gap` | `var(--space-4)` | 触发器标签与箭头间距 |
| `component.dropdown.icon.size` | `16px` | 触发器、菜单与子菜单图标尺寸 |
| `component.dropdown.motion.duration` | `var(--motion-duration-base)` | 箭头旋转时长 |
| `component.dropdown.motion.easing` | `var(--motion-easing-standard)` | 箭头旋转缓动 |
| `component.dropdown.trigger.disabled.text` | `var(--color-text-4)` | text 触发器禁用文字颜色 |
| `component.dropdown.button.divider` | `rgba(255, 255, 255, 0.35)` | primary 分割按钮分隔线 |
| `component.dropdown.button.secondary.divider` | `var(--color-border-2)` | secondary 分割按钮分隔线 |
| `component.dropdown.button.loading.background` | `rgb(var(--primary-4))` | loading 切换按钮背景 |
| `component.dropdown.button.loading.motion.duration` | `900ms` | loading 图标旋转周期 |
| `component.dropdown.button.loading.motion.easing` | `linear` | loading 图标旋转缓动 |

级联菜单的相对位置、4px 跨层间隙和 136px 特殊最小宽度属于结构与定位算法，本阶段不转为主题 Token。Dropdown.Button 的按钮高度、圆角与文字样式继续由 Button 及既有公共尺度负责；本阶段只为 Dropdown 自身覆盖的禁用、分隔和 loading 状态建立 Token。

## 消费与兼容规则

1. `packages/qizhi-tokens/src/tokens.json` 是唯一可编辑 Token 源；CSS、JSON、JavaScript、类型和迁移映射继续由脚本生成。
2. 通用层级新增 `z.index.popover = 1200` / `--z-index-popover`，与 `z.index.tooltip` 数值相同但职责独立；两个变量互不引用。
3. 有旧公共变量时使用 `Component Token → 旧变量 → 字面量`，例如 Dropdown 背景、边框、阴影及通用尺度。
4. 没有旧公共变量时使用 `Component Token → 字面量`，例如 Dropdown 当前局部层级 20、Popover 360px 最大宽度和两个独有阴影。
5. 不删除、不改名旧变量，不改变旧值和值类型。
6. 不将 Tooltip、Popover、Dropdown 的组件 Token 互相引用。
7. 不用新 Token 改写定位算法产生的 `top/right/bottom/left/transform`；箭头尺寸 Token 只参与半尺寸偏移，运行时箭头对齐变量继续决定最终位置，也不改变 Portal 容器选择。
8. `prefers-reduced-motion` 现有行为保持不变。

## 组件边界

- 不修改 Tooltip、Popover、Dropdown 的 Props、类型、导出或 ARIA 语义。
- 不改变 hover、click、focus、contextMenu、Escape、外部点击、方向键、焦点恢复和级联菜单行为。
- 不修改 Demo 文案、数量、顺序、业务数据或空状态。
- 不统一 Tooltip/Popover 与 Dropdown 的层级数值。
- 不新增全局 Overlay Provider 或运行时主题系统。
- 不顺带重构 Select、Slider、Table、SideNavigation、Input 或 BusinessObjects；它们只作为消费回归对象。

## 验证策略

实施遵循测试驱动：

1. Token 测试先固定三组 Token 的名称、值、层级、状态、生成产物和 CSS 消费点；新增测试在实现前必须失败。
2. CSS 契约测试要求每个消费点包含批准的旧变量与字面量回退，且 Tooltip `--qizhi-tooltip-bg` 的实例覆盖入口仍存在。
3. 浏览器覆盖直接 Component Token 覆盖、代表性旧变量覆盖、Tooltip `color` 优先级、Popover 主体与箭头同步、Dropdown popup 与 item 状态。
4. 以兼容回归修复提交 `2dc3434` 生成迁移前视觉基线；比较三个组件的默认打开态、箭头、阴影、主要尺寸及 Dropdown 级联态。
5. 三档视口为 1440、1024、375px；检查 Portal 边界、局部弹层裁切、水平溢出、控制台错误和失败请求。
6. 定向回归至少包含 Tooltip、Popover、Dropdown 的组件/文档测试与 E2E，以及以下直接消费者的真实打开态：Table、Slider、LogViewer、BusinessObjects 的 Tooltip；Select、BusinessObjects 的 Popover；Select、Cascader、TreeSelect、SideNavigation、Input 的 Dropdown 菜单。
7. Dropdown 浏览器覆盖还需包含 text 触发器禁用态、primary/secondary 分割线与 loading 按钮，证明新增状态 Token 可以独立覆盖且默认视觉不变。
8. 最终执行 `pnpm verify`，并记录准确测试数量、构建结果、视觉快照来源和范围审计。

## 实施前置门禁

- 已收紧 Cascader E2E 到 React Island 正式控件，避免冷加载时误操作旧静态 DOM；键盘、悬停、搜索和自定义触发器均使用组件根节点定位。
- 已将 BusinessObjects 的 `min-height`、TopNavigation 的 `min-width` 和 Cascader 的容器响应式布局按真实 CSS 契约断言，不再把最小尺寸误当固定尺寸。
- 已将 TreeSelect loading 与代码面板定位器限制到对应弹层或代码块，消除跨组件重复文案和多代码块歧义。
- 开发服务器中的 `ResizeObserver loop completed with undelivered notifications` 仅在 Playwright viewport worker teardown 时由 Vite 开发客户端报告；页面自身 console/pageerror 为零。已构建产物按实际部署子路径验证，不包含 Vite 客户端，该警告不复现。
- 前置回归结果：`pnpm verify` 通过（524 Tokens、20 Token 测试、464 文件 / 2416 Vitest）；12 组件三视口为 103 passed / 2 skipped；生产构建上的四组缺口回归为 46 passed / 2 skipped。

## 交付边界

- 本阶段只提交 Token、三个组件 CSS、契约测试、视觉基线和验收报告。
- 不发布包、不部署文档站、不升级外部消费项目。
- 实施者完成后最多声明 `candidate_pass`；独立最终验证保持 `pending`。
