# QIZHI Typography API 契约 v1

状态：已由用户于 2026-08-18 确认  
负责人：林猫猫  
证据日期：2026-08-18

## 1. 目标与边界

- 将原规范站的“组合使用、标题、文本、段落”从静态 HTML/CSS 示例迁移为可安装、可导入、经过构建和测试的 `@wangxiaojinger/qizhi-react` 正式组件。
- 官网继续保持原规范站视觉和信息架构，但 Demo 必须直接调用正式组件，预览、展示源码与复制源码使用同一份 TSX。
- v1 提供 `Typography`、`Typography.Title`、`Typography.Text`、`Typography.Paragraph`、`Typography.Ellipsis` 五个入口。
- v1 不提供复制、编辑能力；超出省略已于 2026-08-18 作为独立增补项审定，不采用 Arco 已不推荐的旧 `ellipsis` 属性。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 原规范站 Typography 页面 | `index.html#components-typography` | 现有四组 Demo、标题级别、文本类型、装饰样式、段落间距和引用样式 | 不能证明复制、编辑、省略等交互契约 |
| Typography 页面样式 | `styles.css` 的 `.typo-*` 规则 | 当前字号、行高、字重、颜色、段落与响应式视觉 | 页面 Demo 布局类不能直接成为公共组件 API |
| 全局设计变量 | `styles.css :root`、`index.html#design-tokens` | 文字色、语义色、字体族、字重及字号基线 | 当前字号表尚未全部沉淀为可消费 CSS 变量 |
| 现有消费场景 | Tooltip 等页面中的 `.qizhi-typography` | 全站需要可复用的基础排版根类 | 不能证明这些场景已经消费正式 React 组件 |
| Arco React Typography | 官方 README 与源码 | `Typography.Sub` 调用模式、公共文本属性、Title/Paragraph/Text 分工 | 仅为参考，不能替代 QIZHI 视觉与业务证据 |

## 3. 能力决策

| 能力 | 决策 | 契约结论 | 依据 |
|---|---|---|---|
| 命名空间调用 | 保留并正式化 | `Typography.Title`、`Typography.Text`、`Typography.Paragraph` | 对齐 Arco 的稳定调用方式，便于人和 AI 精确调用 |
| 标题级别 | 保留 | `heading: 1 | 2 | 3 | 4 | 5 | 6`，默认 `1` | 原规范站完整展示 H1–H6 |
| 文本类型 | 保留 | `primary | secondary | success | error | warning` | 原规范站有对应视觉 |
| 粗体、标记、下划线、删除线、代码 | 保留 | `bold`、`mark`、`underline`、`delete`、`code` | 原规范站“文本”与“组合使用”均有证据 |
| 禁用文本 | 保留 | `disabled` 为只读视觉状态，不产生交互禁用行为 | 原规范站展示 Disabled 文本 |
| 段落行距 | 保留 | `spacing: default | close`，默认 `default` | 原规范站展示两种行距 |
| 长引用 | 保留 | `blockquote` 切换为 `<blockquote>` | 原规范站组合示例有引用块 |
| 自定义 mark 颜色 | 修改 | v1 仅支持 `mark: boolean`，不开放任意色对象 | 现有规范只有统一标记视觉，避免绕过 Token |
| 复制、编辑 | 暂缓 | v1 不提供 `copyable`、`editable` | QIZHI 无视觉、图标、反馈、键盘与事件证据 |
| 自动省略 | 增补并正式化 | 只提供 CSS 优先的 `Typography.Ellipsis`，不向 Title/Text/Paragraph 增加旧 `ellipsis` 属性 | 对照 Arco 新旧方案后，避免 JS 二分截断和已不推荐的兼容 API |
| Demo 组合布局 | 删除出公共 API | `.typo-text-grid`、`.typo-composition__lists` 等仅属于官网 Demo | 布局不是排版组件本体能力 |

## 4. 公共 API

### Typography

| 属性 | 类型 | 默认值 | 描述 | 组合/互斥规则 |
|---|---|---|---|---|
| `children` | `ReactNode` | `-` | 排版内容 | - |
| `className` | `string | string[]` | `-` | 根节点类名 | 数组按空格合并 |
| `style` | `CSSProperties` | `-` | 根节点样式 | - |

默认渲染 `<div>`，继承 `HTMLAttributes<HTMLDivElement>`，ref 指向 `HTMLDivElement`。

### Typography.Title

| 属性 | 类型 | 默认值 | 描述 | 组合/互斥规则 |
|---|---|---|---|---|
| `heading` | `1 | 2 | 3 | 4 | 5 | 6` | `1` | 标题级别及原生标签 | 渲染对应 `h1`–`h6` |
| 公共文本属性 | `TypographyCommonProps` | `-` | 文本类型和装饰 | 见下表 |

继承标题元素可用的原生 HTML 属性，ref 指向实际标题元素。

### Typography.Text

使用公共文本属性，默认渲染 `<span>`，继承 `HTMLAttributes<HTMLSpanElement>`，ref 指向 `HTMLSpanElement`。

### Typography.Paragraph

| 属性 | 类型 | 默认值 | 描述 | 组合/互斥规则 |
|---|---|---|---|---|
| `spacing` | `default | close` | `default` | 段落行高密度 | - |
| `blockquote` | `boolean` | `false` | 长引用样式与语义 | `true` 时根元素为 `<blockquote>` |
| 公共文本属性 | `TypographyCommonProps` | `-` | 文本类型和装饰 | 见下表 |

默认渲染 `<p>`；`blockquote=true` 时渲染 `<blockquote>`。继承两个分支都安全支持的 HTML 属性，ref 指向实际根元素。

### Typography.Ellipsis

| 属性 | 类型 | 默认值 | 描述 | 组合/互斥规则 |
|---|---|---|---|---|
| `children` | `string` | `-` | 需要省略的纯文本 | v1 不接受 ReactNode |
| `rows` | `number` | `1` | 折叠时最大显示行数 | 运行时归一化为大于 0 的整数 |
| `disabled` | `boolean` | `false` | 关闭省略并显示完整文本 | 同时隐藏展开/收起按钮 |
| `expandable` | `boolean` | `true` | 确实发生溢出时显示展开/收起按钮 | 未溢出时不显示 |
| `defaultExpanded` | `boolean` | `false` | 非受控默认展开状态 | `expanded` 存在时忽略 |
| `expanded` | `boolean` | `-` | 受控展开状态 | 组件不自行改变受控值 |
| `onEllipsis` | `(ellipsis: boolean) => void` | `-` | 首次检测及溢出状态变化时触发 | 容器尺寸变化后重新检测 |
| `onExpand` | `(expanded: boolean, event: MouseEvent<HTMLButtonElement>) => void` | `-` | 点击展开或收起时触发 | 非受控时先更新内部状态 |
| `className` | `string | string[]` | `-` | 根节点类名 | 数组按空格合并 |
| `style` | `CSSProperties` | `-` | 根节点样式 | - |

默认渲染 `<div>`，文本位于内部 `<span>`；展开/收起使用原生 `<button type="button">`。ref 指向根 `HTMLDivElement`。省略使用 CSS `line-clamp`，`ResizeObserver` 仅负责检测尺寸与溢出状态，不进行 JS 二分字符截断。

### TypographyCommonProps

| 属性 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `children` | `ReactNode` | `-` | 文本内容 |
| `type` | `primary | secondary | success | error | warning` | `-` | 文本语义类型；未设置时使用正文色 |
| `bold` | `boolean` | `false` | 粗体 |
| `disabled` | `boolean` | `false` | 置灰文本视觉 |
| `mark` | `boolean` | `false` | 标记样式 |
| `underline` | `boolean` | `false` | 下划线 |
| `delete` | `boolean` | `false` | 删除线 |
| `code` | `boolean` | `false` | 行内代码样式 |
| `className` | `string | string[]` | `-` | 节点类名 |
| `style` | `CSSProperties` | `-` | 节点样式 |

规则：

- 原生事件透传，事件参数类型与实际根元素一致；组件不新增业务事件。
- `bold`、`mark`、`underline`、`delete`、`code` 可组合，按固定嵌套顺序输出稳定 DOM。
- `disabled` 优先于 `type` 的文字颜色，但不拦截事件，也不自动设置 `tabIndex`。
- 除 `Typography.Ellipsis` 的展开状态外，其余子组件没有受控/非受控状态。

## 5. DOM 和样式契约

- 公共命名空间为 `qizhi-typography`，不得产生 `arco-*` 或 `ac-*` 命名。
- `Typography`：`<div class="qizhi-typography">`。
- `Typography.Title`：`<h1>`–`<h6>`，附加标题级别类。
- `Typography.Text`：`<span>`。
- `Typography.Paragraph`：默认 `<p>`，引用态 `<blockquote>`。
- 类型与状态类使用 `qizhi-typography--primary`、`--secondary`、`--success`、`--error`、`--warning`、`--disabled`。
- 字体族、颜色、字重优先消费 QIZHI Token；缺失的字号与行高 Token 应先在组件包内以 `--qizhi-typography-*` 组件变量固化，不把 Demo 选择器作为依赖。
- v1 视觉以原规范站 Typography 页面的实际渲染为基线，H1–H6 桌面字号暂定为 `40/30/24/20/16/14px`；全局字号表中冲突的 `36/24px` 暂不反向修改组件，后续单独治理 Token，避免本次迁移改变用户已确认的视觉。
- `.typo-composition`、`.typo-headings-demo`、`.typo-text-grid`、`.typo-paragraph-showcase` 及其子类只保留为官网布局类，不从组件包导出。
- `Typography.Ellipsis` 使用 `qizhi-typography-ellipsis`、`__content`、`__action` 作为稳定结构类；不得产生 Arco 命名。

## 6. 交互和状态

除 `Typography.Ellipsis` 的展开按钮外，Typography v1 是内容呈现组件，没有 hover、active、loading、错误输入或内部焦点状态。

| 状态 | 触发条件 | 视觉 | 事件 | 焦点 | ARIA |
|---|---|---|---|---|---|
| default | 默认 | 正文色 | 原生事件透传 | 不新增焦点 | 由原生语义决定 |
| semantic type | 设置 `type` | 对应语义色 | 不改变 | 不改变 | 不自动追加 role |
| disabled | `disabled=true` | 置灰色 | 不拦截 | 不改变 | 不附加 `aria-disabled`；它是文本视觉而非不可操作控件 |
| ellipsis collapsed | 文本超过 `rows` | CSS 多行省略 | `onEllipsis(true)` | 展开按钮可聚焦 | 按钮使用 `aria-expanded="false"` |
| ellipsis expanded | 点击展开或受控为 true | 显示完整文本 | `onExpand(true, event)` | 焦点留在按钮 | 按钮使用 `aria-expanded="true"` |
| ellipsis disabled | `disabled=true` | 显示完整文本 | 不触发展开操作 | 无内部按钮 | 无额外 ARIA |

## 7. 键盘与无障碍

- 依赖 `h1`–`h6`、`p`、`blockquote`、`span` 的原生语义，不创建自定义 role。
- 组件本身不进入 Tab 顺序；若调用方传入链接、按钮等交互子节点，其键盘行为由子节点负责。
- 标题级别由调用方根据页面信息层级选择，不能仅为了字号跳级。
- `mark`、`underline`、`delete`、`code` 使用对应语义元素，而非纯 CSS 模拟。
- 没有动效，不涉及 `prefers-reduced-motion`。
- Ellipsis 操作按钮进入 Tab 顺序，支持 Enter 与 Space 原生键盘激活；展开后焦点保持在同一按钮上。
- 视觉省略不删除 DOM 文本；辅助技术仍能读取完整字符串。

## 8. Demo 与 API 元数据

Demo 顺序调整为：组合使用、标题、文本、段落、超出省略、API。

- 组合使用：容器、标题、段落、引用、装饰和列表协作。
- 标题：`heading=1..6` 与实际语义标签。
- 文本：五种类型、默认、粗体、禁用、标记、下划线、删除线、代码。
- 段落：默认、次要、`spacing=default`、`spacing=close`、引用。
- 超出省略：单行、多行、展开/收起、禁用省略和受控展开。
- API 元数据字段统一为 `name`、`description`、`type`、`defaultValue`，并标记所属子组件。
- AI 组合规则必须明确：标题级别是语义层级；普通文本的 `disabled` 仅为视觉；省略必须调用 `Typography.Ellipsis`，不得向 Title/Text/Paragraph 传旧 `ellipsis` 属性。

## 9. 测试矩阵

| 层级 | 必测内容 |
|---|---|
| 类型 | 子组件导出、合法 heading/type、Ellipsis 纯字符串约束、非法值、原生属性、事件和 ref 类型 |
| 单元 | 默认标签、条件标签、默认值、组合装饰、类名数组、ref、原生属性、禁用优先级、省略检测、受控/非受控展开、禁用省略 |
| 文档 | Demo 顺序、真实包导入、源码同源、API 元数据与导出类型一致 |
| E2E | H1–H6 标签、最终字号/行高/颜色、段落间距、三视口溢出、控制台、局部截图 |

## 10. 发布门槛

- [ ] 契约已审定，H1/H2 采用当前实际渲染的视觉基线。
- [ ] 类型检查、单元测试和构建通过。
- [ ] 包产物可导入，样式入口有效。
- [ ] 官网消费正式包，Demo 和展示源码同源。
- [ ] 语义结构、1440/1024/375 和截图已验收。
- [ ] 复制、编辑等未完成能力已明确报告；旧 `ellipsis` 属性未被误加入。
