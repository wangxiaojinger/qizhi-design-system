import type { Ref } from "react";

/** 单个分类与系列的数值；null 表示缺失，0 是有效值。 */
export interface ChartDatum { readonly x: string; readonly series: string; readonly value: number | null }
/** 系列顺序稳定，颜色只能引用启智已登记的颜色变量。 */
export interface ChartSeries { readonly key: string; readonly label: string; readonly colorToken?: string }
/** ISO 日历日期范围；起止日期均包含在内。 */
export interface ChartDateRange { readonly start: string; readonly end: string }
/** 持续聚焦的数据项。dataKey 优先于索引，dataIndex 是分类顺序索引。 */
export interface FocusedItem {
  readonly seriesKey: string;
  readonly dataIndex: number;
  readonly dataKey?: string;
  readonly data?: ChartDatum;
}
export interface ChartFocusProps {
  /** 默认 false；仅开启后启用数据项选择。 */
  focusable?: boolean;
  /** 非 undefined 为受控模式；null 明确表示无聚焦。 */
  focusedItem?: FocusedItem | null;
  /** 非受控初始聚焦，后续变更忽略。 */
  defaultFocusedItem?: FocusedItem | null;
  onFocusChange?: (item: FocusedItem | null) => void;
  /** 非聚焦图形透明度，默认 0.3，范围 0～1。 */
  dimOpacity?: number;
  /** 仅绘图区空白点击清空，默认 true。 */
  clearFocusOnBackgroundClick?: boolean;
}
export interface LineChartProps extends ChartFocusProps {
  data: readonly ChartDatum[];
  series: readonly ChartSeries[];
  /** 传入后按自然日补齐范围；没有数据的日期按各系列 0 处理。 */
  dateRange?: ChartDateRange;
  /** 图表可访问名称，同时显示为卡片标题。 */
  label: string;
  /** 标题后的括号单位，同时用于提示和数据表。 */
  unit?: string;
  xFormatter?: (value: string) => string;
  valueFormatter?: (value: number) => string;
  legend?: boolean;
  tooltip?: boolean;
  loading?: boolean;
  error?: string;
  height?: number;
  className?: string;
  id?: string;
  ref?: Ref<HTMLDivElement>;
}
export type BarChartMode = "normal" | "grouped" | "stacked";
export interface BarChartProps extends LineChartProps { mode?: BarChartMode }
