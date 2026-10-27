import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import type { PaginationProps } from "../pagination/Pagination.types";

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
  /** 默认 table，body 仅遮罩数据区并保留当前数据。 */
  scope?: "table" | "body";
  tip?: ReactNode;
}
export type TableLayout = "fixed" | "auto";
export type TableLayoutMode = "fill" | "compact";
export type TableColumnAlign = "left" | "center" | "right";

export interface TableCellProps { rowSpan?: number; colSpan?: number; className?: string; style?: CSSProperties }
export interface TableColumn<RecordType> {
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
  border?: boolean;
  borderCell?: boolean;
  hover?: boolean;
  stripe?: boolean;
  showHeader?: boolean;
  loading?: boolean | TableLoadingConfig;
  /** 容器宽度小于等于此值时取消固定列，默认不启用。 */
  fixedBreakpoint?: number;
  scrollX?: number | string;
  /** 默认 fixed；compact 未显式指定时使用 auto。 */
  tableLayout?: TableLayout;
  /** 默认 fill；compact 按内容或数字预算收缩。 */
  layoutMode?: TableLayoutMode;
  rowSelection?: TableRowSelection<RecordType>;
  expandable?: TableExpandable<RecordType>;
  childrenColumnName?: keyof RecordType;
  pagination?: false | TablePaginationConfig;
  empty?: ReactNode;
  /** 可选空态垂直内边距；默认保持历史布局。 */
  emptyPadding?: number;
  /** 仅替换无自定义 render 的 null/undefined/空字符串。默认不替换。 */
  emptyCell?: ReactNode;
  draggable?: boolean;
  showSorterTooltip?: TableSorterTooltip;
  onSortChange?: (order: TableSortOrder, column: TableColumn<RecordType>) => void;
  onRowOrderChange?: (dataSource: RecordType[], info: TableRowOrderInfo) => void;
}
