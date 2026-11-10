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
/** 图表绘图区的拖选结果，起止值均为所选分类的包含边界。 */
export interface ChartRange { readonly start: string; readonly end: string }
/** 连续时间轴上的 Unix 毫秒边界。 */
export interface ChartTimeRange { readonly start: number; readonly end: number }
/** 连续时间轴的真实左右边界。step 为 Unix 毫秒步长，省略时按 precision 对齐。拖选起点向下、终点向上对齐，且限制在时间域内。 */
export interface ChartTimeDomain extends ChartTimeRange { readonly step?: number }
/** 按展示分类返回拖选范围的兼容模式。 */
export interface ChartCategoryRangeSelection { readonly timeDomain?: never; readonly onChange: (range: ChartRange) => void }
/** 按连续时间域返回拖选范围，可选格式化拖选预览。 */
export interface ChartTimeRangeSelection {
  readonly timeDomain?: ChartTimeDomain;
  readonly onChange?: (range: ChartTimeRange) => void;
  /** 游标和选区的时间显示精度，默认 second。未显式配置 step 时也用作拖选步长。 */
  readonly precision?: "millisecond" | "second" | "minute";
  /** 根据未对齐的选区决定毫秒步长。无有效返回值时沿用 timeDomain.step 或 precision。 */
  readonly resolveStep?: (range: ChartTimeRange) => number | undefined;
  /** 自定义游标与选区的时间文本，例如按用户时区格式化。默认按 UTC 取值，省略时区后缀。 */
  readonly formatTime?: (ms: number) => string;
}
/** 时间轴默认支持拖选，false 显式关闭。 */
export type ChartRangeSelection = ChartTimeRangeSelection | false;
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
  /** 日期标签用于分类比较时，显式指定 category。 */
  xAxisType?: "category" | "time";
  rangeSelection?: ChartRangeSelection;
  loading?: boolean;
  error?: string;
  height?: number;
  className?: string;
  id?: string;
  ref?: Ref<HTMLDivElement>;
}
export type BarChartMode = "normal" | "grouped" | "stacked";
export interface BarChartProps extends LineChartProps { mode?: BarChartMode }
