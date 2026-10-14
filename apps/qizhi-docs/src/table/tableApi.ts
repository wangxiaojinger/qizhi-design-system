import type { TableColumn, TableProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type ApiName = Extract<keyof TableProps<Record<string, unknown>>, string>;
type TableApiItem = ComponentApiItem<ApiName>;
type ColumnApiName = Extract<keyof TableColumn<Record<string, unknown>>, string>;
type TableColumnApiItem = ComponentApiItem<ColumnApiName>;
export const tableApiDefaultBehaviors = [
  "普通数据列表默认使用 layoutMode=\"fill\" 与 tableLayout=\"fixed\"，表格占满容器。稳定的状态、日期、数值和操作列应设置数字 width；名称、标题或描述等主内容列可用 minWidth 与 grow 承接剩余空间。不要等分短内容列，也不要通过增加 Padding 消耗空白。",
  "fixed 模式中，只有所有 width 都是数字或未设置时，minWidth、maxWidth、grow 才启用确定性分配。数字 width 是基准；无 width 的列以 minWidth 或 120px 为基准；grow 为正数的列按权重分配剩余空间，并受 maxWidth 限制。所有 grow 列到达 maxWidth 后保留右侧留白。",
  "当可用宽度不足时，grow 列先缩至其 minWidth 或 120px 下限；仍不足时由表格内部横向滚动处理。数字 scrollX 参与这一宽度预算并可作为 grow 的目标宽度；约束模式不支持 string scrollX，也不能混用 string width。列宽按业务合法内容、表头、排序图标、控件间距和正常 Padding 预算，不根据当前页数据测量。",
  "tableLayout=\"auto\" 时，minWidth 交给浏览器的原生表格布局；maxWidth 与 grow 不参与数字分配，不应组合使用。layoutMode=\"compact\" 且未显式 tableLayout 时默认使用 auto 并按内容收缩；显式 tableLayout=\"fixed\" 且存在约束时，紧凑模式按数字预算收缩，不向 grow 列分配多余空间。",
  "每个表格都通过 colgroup 表达列宽，因此 showHeader=false 仍保持列声明。固定列按实际渲染的列宽计算同侧累计偏移，支持同侧多个业务列；选择和展开辅助列纳入列结构与测量索引，但自身不固定，会随内容滚动。左右固定列加前置选择、展开等辅助列的实际总宽度应小于最小容器宽度，须在 scrollLeft=0、滚动中和末端分别验证，避免窄屏相撞。",
  "列默认左对齐。使用 align=\"right\" 或 align=\"center\" 时，表头、排序控件和数据单元格同步对齐；组件不根据字段名推断金额、日期或状态语义。操作列按所有状态和语言中的最宽合法组合设置稳定 width，翻页、筛选或加载时不改变操作展示方式与列宽。",
  "表格数据单元格内的文字按钮（Button type=\"text\"）和链接（Link），左右内边距统一为 0，与同列普通文本对齐。此规则由 Table 默认提供，无需新增参数或业务 CSS；上下内边距、颜色、禁用状态和交互行为不变，普通按钮及表格外控件不受影响。",
  "数据单元格默认允许文本自然换行，行高随内容撑开。size 通过上下内边距控制密度：default 为 16px、middle 为 12px、small 为 8px，不把内容行锁定为固定高度。",
  "TableColumn.ellipsis 默认为 false；设为 true 或 { showTitle } 时，该列使用单行省略。showTitle 默认开启原生 title 提示，设为 false 可关闭。",
  "列表中的标签使用 Tag 默认中性色并保持单行。标签数量或总宽度超出单元格可用宽度时，优先展示前 N 个完整标签，其余折叠为 +N；悬浮或聚焦 +N 时通过 Tooltip 展示全部隐藏标签。单个 Tag 超出最大宽度时使用省略号，并通过 Tooltip 展示完整内容。列表行高不随标签数量增加。此规则通过 render 组合 Tag 与 Tooltip 实现，不新增 Table 参数。",
] as const;
export const tableApi = [
  { name: "columns", description: "列定义，支持渲染、排序、固定、单元格合并和列级 ellipsis。", type: "TableColumn<RecordType>[]", defaultValue: "—" },
  { name: "dataSource", description: "表格数据。", type: "RecordType[]", defaultValue: "—" },
  { name: "rowKey", description: "行唯一键字段或取值函数。", type: "keyof RecordType | ((record) => string | number)", defaultValue: "—" },
  { name: "size", description: "通过单元格上下内边距调整表格密度，多行内容会自动撑开行高。", type: '"default" | "middle" | "small"', defaultValue: '"default"' },
  { name: "border", description: "是否显示外边框。", type: "boolean", defaultValue: "false" },
  { name: "borderCell", description: "是否显示单元格纵向边框。", type: "boolean", defaultValue: "false" },
  { name: "hover", description: "是否启用行悬浮高亮。", type: "boolean", defaultValue: "true" },
  { name: "stripe", description: "是否显示斑马纹。", type: "boolean", defaultValue: "false" },
  { name: "showHeader", description: "是否显示表头。", type: "boolean", defaultValue: "true" },
  { name: "loading", description: "是否显示表格内部加载态。", type: "boolean", defaultValue: "false" },
  { name: "scrollX", description: "表格内部横向滚动的最小宽度。使用 fixed 约束分配时仅支持数字，并作为 grow 的目标宽度；保留 string 以兼容既有非约束表格。", type: "number | string", defaultValue: "—" },
  { name: "tableLayout", description: "原生表格布局算法。fixed 下可使用数字列宽约束；auto 下由浏览器处理 minWidth，maxWidth 与 grow 不参与分配。显式设置会覆盖 layoutMode 推导的算法。", type: '"fixed" | "auto"', defaultValue: '"fixed"' },
  { name: "layoutMode", description: "fill 占满容器；compact 按内容或数字预算收缩。compact 未显式 tableLayout 时使用 auto；显式 fixed 且有约束时不分配多余空间。", type: '"fill" | "compact"', defaultValue: '"fill"' },
  { name: "rowSelection", description: "行选择配置。", type: "TableRowSelection<RecordType>", defaultValue: "—" },
  { name: "expandable", description: "展开行配置。", type: "TableExpandable<RecordType>", defaultValue: "—" },
  { name: "childrenColumnName", description: "树形数据的子节点字段。", type: "keyof RecordType", defaultValue: '"children"' },
  { name: "pagination", description: "分页配置；复用 QIZHI Pagination。", type: "false | TablePaginationConfig", defaultValue: "false" },
  { name: "empty", description: "自定义空状态内容；默认复用 QIZHI Empty。", type: "ReactNode", defaultValue: "<Empty />" },
  { name: "draggable", description: "是否启用指针拖拽排序。", type: "boolean", defaultValue: "false" },
  { name: "showSorterTooltip", description: "是否显示排序提示；可指定提示作用于完整表头或仅排序图标。列级配置优先。", type: 'boolean | { target?: "full-header" | "sorter-icon" }', defaultValue: "true" },
  { name: "onSortChange", description: "排序状态变化时触发。", type: "(order, column) => void", defaultValue: "—" },
  { name: "onRowOrderChange", description: "指针拖拽完成后回传重排数据与位置。", type: "(dataSource, info) => void", defaultValue: "—" },
] as const satisfies readonly TableApiItem[];

export const tableColumnApi = [
  { name: "key", description: "列的稳定唯一键。", type: "string", defaultValue: "—" },
  { name: "title", description: "列标题内容。", type: "ReactNode", defaultValue: "—" },
  { name: "dataIndex", description: "读取当前行数据的字段名。", type: "keyof RecordType", defaultValue: "—" },
  { name: "width", description: "列宽。数字 width 是 fixed 约束分配的基准；string 形式保留兼容，但不能与 minWidth、maxWidth、grow 的确定性分配混用。", type: "number | string", defaultValue: "—" },
  { name: "minWidth", description: "列最小宽度。fixed 约束分配中作为下限；tableLayout=auto 时交给原生表格处理。", type: "number", defaultValue: "—" },
  { name: "maxWidth", description: "fixed 数字分配的列宽上限，包含非 grow 列；显式 minWidth 大于 maxWidth 时最小值优先。tableLayout=auto 时不参与分配。", type: "number", defaultValue: "—" },
  { name: "grow", description: "fixed 约束分配的正数权重，用于按权重承接剩余空间；tableLayout=auto 时不参与分配。", type: "number", defaultValue: "—" },
  { name: "align", description: "列内容与表头的水平对齐方式；排序控件同步对齐。", type: '"left" | "center" | "right"', defaultValue: '"left"' },
  { name: "fixed", description: "将业务列固定在水平滚动区域的左侧或右侧。支持同侧多个固定业务列并按实际渲染宽度累计偏移。", type: '"left" | "right"', defaultValue: "—" },
  { name: "ellipsis", description: "将该列内容限制为单行省略。对象形式可通过 `showTitle` 关闭默认的原生 title 提示。", type: "boolean | { showTitle?: boolean }", defaultValue: "false" },
  { name: "render", description: "自定义单元格内容。", type: "(value, record, index) => ReactNode", defaultValue: "—" },
  { name: "sorter", description: "客户端排序比较函数。", type: "(a, b) => number", defaultValue: "—" },
  { name: "sortDirections", description: "该列允许的排序切换顺序；默认依次为升序、降序、取消。重复首项可形成不取消的循环。", type: '("ascend" | "descend")[]', defaultValue: '["ascend", "descend"]' },
  { name: "defaultSortOrder", description: "列的默认排序状态。", type: '"ascend" | "descend"', defaultValue: "—" },
  { name: "showSorterTooltip", description: "覆盖 Table 的排序提示配置。", type: 'boolean | { target?: "full-header" | "sorter-icon" }', defaultValue: "—" },
  { name: "onCell", description: "返回内容单元格的合并、类名和样式配置。", type: "(record, index) => TableCellProps", defaultValue: "—" },
] as const satisfies readonly TableColumnApiItem[];
