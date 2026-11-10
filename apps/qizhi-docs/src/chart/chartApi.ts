import type {
  BarChartProps,
  FocusedItem,
  ChartDatum,
  ChartSeries,
  LineChartProps,
  DateTimeRangePickerProps,
  GranularitySelectProps,
} from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type ChartCommonApiItem = ComponentApiItem<keyof LineChartProps>;
type BarChartApiItem = ComponentApiItem<keyof BarChartProps>;
type ChartDatumApiItem = ComponentApiItem<keyof ChartDatum>;
type ChartSeriesApiItem = ComponentApiItem<keyof ChartSeries>;

export const chartCommonApi = [
  { name: "xAxisType", description: "默认识别按时间顺序排列的 ISO 日期和时间戳。日期仅用作分类标签时设置 category。", type: '"category" | "time"', defaultValue: "自动识别" },
  { name: "rangeSelection", description: "时间轴默认可拖选，分类轴不启用。设置 false 可关闭。有 onChange 时由页面联动查询，无回调时缩小当前图表范围。precision 默认秒，可设置毫秒或分钟。timeDomain 可覆盖推断边界和对齐步长，resolveStep 可按选区跨度决定步长。", type: "ChartRangeSelection", defaultValue: "时间轴启用" },
  { name: "focusable", description: "允许数据项持续聚焦；默认关闭，保留现有行为。", type: "boolean", defaultValue: "false" },
  { name: "focusedItem", description: "受控聚焦项；undefined 为非受控，null 表示无聚焦。", type: "FocusedItem | null", defaultValue: "undefined" },
  { name: "defaultFocusedItem", description: "非受控初始聚焦项，后续变更忽略。", type: "FocusedItem | null", defaultValue: "null" },
  { name: "onFocusChange", description: "聚焦变更回调；受控模式通知业务层更新，数据移除时非受控清空并通知。", type: "(item: FocusedItem | null) => void", defaultValue: "—" },
  { name: "dimOpacity", description: "其他数据图形的透明度；有限值约束到 0～1，非有限值回退 0.3。", type: "number", defaultValue: "0.3" },
  { name: "clearFocusOnBackgroundClick", description: "点击绘图区空白清空；轴、图例、标题不清空。", type: "boolean", defaultValue: "true" },

  {
    name: "data",
    description: "数据（data）由业务页面传入；图表不请求、计费或计算业务指标。",
    type: "readonly ChartDatum[]",
    defaultValue: "必填",
  },
  {
    name: "series",
    description: "系列（series）声明固定图例顺序、名称和颜色映射。",
    type: "readonly ChartSeries[]",
    defaultValue: "必填",
  },
  {
    name: "dateRange",
    description: "日期范围（dateRange）；传入 YYYY-MM-DD 起止日期后按自然日补齐，缺少的数据日期按各系列 0 展示。",
    type: "{ start: string; end: string }",
    defaultValue: "—",
  },
  {
    name: "label",
    description: "图表可访问名称（label），同时用作可见卡片标题。",
    type: "string",
    defaultValue: "必填",
  },
  {
    name: "unit",
    description: "统一单位（unit），以括号形式跟随标题显示，并用于提示信息和数据表。",
    type: "string",
    defaultValue: "—",
  },
  {
    name: "xFormatter",
    description: "横轴文本格式化（xFormatter）适用于横轴、提示与数据表。等间隔时间数据按可用宽度选择固定刻度间隔，默认按时间跨度简写 ISO 时间戳。",
    type: "(value: string) => string",
    defaultValue: "日期显示为 M月D日，时间刻度按跨度简写",
  },
  {
    name: "valueFormatter",
    description: "数值文本格式化（valueFormatter），不改变参与绘图的数值。",
    type: "(value: number) => string",
    defaultValue: "中文地区数字格式",
  },
  {
    name: "legend",
    description: "显示图例（legend）；关闭时恢复全部系列，避免隐藏后无法恢复。",
    type: "boolean",
    defaultValue: "true",
  },
  {
    name: "tooltip",
    description: "显示数据提示（tooltip）；完整数据表仅提供给辅助技术，不显示查看数据入口。",
    type: "boolean",
    defaultValue: "true",
  },
  {
    name: "loading",
    description: "加载状态（loading）隐藏旧数据绘图并保留绘图区高度。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "error",
    description: "业务错误信息（error）；由业务页面决定何时清除，不内置重试。",
    type: "string",
    defaultValue: "—",
  },
  {
    name: "height",
    description: "绘图区高度（height），单位为像素，不包括标题和图例。",
    type: "number",
    defaultValue: "280",
  },
  {
    name: "className",
    description: "根容器类名（className），仅用于外部布局，不能穿透私有节点。",
    type: "string",
    defaultValue: "—",
  },
  {
    name: "id",
    description: "根容器标识（id），用于必要的文档或可访问关联。",
    type: "string",
    defaultValue: "自动生成",
  },
  {
    name: "ref",
    description: "根容器引用（ref），指向 HTMLDivElement（容器元素），不返回底层引擎实例。",
    type: "Ref<HTMLDivElement>",
    defaultValue: "—",
  },
] as const satisfies readonly ChartCommonApiItem[];

export const barChartApi = [
  {
    name: "mode",
    description: "模式（mode）；normal（普通）只允许一个系列，多系列必须选择 grouped（分组）或 stacked（堆叠）。",
    type: '"normal" | "grouped" | "stacked"',
    defaultValue: "normal（普通）",
  },
] as const satisfies readonly BarChartApiItem[];

export const chartDatumApi = [
  {
    name: "x",
    description: "分类或时间键（x），按首次出现的输入顺序展示。",
    type: "string",
    defaultValue: "必填",
  },
  {
    name: "series",
    description: "系列键（series），必须引用已声明的系列。",
    type: "string",
    defaultValue: "必填",
  },
  {
    name: "value",
    description: "数值（value）；0 是有效值，null 表示缺失数据。",
    type: "number | null",
    defaultValue: "必填",
  },
] as const satisfies readonly ChartDatumApiItem[];

export const chartSeriesApi = [
  {
    name: "key",
    description: "稳定系列键（key），用于匹配数据点且在同一图表中必须唯一。",
    type: "string",
    defaultValue: "必填",
  },
  {
    name: "label",
    description: "可读系列名称（label），显示在图例、提示信息和数据表中。",
    type: "string",
    defaultValue: "必填",
  },
  {
    name: "colorToken",
    description: "颜色变量（colorToken），仅接受已登记的启智设计变量；默认按蓝、绿、黄、紫、橙、红、粉顺序循环。",
    type: "string",
    defaultValue: "按系列顺序分配",
  },
] as const satisfies readonly ChartSeriesApiItem[];

export const focusedItemApi = [
  { name: "seriesKey", description: "系列标识，对应 ChartSeries.key（系列键）。", type: "string", defaultValue: "必填" },
  { name: "dataIndex", description: "当前分类顺序中的索引，从零开始；不是原始扁平数组索引。", type: "number", defaultValue: "必填" },
  { name: "dataKey", description: "稳定分类标识，对应 ChartDatum.x（分类键）；定位时优先于索引，回调始终提供。", type: "string", defaultValue: "—" },
  { name: "data", description: "当前原始数据项；回调始终提供，身份比较不使用此字段。", type: "ChartDatum", defaultValue: "—" },
] as const satisfies readonly ComponentApiItem<keyof FocusedItem>[];

export const timeRangePickerApi = [
  { name: "value", description: "当前有效的毫秒时间范围，包含开始且排除结束。", type: "TimeRange", defaultValue: "必填" },
  { name: "onChange", description: "提交快捷项或通过校验的输入时触发。", type: "(range: TimeRange) => void", defaultValue: "必填" },
  { name: "timeZone", description: "显示和解析输入使用的 IANA 时区。", type: "string", defaultValue: "UTC" },
  { name: "shortcuts", description: "应用提供的快捷项，按点击时刻解析。", type: "readonly TimeRangeShortcut[]", defaultValue: "[]" },
  { name: "validate", description: "返回错误文案以阻止提交并保留草稿。", type: "(range: TimeRange) => string | undefined", defaultValue: "—" },
  { name: "disabled", description: "禁用时间范围触发器。", type: "boolean", defaultValue: "false" },
  { name: "className", description: "触发器的外部布局类名。", type: "string", defaultValue: "—" },
] as const satisfies readonly ComponentApiItem<keyof DateTimeRangePickerProps>[];

export const granularitySelectApi = [
  { name: "options", description: "手动粒度选项，允许禁用，auto 由组件提供。", type: "readonly GranularityOption[]", defaultValue: "必填" },
  { name: "value", description: "受控的粒度模式，auto 表示自动。", type: "string | number", defaultValue: "必填" },
  { name: "resolvedValue", description: "自动模式显示的实际粒度，来自 options。", type: "string | number", defaultValue: "—" },
  { name: "onChange", description: "用户选择粒度时触发。", type: "(value: string | number) => void", defaultValue: "必填" },
  { name: "disabled", description: "禁用粒度选择。", type: "boolean", defaultValue: "false" },
  { name: "className", description: "控件的外部布局类名。", type: "string", defaultValue: "—" },
] as const satisfies readonly ComponentApiItem<keyof GranularitySelectProps>[];
