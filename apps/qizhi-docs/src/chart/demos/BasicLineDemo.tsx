import type { ChartDateRange, ChartDatum, LineChartProps } from "@wangxiaojinger/qizhi-react";
import { LineChart } from "@wangxiaojinger/qizhi-react";

const data = [
  { x: "2026-09-01", series: "requests", value: 120 },
  { x: "2026-09-02", series: "requests", value: 180 },
  { x: "2026-09-03", series: "requests", value: 150 },
  { x: "2026-09-05", series: "requests", value: 210 },
  { x: "2026-09-06", series: "requests", value: 280 },
  { x: "2026-09-07", series: "requests", value: 260 },
  { x: "2026-09-08", series: "requests", value: 300 },
  { x: "2026-09-09", series: "requests", value: 290 },
  { x: "2026-09-10", series: "requests", value: 320 },
];

const series = [{ key: "requests", label: "请求量" }];

type DemoQuery = (data: readonly ChartDatum[], dateRange?: ChartDateRange) => Pick<LineChartProps, "data" | "dateRange" | "rangeSelection">;

export default function BasicLineDemo({ query = (data, dateRange) => ({ data, dateRange }) }: { query?: DemoQuery } = {}) {
  return <LineChart focusable {...query(data, { start: "2026-09-01", end: "2026-09-10" })} series={series} label="请求量趋势图" unit="次" />;
}
