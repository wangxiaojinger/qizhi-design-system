# QIZHI Link API 契约 v1

状态：已由用户于 2026-08-18 确认  
负责人：林猫猫  
证据日期：2026-08-18

## 1. 目标与边界

- 将原规范站的 Link 静态示例迁移为可安装、可导入、经过构建和测试的 `@wangxiaojinger/qizhi-react` 正式组件。
- 官网保留原规范站视觉与五组内容，但 Demo 必须直接调用正式 Link；预览、展示源码和复制源码使用同一份 TSX。
- Link 同时覆盖导航与轻量操作：有 `href` 时渲染链接，无 `href` 时渲染按钮。
- v1 不实现 Dropdown 菜单；“配合 Dropdown 使用”只证明 Link 可作为触发器，菜单行为在 Dropdown 迁移时接入。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 原规范站 Link 页面 | `index.html#components-link` | 基础、语义状态、图标、hoverable 与 Dropdown 组合五组 Demo | 不能证明加载、尺寸、下划线、Link.Group 等能力 |
| Link 样式 | `styles.css` 的 `.qizhi-link*` | 默认/hover/active/focus-visible/disabled、语义颜色、图文间距、圆角与填充 | Demo 布局类不能成为公共 API |
| Link Demo 路由协议 | `script.js` 的 `data-link-demo` 分支 | 官网演示需阻止 hash 跳转 | 不能把阻止导航变成正式 Link 默认行为 |
| 现有消费场景 | `index.html` 中 23 个 `.qizhi-link` 实例 | 18 个链接分支和 5 个按钮分支均有实际页面证据 | 不能证明所有静态消费者已迁移到 React |
| QIZHI 图标资产 | `qz-icon-0-5226.svg`、`qz-icon-0-5232.svg` | `<icon-链接 />` 与 `<icon-编辑 />` 的正式图形来源 | 不能直接作为合法 React 组件名 |
| Arco React Link | 官方文档与源码 | `icon?: boolean | ReactNode`、状态、禁用和 hoverable 的契约组织方式 | 只作为参考，不能替代 QIZHI 双语义与视觉审定 |

## 3. 能力决策

| 能力 | 决策 | 契约结论 | 依据 |
|---|---|---|---|
| 导航链接 | 保留并正式化 | `href` 存在时渲染 `<a>` | 原规范站多数消费者是链接 |
| 轻量操作 | 保留并正式化 | `href` 不存在时渲染 `<button type="button">` | Dropdown 触发与详情操作已有按钮证据 |
| 语义状态 | 保留 | `default | error | success | warning` | 原规范站完整展示四种状态 |
| 禁用 | 保留 | 链接与按钮分支分别采用正确原生语义 | 原规范站两种根元素都有禁用证据 |
| hover 背景 | 保留 | `hoverable` 默认 `true`；`false` 仅取消 hover 背景 | 原规范站有“悬浮状态样式”对比 |
| 默认图标 | 保留并正式化 | `icon=true` 使用 `LinkIcon`，来源为 `<icon-链接 />` | QIZHI 文案和 Arco 示例均明确此行为 |
| 自定义图标 | 保留并正式化 | `icon=ReactNode`；编辑示例使用 `EditIcon`，来源为 `<icon-编辑 />` | 原规范站有链接、编辑两种图标 |
| 文字字号 | 修改 | React v1 使用 `14px` | 用户确认向 Arco 靠拢，并与 QIZHI Button 统一 |
| Dropdown | 暂缓组合行为 | 本轮只输出 Link 触发器，不实现菜单 | Dropdown 尚未迁移，禁止临时伪造公共组件 |
| loading、size、underline、Group | 删除 | v1 不导出 | QIZHI 无业务、视觉和交互证据 |
| 自动外链图标与安全属性 | 删除 | 不识别 URL，不自动补 `target`/`rel` | 避免隐式改变原生链接行为 |
| `as` 或路由组件适配 | 暂缓 | v1 不导出 | 尚无 Router 消费证据，避免扩大多态类型 |

## 4. 公共 API

### 公共属性

| 属性 | 类型 | 默认值 | 描述 | 组合/互斥规则 |
|---|---|---|---|---|
| `children` | `ReactNode` | `-` | 链接或操作内容 | 负责提供可访问名称 |
| `status` | `'default' | 'error' | 'success' | 'warning'` | `'default'` | 语义状态颜色 | `disabled` 视觉优先级更高 |
| `disabled` | `boolean` | `false` | 禁止跳转或操作 | 根据实际根元素使用不同语义 |
| `hoverable` | `boolean` | `true` | hover 时是否显示填充背景 | `false` 不取消文字状态色与 active/focus-visible |
| `icon` | `boolean | ReactNode` | `false` | 默认或自定义前置图标 | `true` 使用 `LinkIcon`；ReactNode 原样渲染 |
| `className` | `string | string[]` | `-` | 根节点类名 | 数组按空格合并 |
| `style` | `CSSProperties` | `-` | 根节点样式 | - |

### 链接分支

| 属性 | 类型 | 默认值 | 描述 | 组合/互斥规则 |
|---|---|---|---|---|
| `href` | `string` | 必填 | 链接地址并决定渲染 `<a>` | 与 `htmlType` 互斥 |
| `target`、`rel`、`download` 等 | 原生 Anchor 属性 | `-` | 原生链接行为 | 组件不自动修改 |
| `onClick` | `MouseEventHandler<HTMLAnchorElement>` | `-` | 链接点击事件 | `disabled=true` 时不执行 |

链接分支继承 `AnchorHTMLAttributes<HTMLAnchorElement>`，排除与公共属性冲突的字段；ref 指向 `HTMLAnchorElement`。

### 按钮分支

| 属性 | 类型 | 默认值 | 描述 | 组合/互斥规则 |
|---|---|---|---|---|
| `href` | `never` | `-` | 未提供时进入按钮分支 | 与链接分支互斥 |
| `htmlType` | `'button' | 'submit' | 'reset'` | `'button'` | 映射为原生 button `type` | 仅按钮分支可用 |
| `onClick` | `MouseEventHandler<HTMLButtonElement>` | `-` | 操作点击事件 | `disabled=true` 时由原生 button 阻止 |

按钮分支继承 `ButtonHTMLAttributes<HTMLButtonElement>`，排除与公共属性和 `type` 冲突的字段；ref 指向 `HTMLButtonElement`。

### 类型规则

- `LinkProps = LinkAnchorProps | LinkButtonProps`，以 `href` 形成可辨识联合类型。
- `LinkHandle = HTMLAnchorElement | HTMLButtonElement`。
- `href` 与 `htmlType` 不得同时出现；类型测试必须证明非法组合无法编译。
- v1 不支持受控/非受控状态，组件不维护业务状态。
- `target="_blank"` 时由调用方明确传入 `rel="noopener noreferrer"`；组件不静默补充。

## 5. DOM 和样式契约

- 公共根类为 `qizhi-link`，不得产生 `arco-*` 或 `ac-*` 命名。
- 状态类为 `qizhi-link--error`、`--success`、`--warning`、`--disabled`、`--hoverless`、`--with-icon`。
- 链接分支：`<a class="qizhi-link">`；按钮分支：`<button class="qizhi-link" type="button">`。
- Link 文字字号为 `14px`，字重 `400`，使用 QIZHI 正文字体；行高与最小高度以原规范站 28px 交互区域为基线。
- 根节点为 `inline-flex`，图标与文字间距 `6px`；边框为 0，背景默认透明，圆角使用既有中号圆角 Token。
- 默认、hover、active 分别消费 link-6/link-5/link-7 或现有同义 Token；hover/active 背景分别使用 `color-fill-2`/`color-fill-3`。
- error、success、warning 使用各自 6/5/7 色阶，通用 hover 规则不得覆盖语义状态文字色。
- `hoverable=false` 仅令 hover 背景透明；active 与 focus-visible 仍保留反馈。
- 禁用态统一使用 `color-text-4`、透明背景和不可用光标，覆盖所有 status。
- `LinkIcon` 和 `EditIcon` 由 QIZHI SVG 资产封装，默认 `16px`，使用 `currentColor`，作为装饰内容设置 `aria-hidden="true"`。
- `.link-demo-row`、`.link-status-grid`、`.link-icon-stack` 等只属于官网 Demo，不从组件包导出。

## 6. 交互和状态

| 状态 | 触发条件 | 视觉 | 事件 | 焦点 | ARIA |
|---|---|---|---|---|---|
| default | 默认 | status 对应文字色，透明背景 | 原生事件透传 | 原生顺序 | 由根元素决定 |
| hover | 指针悬浮且 `hoverable=true` | status hover 色 + `color-fill-2` | 不新增事件 | 不改变 | 无新增 |
| hoverless | 指针悬浮且 `hoverable=false` | status hover 色，背景透明 | 不新增事件 | 不改变 | 无新增 |
| active | 原生按压 | status active 色 + `color-fill-3` | 原生 click | 保持焦点 | 无新增 |
| focus-visible | 键盘聚焦 | QIZHI 主色焦点环 | 不新增事件 | 可见焦点 | 无新增 |
| anchor disabled | `<a disabled>` 语义分支 | 禁用色、透明背景 | 阻止默认跳转和调用方 `onClick` | `tabIndex=-1` | `aria-disabled=true` |
| button disabled | `<button disabled>` | 禁用色、透明背景 | 原生阻止 click | 不进入 Tab | 原生 `disabled` |

- `disabled` 优先于 `status` 和 `hoverable`。
- 组件没有 loading 状态和内部异步行为。
- 官网 Demo 可在外层阻止跳转，但正式组件在启用状态下不得阻止原生链接行为。

## 7. 键盘与无障碍

- 链接分支依赖 `<a href>` 原生语义，由 Enter 激活。
- 按钮分支依赖 `<button>` 原生语义，由 Enter 和 Space 激活。
- 不添加自定义 role，不模拟浏览器已有键盘行为。
- 禁用链接设置 `aria-disabled="true"` 和 `tabIndex=-1`；禁用按钮使用原生 `disabled`。
- Link 的可访问名称由 `children` 提供；仅图标内容时调用方必须显式提供 `aria-label`。
- `LinkIcon`、`EditIcon` 等前置装饰图标不重复进入可访问名称。
- Link 状态色不能单独承担含义；调用方仍需通过文本表达错误、成功或警告语义。
- 动效仅为颜色与背景过渡，必须兼容 `prefers-reduced-motion: reduce`。

## 8. Demo 与 API 元数据

Demo 顺序为：基础用法、其他状态、图标、悬浮状态样式、配合 Dropdown 使用、API。

- 基础用法：只展示一个可点击的 `href` 链接和一个禁用的 `href` 链接；按钮分支由 Dropdown 触发器示例覆盖。
- 其他状态：default、error、success、warning 与禁用优先级。
- 图标：`icon=true` 使用 `LinkIcon`，`icon={<EditIcon />}` 使用 `EditIcon`，均覆盖禁用组合。
- 悬浮状态样式：`hoverable=true/false` 对比，并保留语义状态文字色。
- 配合 Dropdown 使用：Link 按钮分支搭配向下图标，仅证明触发器调用；不实现菜单行为。
- API 元数据字段统一为 `name`、`description`、`type`、`defaultValue`。
- AI 规则必须明确：跳转使用 `href` 分支，当前页面操作省略 `href`；仅图标必须传 `aria-label`；新窗口链接同时传 `target="_blank"` 与安全 `rel`。

## 9. 测试矩阵

| 层级 | 必测内容 |
|---|---|
| 类型 | 两种 Props 分支、合法原生属性、`href/htmlType` 非法组合、事件与 ref 类型、status/icon 值域 |
| 单元 | 根元素切换、默认值、类名数组、默认/自定义图标、disabled 事件、tabIndex/ARIA、原生属性透传 |
| 样式 | 14px 字号、状态三态颜色、hover/active 背景、hoverless、禁用优先级、图标 currentColor 与 6px 间距 |
| 文档 | 五组 Demo 顺序、真实包导入、源码同源、API 元数据与类型/默认值一致、全局唯一 API 锚点 |
| E2E | 鼠标与键盘激活、禁用不触发、外链原生属性、最终计算样式、三视口溢出、控制台、局部截图 |

## 10. 发布门槛

- [x] 契约已由用户审定，没有以实现替代产品决策。
- [x] 先失败后通过的类型、行为和文档测试完整。
- [x] 类型检查、单元测试和构建通过。
- [x] `LinkIcon`、`EditIcon` 来自指定 QIZHI 图标资产并可从包根导入。
- [x] 官网消费正式包，Demo 和展示源码同源。
- [x] 鼠标、键盘、禁用、语义色、1440/1024/375 和截图已验收。
- [x] Dropdown 等延期能力和独立最终验证状态已明确报告。
