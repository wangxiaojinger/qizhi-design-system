# QIZHI Tag API 契约 v1

状态：已审定  
负责人：Iris / QIZHI  
证据日期：2026-08-20

## 1. 目标与边界

- 将旧规范站 6 组 Tag Demo 迁移为 `@wangxiaojinger/qizhi-react` 正式组件，并保持标题、说明、数量、顺序、布局、尺寸、状态与可见交互一致。
- 修复旧站“可关闭标签”关闭按钮和 Toggle 无响应的问题：关闭按钮移除对应标签，Toggle 控制该 Demo 标签整体显示与隐藏。
- v1 支持文本、图标、关闭、显示隐藏、颜色、可选中、四种尺寸和边框。
- v1 不提供分组、拖拽、动画配置、计数器或旧站没有证据的 Arco API。
- Select、Cascader 和 InputTag 的内部标签本次不重构为 Tag；它们是后续消费者统一工作，不属于本次迁移。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 原规范站 Demo | `index.html#component-tag` | 6 组 Demo、文案、标签数量、图标、颜色、初始状态和排列 | React API、事件签名 |
| 原规范站样式 | `styles.css` 的 `.qizhi-tag*` | 20/24/28/32px 尺寸、颜色、边框、间距与 checkable 状态 | 受控模式 |
| 原规范站交互 | `script.js#initCheckableTags` | checkable 支持点击、Enter、Space 和 `aria-checked` | closable/visible；旧站对应控件实际无绑定 |
| 浏览器实测 | 1440/1024/375，2026-08-20 | 三档换行与几何；关闭、Toggle 失效；checkable 有效 | 未展示的 UI |
| 公共文档规范 | `docs/standards/react-component-docs.md` | 文档操作、代码同源、API 表和锚点规则 | Tag 特有 API |

## 3. 能力决策

| 能力 | 决策 | 契约结论 | 依据 |
|---|---|---|---|
| 文本与 ReactNode 内容 | 保留 | `children` | 基础 Demo |
| 前置图标 | 保留 | `icon` | Complete、星形 Tag |
| 关闭 | 修改 | `closable`、`onClose`，非受控时关闭后隐藏 | 旧站 UI 与文案明确，实际绑定缺失经用户确认修复 |
| 显示隐藏 | 保留 | `visible`，默认 `true` | 旧站说明与 Toggle UI |
| 颜色 | 保留 | QIZHI 预设色名或 CSS 颜色字符串 | Demo 展示 12 色；旧站说明明确支持自定义色；已有色板含 pinkpurple |
| 可选中 | 保留 | `checkable`、`checked`、`defaultChecked`、`onChange` | 旧站点击与键盘脚本 |
| 尺寸 | 保留 | `small/default/medium/large` = 20/24/28/32px | 旧站尺寸 Demo 与计算样式 |
| 边框 | 保留 | `bordered` | 旧站边框 Demo |
| 动画配置 | 删除 | 不导出 | 无 QIZHI 证据 |

## 4. 公共 API

| 属性 | 类型 | 默认值 | 描述 | 组合规则 |
|---|---|---|---|---|
| `children` | `ReactNode` | `undefined` | 标签内容 | 无 |
| `icon` | `ReactNode` | `undefined` | 内容前图标 | 继承文字色，装饰性包装隐藏于无障碍树 |
| `size` | `"small" \| "default" \| "medium" \| "large"` | `"default"` | 标签尺寸 | 无 |
| `color` | `TagPresetColor \| (string & {})` | `undefined` | 预设色或 CSS 颜色 | 自定义颜色通过局部 CSS 变量生效，不修改全局 Token |
| `bordered` | `boolean` | `false` | 使用白底有色边框 | 可与 `color` 组合 |
| `closable` | `boolean` | `false` | 显示关闭按钮 | 与 `onClose` 配合 |
| `visible` | `boolean` | `undefined` | 受控显示状态 | 未传入时由组件在关闭后内部隐藏 |
| `onClose` | `(event: MouseEvent<HTMLButtonElement>) => void` | `undefined` | 点击关闭按钮时触发 | 不阻止受控 `visible=true` 继续显示 |
| `checkable` | `boolean` | `false` | 开启可选中交互 | 开启后根节点具有 checkbox 语义和键盘能力 |
| `checked` | `boolean` | `undefined` | 受控选中状态 | 仅 `checkable` 时生效 |
| `defaultChecked` | `boolean` | `false` | 非受控初始选中状态 | 仅 `checkable` 时生效；与 `checked` 二选一 |
| `onChange` | `(checked: boolean, event: MouseEvent<HTMLElement> \| KeyboardEvent<HTMLElement>) => void` | `undefined` | 选中状态变化时触发 | 仅 `checkable` 时触发 |

- 继承 `HTMLAttributes<HTMLSpanElement>`，但覆盖冲突的 `color`、`onChange`。
- 支持 `className`、`style` 和 `ref<HTMLSpanElement>`。
- 不输出旧站 Demo 布局类作为公共 API。

## 5. DOM 和样式契约

- 根元素固定为 `<span>`；不可见时返回 `null`。
- 公共类：`qizhi-tag`、`qizhi-tag-size-*`、`qizhi-tag-{preset}`。
- 状态类：`qizhi-tag-checked`、`qizhi-tag-checkable`、`qizhi-tag-bordered`、`qizhi-tag-closable`。
- 内容、图标、关闭按钮分别使用 `qizhi-tag-content`、`qizhi-tag-icon`、`qizhi-tag-close-btn`。
- 关闭按钮必须为正式 `<button type="button">` 并复用 `CloseIcon`。
- 默认圆角 4px；颜色、背景、边框、字号和间距沿用旧站 Token 与实测值。

## 6. 交互和状态

| 状态 | 触发 | 视觉 | 事件/焦点 | ARIA |
|---|---|---|---|---|
| default | 默认 | fill-2 背景、text-2 文字 | 不可聚焦 | 无额外 role |
| hover | checkable 未选中或关闭按钮 | 旧站 hover 填充 | 保持当前焦点 | 无变化 |
| focus-visible | checkable 或关闭按钮键盘聚焦 | 使用现有焦点环 | 可见焦点 | 无变化 |
| checked | checkable 选中 | 对应浅色背景和有色文字 | 点击、Enter、Space 切换 | `role="checkbox"`、`aria-checked` |
| closed | 点击关闭 | 非受控 Tag 返回 `null` | 触发 `onClose` | 按钮名称为中文“关闭标签” |

## 7. Demo 与文档契约

顺序固定为：基础用法、可关闭标签、多彩标签、可选中、不同尺寸、带边框的标签。

- Demo 标题、说明、可见标签文本和数量与旧站一致。
- 多彩 Demo 只展示旧站 12 个实例，不新增 pinkpurple 或自定义色实例。
- 关闭 Demo 使用文档局部 Toggle；因 `@wangxiaojinger/qizhi-react` 尚无正式 Switch，本次复用旧站 `qizhi-switch` DOM/CSS 协议，不将 Toggle 暴露为 Tag API，也不借此迁移完整 Switch。
- `CheckCircleIcon`、`StarIcon` 和已有 `CloseIcon` 进入/来自 QIZHI 正式图标导出。
- 每个 Demo 独立 TSX，预览、查看代码和复制代码同源；不显示文件名或语言徽标。
- API 元数据字段为 `name/description/type/defaultValue`，必须与本契约和运行时一致。

## 8. 测试矩阵与发布门槛

- 单元：默认样式、四尺寸、预设/自定义颜色、边框、图标、关闭、visible、受控/非受控 checkable、鼠标和键盘、ref/ARIA。
- 文档：6 个 Demo 顺序、正式包导入、同源代码、API 一致、公共 Button/Icon/Space 复用。
- E2E：关闭、Toggle、鼠标/Enter/Space、三视口数量与高度、换行、溢出、控制台和局部截图。
- 完整执行 `node --check script.js`、`pnpm verify` 和 Tag 三档 Playwright。
- 执行者最多声明 `candidate_pass`；独立验证保持 `pending`。
