# QIZHI Select API 契约 v1

状态：已审定  
证据日期：2026-08-20

## 1. 目标与边界

Select v1 保留静态规范站 `#component-select` 的 18 组 Demo，并在“扩展菜单”后新增一组已审定的信息卡片选项 Demo。公共弹层菜单复用 `Dropdown.Menu` 与 `Dropdown.Item`，文档操作复用 Button 和 Icon。

v1 不照搬 Arco API，不导出 Checkbox、Tag、Avatar 或 Slider 公共组件；这些仅作为 Select 内部表达或 Demo 控件。

## 2. 证据与 Demo 顺序

1. 基础用法
2. 允许清除
3. 多选模式
4. 带有前置标签
5. 允许创建
6. 搜索
7. 远程搜索
8. 自定义弹出框宽度
9. 不同尺寸
10. 指定可选项
11. 自动分词
12. 自定义触发节点
13. 扩展菜单
14. 信息卡片选项（分节标题）
    - 名称与字段信息
    - 图标与属性
    - 悬停补充信息
    - 选择后关联信息
14. 联动
15. 隐藏已选择项
16. 拖拽排序
17. 宽度自适应
18. 最大标签数

## 3. 公共 API

- `options: SelectOption[]`
- `mode?: "single" | "multiple"`
- `value` / `defaultValue` / `onChange`：根据 mode 形成联合类型。
- `placeholder?: string`，默认 `"请选择"`。
- `size?: "mini" | "small" | "default" | "large"`，高度分别为 24/28/32/36px。
- `status?: "default" | "error" | "warning"`。
- `disabled?: boolean`。
- `allowClear?: boolean`。
- `addBefore?: ReactNode`。
- `showSearch?: boolean | { retainInputValue?: boolean }`。
- `filterOption?: (input, option) => boolean`。
- `onSearch?: (input) => void`。
- `allowCreate?: boolean | { formatter?: (input) => ReactNode }`。
- `tokenSeparators?: string[]`，仅多选可用。
- `maxTagCount?: number | "responsive"`。
- `renderTag?: (option, removable) => ReactNode`。
- `renderMore?: (count) => ReactNode`。
- `hideSelected?: boolean`，仅多选可用。
- `dragToSort?: boolean`，仅多选可用。
- `autoWidth?: boolean | { minWidth?: number; maxWidth?: number }`。
- `popupWidth?: "trigger" | "content" | number`。
- `renderOption?: (option) => ReactNode`。
- `renderOptionDescription?: (option) => ReactNode`：由 Select 在选项悬停或键盘活动项显示补充说明。
- `dropdownRender?: (menu) => ReactNode`。
- `trigger?: (props: SelectTriggerProps) => ReactNode`。
- `open` / `defaultOpen` / `onOpenChange`。
- `className` / `style` / `id` / `name` / `aria-label` / `aria-labelledby`。

### SelectOptionCard

- `name: ReactNode`：卡片名称。
- `fields: readonly { key: string; label?: ReactNode; value: ReactNode; icon?: ReactNode }[]`：字段名称、值与可选图标。
- SelectOptionCard 只负责信息展示；不新增选择、浮层或键盘交互。

## 4. DOM、交互与无障碍

- 默认 `.qizhi-select__control` 是统一控件容器：由它承担尺寸、边框、圆角、背景和状态；内部真实 input 只承担值、焦点、搜索和 combobox 语义。
- Select 外层 `.qizhi-select` 只负责前置标签组合、弹层定位和状态协调，不重复绘制第二层输入边框。
- `trigger` 自定义触发器不强加统一容器外观，调用方负责视觉，Select 只提供交互与 ARIA 属性。
- 统一结构不新增公共 Props，现有 API 元数据保持不变。
- 默认触发器使用真实 input，`role="combobox"`、`aria-haspopup="listbox"`、`aria-expanded`、`aria-controls` 和 `aria-activedescendant` 同步。
- 弹层通过 Portal 渲染，菜单必须由 `Dropdown.Menu` / `Dropdown.Item` 生成，并覆盖为 `listbox` / `option` 语义。
- 提供 `renderOptionDescription` 时，Select 统一在鼠标悬停或键盘活动项显示 Popover；禁用选项不显示补充说明，Demo 不得自行创建浮层。
- 下拉菜单内容区最大高度为 320px；超过时在菜单内滚动，避免多行信息卡片越出视口。
- 窄屏下信息卡片的补充 Popover 改为顶部方向，仍由 Select 负责定位和关闭。
- Enter、Space、ArrowDown 打开；ArrowUp/ArrowDown 移动；Enter/Space 选择；Escape 关闭并恢复焦点。
- 单选后关闭，多选后保持打开；点击外部关闭。
- 清除和删除标签会发出 `onChange`，禁用选项不可选。
- 支持搜索、创建、自动分词、联动、隐藏已选、拖拽排序、宽度自适应和响应式最大标签数。

## 5. 验收

- 组件、类型、导出、文档、API 元数据、18 组旧 Demo 与 4 组信息卡片选项复制代码同源。
- `pnpm typecheck`、`pnpm test`、`pnpm build` 通过。
- 1440/1024/375 完成真实交互、计算尺寸、溢出、控制台和局部截图人工核对。
