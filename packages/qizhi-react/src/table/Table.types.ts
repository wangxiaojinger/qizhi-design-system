import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import type { PaginationProps } from "../pagination/Pagination.types";
import type { TableColumnCustomization, TableColumnLayoutMeta, TableColumnLayoutOptions, TableColumnLayoutState } from "./TableColumnLayout.types";

export type TableSize = "default" | "middle" | "small";
export type TableRowKey = string | number;
export type TableSortOrder = "ascend" | "descend" | null;
export type TableSortDirection = Exclude<TableSortOrder, null>;
export type TableSorterTooltipTarget = "full-header" | "sorter-icon";
export type TableSorterTooltip = boolean | { target?: TableSorterTooltipTarget };
export type TableFixed = "left" | "right";
export type TablePaginationPosition = "bottomLeft" | "bottomCenter" | "bottomRight";
export type TableColumnEllipsis = boolean | {
  showTitle?: boolean;
  /** 显式启用文本叶子省略；不裁切自定义 render 的控件。 */
  rows?: 1 | 2;
  /** 仅实际截断时提供可聚焦、可点击的全文 Tooltip。 */
  tooltip?: boolean;
};
export interface TableLoadingConfig {
  spinning: boolean;
  /** 默认 body，仅遮罩数据区并保留当前数据；table遮罩全表。 */
  scope?: "table" | "body";
  tip?: ReactNode;
}
export type TableLayout = "fixed" | "auto";
export type TableLayoutMode = "fill" | "compact";
export type TableColumnAlign = "left" | "center" | "right";

export interface TableCellProps { rowSpan?: number; colSpan?: number; className?: string; style?: CSSProperties }
export interface TableColumn<RecordType> extends TableColumnLayoutOptions {
  key: string;
  title: ReactNode;
  dataIndex?: keyof RecordType;
  width?: number | string;
  /** fixed 数字分配的下限；auto 下由浏览器处理。 */
  minWidth?: number;
  /** fixed 数字分配的上限，不与 string width 或 auto 组合。 */
  maxWidth?: number;
  /** fixed 数字分配的正数权重；未指定最小宽度时基准为 120px。 */
  grow?: number;
  /** 未设置时沿用 grow 的压缩权重；0 禁止压缩。 */
  shrink?: number;
  /** 数字越小越先压缩，同级按 shrink 权重分配。 */
  shrinkPriority?: number;
  /** 数字越小越先扩展，同级按 grow 权重分配。 */
  growPriority?: number;
  align?: TableColumnAlign;
  fixed?: TableFixed;
  ellipsis?: TableColumnEllipsis;
  render?: (value: unknown, record: RecordType, index: number) => ReactNode;
  sorter?: (a: RecordType, b: RecordType) => number;
  sortDirections?: TableSortDirection[];
  defaultSortOrder?: TableSortDirection;
  showSorterTooltip?: TableSorterTooltip;
  onCell?: (record: RecordType, index: number) => TableCellProps;
}

export interface TableRowSelection<RecordType> {
  type?: "checkbox" | "radio";
  selectedRowKeys?: TableRowKey[];
  defaultSelectedRowKeys?: TableRowKey[];
  checkStrictly?: boolean;
  getCheckboxProps?: (record: RecordType) => { disabled?: boolean };
  onChange?: (selectedRowKeys: TableRowKey[], selectedRows: RecordType[]) => void;
}

export interface TableExpandable<RecordType> {
  expandedRowRender?: (record: RecordType, index: number) => ReactNode;
  rowExpandable?: (record: RecordType) => boolean;
  expandedRowKeys?: TableRowKey[];
  defaultExpandedRowKeys?: TableRowKey[];
  onExpandedChange?: (expanded: boolean, record: RecordType, expandedRowKeys: TableRowKey[]) => void;
}

export interface TablePaginationConfig extends Omit<PaginationProps, "total"> {
  total?: number;
  position?: TablePaginationPosition;
}
export interface TableRowOrderInfo { active: TableRowKey; target: TableRowKey; fromIndex: number; toIndex: number }

export interface TableProps<RecordType extends object> extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  columns: TableColumn<RecordType>[];
  dataSource: RecordType[];
  rowKey: keyof RecordType | ((record: RecordType) => TableRowKey);
  size?: TableSize;
  /** 默认false，可显式开启。 */
  border?: boolean;
  borderCell?: boolean;
  hover?: boolean;
  stripe?: boolean;
  showHeader?: boolean;
  /** 默认false；开启时默认仅数据区，scope=table可覆盖。 */
  loading?: boolean | TableLoadingConfig;
  /** 普通文本默认两行省略且仅实际截断时提示；列级配置优先，false自然换行。 */
  ellipsis?: TableColumnEllipsis;
  /** 默认640，容器宽度小于等于阈值时取消固定列，false关闭断点。 */
  fixedBreakpoint?: number | false;
  scrollX?: number | string;
  /** 默认 fixed；compact 未显式指定时使用 auto。 */
  tableLayout?: TableLayout;
  /** 默认 fill；compact 按内容或数字预算收缩。 */
  layoutMode?: TableLayoutMode;
  /** 调宽、移动和显隐默认关闭；逐字段配置可覆盖默认值。 */
  columnCustomization?: TableColumnCustomization;
  columnLayout?: TableColumnLayoutState;
  defaultColumnLayout?: TableColumnLayoutState;
  onColumnLayoutChange?: (layout: TableColumnLayoutState, meta: TableColumnLayoutMeta) => void;
  /** 树入口锚定稳定列，不随物理列下标移动；树列不能被隐藏。 */
  treeColumnKey?: string;
  rowSelection?: TableRowSelection<RecordType>;
  expandable?: TableExpandable<RecordType>;
  childrenColumnName?: keyof RecordType;
  pagination?: false | TablePaginationConfig;
  empty?: ReactNode;
  /** 空态上下内边距各默认36px，0关闭额外留白。 */
  emptyPadding?: number;
  /** 仅替换无自定义 render 的 null/undefined/空字符串。默认 "-"，null关闭占位。 */
  emptyCell?: ReactNode;
  draggable?: boolean;
  showSorterTooltip?: TableSorterTooltip;
  onSortChange?: (order: TableSortOrder, column: TableColumn<RecordType>) => void;
  onRowOrderChange?: (dataSource: RecordType[], info: TableRowOrderInfo) => void;
}
