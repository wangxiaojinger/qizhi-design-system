# QIZHI FilterSelect API 契约 v1

状态：待用户审阅
负责人：林猫猫
证据日期：2026-10-10

## 1. 目标与边界

- 用户任务：在 `@wangxiaojinger/qizhi-react` 中新增列表筛选选择器 `FilterSelect`。
- 业务场景：列表页、表格页和管理后台的筛选区。
- v1 解决的问题：稳定显示筛选名称和当前结果，支持单选、多选、本地搜索、远程搜索与即时变更通知。
- 兼容边界：不改变现有 `Select` 的默认 DOM、视觉或行为；`FilterSelect` 仅通过显式属性使用新增的值展示能力。
- v1 明确不解决：分组选项、用户创建选项、标签拖拽排序、选中标签单项删除、业务条件间联动和请求防抖。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 当前 QIZHI Select | `packages/qizhi-react/src/select/` | 浮层、选项、勾选、虚拟列表、搜索、键盘和 ARIA 已有唯一实现 | 不能直接提供聚合的筛选文本展示 |
| 用户当前需求 | 本任务说明 | 规定单选、多选、展开保留、下拉项和 `onChange` 行为 | 未授权扩大到 Select 其他高级能力 |
| Ant Design Select 官方文档 | `ant.design/components/select-cn/` | `prefix`、`labelRender`、`tagRender`、`maxTagCount`、`maxTagPlaceholder`、对象式 `showSearch` 的设计参考 | 不代表 QIZHI 必须照搬全部 API 或当前视觉 |
| QIZHI React 展示规范 | `docs/standards/react-component-docs.md` | Demo 与源码同源、结构化 API、三视口与无障碍验收 | 不决定 FilterSelect 的业务默认文案 |

## 3. 能力决策

| 能力 | 决策 | 契约结论 | 依据 |
|---|---|---|---|
| 筛选名称 | 修改 | 始终在触发框内显示 `label`，形式为“`label`：结果” | 用户明确要求；参考 AntD `prefix` |
| 当前值展示 | 修改 | 单选显示一个 label；多选显示由 `separator` 连接的 label | 用户明确要求；参考 AntD `labelRender`/`tagRender` |
| 多选折叠 | 保留 | 使用 `maxDisplayCount` 和 `renderMore` 生成聚合摘要 | 参考 AntD `maxTagCount`/`maxTagPlaceholder`，但保留筛选业务语义 |
| 下拉选项 | 保留 | 只展示 option label，不重复筛选名称 | 用户明确要求 |
| 展开时回显 | 修改 | 结果文本在展开、搜索和远程加载时保持可见 | 用户明确要求，优先级高于参考库常规回显 |
| 本地搜索 | 保留 | `searchable` 开启，默认按 label 和 value 过滤，可用 `filterOption` 覆盖 | 复用 QIZHI Select |
| 远程搜索 | 保留 | `filterOption={false}` 关闭本地过滤，由 `searchValue`/`onSearch`/`loading` 受控 | 参考 AntD `showSearch` |
| 多选勾选 | 保留 | 使用现有 QIZHI Select 右侧 CheckboxIndicator | QIZHI 已有契约 |
| 创建、分组、拖拽 | 待定 | v1 不对外暴露 | 无当前业务需求 |

## 4. 公共 API

```ts
export type FilterSelectValue = SelectRawValue;
export type FilterSelectOption = SelectOption;
export type FilterSelectFilterOption =
  | boolean
  | ((input: string, option: FilterSelectOption) => boolean);

interface FilterSelectCommonProps {
  label: ReactNode;
  options: FilterSelectOption[];
  emptyText?: ReactNode;
  searchable?: boolean;
  searchValue?: string;
  retainDisplayValueWhenOpen?: boolean;
  loading?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  placeholder?: string;
  notFoundContent?: ReactNode;
  filterOption?: FilterSelectFilterOption;
  onSearch?: (keyword: string) => void;
  renderOption?: (option: FilterSelectOption) => ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

export interface FilterSelectSingleProps extends FilterSelectCommonProps {
  mode?: "single";
  value?: FilterSelectValue;
  defaultValue?: FilterSelectValue;
  allOption?: FilterSelectOption;
  onChange?: (
    value: FilterSelectValue | undefined,
    option: FilterSelectOption | undefined,
  ) => void;
}

export interface FilterSelectMultipleProps extends FilterSelectCommonProps {
  mode: "multiple";
  value?: FilterSelectValue[];
  defaultValue?: FilterSelectValue[];
  maxDisplayCount?: number;
  separator?: ReactNode;
  renderMore?: (count: number) => ReactNode;
  onChange?: (
    values: FilterSelectValue[],
    options: FilterSelectOption[],
  ) => void;
}

export type FilterSelectProps =
  | FilterSelectSingleProps
  | FilterSelectMultipleProps;
```

### 4.1 默认值和组合规则

| 属性 | 默认值 | 规则 |
|---|---|---|
| `mode` | `"single"` | 决定 value 和 onChange 的类型 |
| `emptyText` | 单选 `"全部"`；多选 `"全部标签"` | 仅在未选择时展示，不产生值 |
| `allOption` | — | 仅单选；作为真实选项置于列表首位，选中后返回其 value 和 option |
| `maxDisplayCount` | `2` | 取非负整数；超出部分使用 `renderMore` |
| `separator` | `"、"` | 只用于已展示的多选 label 之间 |
| `renderMore` | `(count) => \`+${count}个更多\`` | 结果与前文之间使用一个空格 |
| `searchable` | `false` | 启用后显示可编辑搜索输入 |
| `filterOption` | `true` | `true` 使用 Select 的 label/value 默认过滤；`false` 不做本地过滤 |
| `retainDisplayValueWhenOpen` | `true` | `false` 时允许搜索输入在展开期间替代结果文本 |
| `allowClear` | `false` | 清空后立即触发对应模式的 `onChange` |
| `notFoundContent` | `"暂无数据"` | `null` 不渲染空状态 |

其他约束：

- `allOption.value` 不得与 `options` 中任一 value 重复；开发环境重复时输出警告，运行时只保留首个值。
- 远程搜索替换 `options` 后，已选值仍使用最近一次解析到的 option label，不得因新结果集不包含它而消失。
- 外部传入的初始 `value` 从未在 `options` 中解析成功时，回退显示 `String(value)`，但不合成虚假 option，`onChange` 仍只返回真实选项。
- `placeholder` 是搜索输入的提示，不替代 `emptyText`。
- `renderOption` 只修改下拉项内容；触发框回显始终使用 option `label`。
- 不暴露 `Select` 中与 v1 定位无关的 `allowCreate`、`tokenSeparators`、`dragToSort`、`hideSelected`、`dropdownRender` 和 `trigger`。

### 4.2 受控与非受控

- `value` 存在时为受控选中值；否则使用 `defaultValue` 初始化内部状态。
- `searchValue` 存在时为受控搜索值；组件只通过 `onSearch` 通知变化。
- 单选选择后关闭浮层；多选选择后保持浮层打开并清空非受控搜索文本。
- `onChange` 在选择、取消选择或清空后同步触发，组件不内置防抖。

## 5. DOM 和样式契约

- 根节点继承 Select 的 `.qizhi-select`，并增加 `.qizhi-filter-select`；状态类继续由 Select 管理。
- 触发框内的语义顺序为：筛选名称、全角冒号、结果摘要、可选搜索输入、清空按钮、展开箭头。
- 筛选名称不用占位符颜色；空结果也作为真实筛选语义显示，不使用 placeholder 弱化色。
- 多选触发框不渲染 Tag 和单项删除按钮；所有选中项仅渲染为一段聚合文本。
- 样式继续使用 `select.css` 和现有 Select token；不新增全局颜色、高度、圆角或阴影。
- 长文本在清空与箭头前单行省略；不推宽外层容器。
- 浮层继续 Portal 到 `document.body`，宽度和翻转定位继承 Select。

## 6. 交互和状态

| 状态 | 触发条件 | 视觉 | 事件 | 焦点 | ARIA |
|---|---|---|---|---|---|
| default | 可用且未展开 | 显示“名称：结果” | 点击打开 | combobox 可聚焦 | `aria-expanded=false` |
| open | 展开列表 | 结果保持可见 | `onOpenChange` 由 Select 内部处理 | 键盘可移动活动项 | `aria-expanded=true` |
| searching | 输入关键字 | 结果摘要与搜索输入共存 | 每次输入触发 `onSearch` | 输入框保持焦点 | `aria-autocomplete=list` |
| selected | 点击或 Enter 选择 | 立即更新摘要 | 立即 `onChange` | 单选恢复触发器；多选留在组件内 | option `aria-selected` |
| disabled | `disabled=true` | 继承 Select 禁用态 | 不打开、不变更 | 不进入 Tab 序列 | 原生 disabled |
| loading | `loading=true` | 浮层显示加载状态 | 暂停选择 | 保留当前焦点 | 浮层 `aria-busy=true` |
| clearable | 有值且 `allowClear` | 显示现有清空图标 | 立即清空并 `onChange` | 清空后恢复组件焦点 | 按钮名称“清除选择” |

## 7. 键盘与无障碍

- 使用 Select 现有 `combobox` + `listbox` + `option` 语义。
- Enter/Space 打开，上下键移动活动项，Enter 选择，Escape 关闭并恢复焦点。
- 搜索模式下 Space 输入字符，不用于选择。
- 多选列表保留 `aria-multiselectable=true`，已选状态通过 `aria-selected` 和视觉勾选同步表达。
- 默认可访问名称由 `aria-label` 提供；未传入时使用 `label` 的纯文本内容。非文本 `label` 无法推导名称时，开发环境警告并要求传入 `aria-label`。
- 触发框可访问值文本包含完整的“筛选名称：结果”，不只暴露搜索关键字。
- 不新增动画；继承 Select 对 `prefers-reduced-motion` 的处理。

## 8. Demo 与 API 元数据

文档分类：

```text
数据录入
└── 选择器
    ├── Select 基础选择器
    └── FilterSelect 筛选选择器
```

Demo 顺序：

1. 单选筛选：未选择、`allOption`、具体选项与即时 `onChange`。
2. 多选筛选：空值、一项、两项和超出摘要。
3. 本地搜索：展开后保留当前结果并过滤选项。
4. 远程搜索：受控关键字、`filterOption={false}`、加载与无结果。
5. 状态：禁用、清空和自定义选项内容。

API 元数据必须覆盖公共类型中每个属性，并显式说明：

- `allOption` 是真实单选值，`emptyText` 只是空态展示。
- `filterOption=false` 是远程搜索的使用方式。
- `retainDisplayValueWhenOpen` 默认为 true。
- 多选触发框不提供单项删除；取消选中通过下拉列表完成。

## 9. 测试矩阵

| 层级 | 必测内容 |
|---|---|
| 类型 | 单/多选值与回调联合类型；`allOption` 只属于单选；多选展示 API 只属于 multiple |
| 单元 | 默认空态、全部选项、实时 onChange、多选聚合、超出摘要、清空、禁用、加载、本地/远程搜索、展开回显、自定义选项、未知受控值 |
| 回归 | 既有 Select 单选/多选回显、搜索、勾选、键盘、ARIA 和 Form 契约不变 |
| 文档 | 分类层级、Demo 顺序、正式包导入、源码同源、API 数据与 TypeScript 一致 |
| E2E | 鼠标与键盘选择、多选取消、搜索、展开保留、焦点恢复、浮层不裁切、控制台、1440/1024/375 与局部截图 |

TDD 顺序：

1. 先写公共导出和最小单选展示测试，确认因组件未存在而失败。
2. 最小实现单选，然后逐项为多选、折叠、搜索和可访问性增加先失败测试。
3. 定向测试通过后再运行 Select 回归、文档测试、全量单测试、类型检查和构建。

## 10. 发布门槛

- [ ] 契约已由用户审定，没有以实现代替产品决策。
- [ ] `FilterSelect` 和全部公共类型已从 `@wangxiaojinger/qizhi-react` 导出。
- [ ] 既有 `Select` 默认行为的回归测试通过。
- [ ] 类型检查、单元测试和构建通过。
- [ ] 包产物可导入，样式入口有效。
- [ ] 官网使用正式包，Demo 与展示源码同源，API 元数据一致。
- [ ] 鼠标、键盘、焦点、ARIA、搜索和清空路径已真实操作。
- [ ] 1440/1024/375 、浮层几何、无溢出、无新控制台错误和局部截图已验收。
- [ ] 实施结果仅声明 `candidate_pass`，独立最终验证保持 `pending`。
