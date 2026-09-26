import type { TableColumn, TableProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type ApiName = Extract<keyof TableProps<Record<string, unknown>>, string>;
type TableApiItem = ComponentApiItem<ApiName>;
type ColumnApiName = Extract<keyof TableColumn<Record<string, unknown>>, string>;
type TableColumnApiItem = ComponentApiItem<ColumnApiName>;
export const tableApiDefaultBehaviors = [
  "表格数据单元格内的文字按钮（Button type=\"text\"）和链接（Link），左右内边距统一为 0，与同列普通文本对齐。此规则由 Table 默认提供，无需新增参数或业务 CSS；上下内边距、颜色、禁用状态和交互行为不变，普通按钮及表格外控件不受影响。",
  "数据单元格默认允许文本自然换行，行高随内容撑开。size 通过上下内边距控制密度：default 为 16px、middle 为 12px、small 为 8px，不把内容行锁定为固定高度。",
  "TableColumn.ellipsis 默认为 false；设为 true 或 { showTitle } 时，该列使用单行省略。showTitle 默认开启原生 title 提示，设为 false 可关闭。",
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
  { name: "scrollX", description: "横向滚动所需的表格最小宽度。", type: "number | string", defaultValue: "—" },
  { name: "rowSelection", description: "行选择配置。", type: "TableRowSelection<RecordType>", defaultValue: "—" },
  { name: "expandable", description: "展开行配置。", type: "TableExpandable<RecordType>", defaultValue: "—" },
  { name: "childrenColumnName", description: "树形数据的子节点字段。", type: "keyof RecordType", defaultValue: '"children"' },
  { name: "pagination", description: "分页配置；复用 QIZHI Pagination。", type: "false | TablePaginationConfig", defaultValue: "false" },
  { name: "empty", description: "自定义空状态内容；默认复用 QIZHI Empty。", type: "ReactNode", defaultValue: "<Empty />" },
  { name: "draggable", description: "是否启用指针拖拽排序。", type: "boolean", defaultValue: "false" },
  { name: "onSortChange", description: "排序状态变化时触发。", type: "(order, column) => void", defaultValue: "—" },
  { name: "onRowOrderChange", description: "指针拖拽完成后回传重排数据与位置。", type: "(dataSource, info) => void", defaultValue: "—" },
] as const satisfies readonly TableApiItem[];

export const tableColumnApi = [
  { name: "key", description: "列的稳定唯一键。", type: "string", defaultValue: "—" },
  { name: "title", description: "列标题内容。", type: "ReactNode", defaultValue: "—" },
  { name: "dataIndex", description: "读取当前行数据的字段名。", type: "keyof RecordType", defaultValue: "—" },
  { name: "width", description: "列宽度；数字按像素处理。", type: "number | string", defaultValue: "—" },
  { name: "fixed", description: "将列固定在水平滚动区域的左侧或右侧。", type: '"left" | "right"', defaultValue: "—" },
  { name: "ellipsis", description: "将该列内容限制为单行省略。对象形式可通过 `showTitle` 关闭默认的原生 title 提示。", type: "boolean | { showTitle?: boolean }", defaultValue: "false" },
  { name: "render", description: "自定义单元格内容。", type: "(value, record, index) => ReactNode", defaultValue: "—" },
  { name: "sorter", description: "客户端排序比较函数。", type: "(a, b) => number", defaultValue: "—" },
  { name: "defaultSortOrder", description: "列的默认排序状态。", type: '"ascend" | "descend"', defaultValue: "—" },
  { name: "onCell", description: "返回内容单元格的合并、类名和样式配置。", type: "(record, index) => TableCellProps", defaultValue: "—" },
] as const satisfies readonly TableColumnApiItem[];
