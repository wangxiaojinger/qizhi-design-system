import type { ChartDateRange, ChartDatum, LineChartProps } from "@wangxiaojinger/qizhi-react";
import { BarChart } from "@wangxiaojinger/qizhi-react";

const data = [
  { x: "2026-09-01", series: "requests", value: 120 },
  { x: "2026-09-02", series: "requests", value: 180 },
  { x: "2026-09-03", series: "requests", value: 150 },
  { x: "2026-09-04", series: "requests", value: 230 },
  { x: "2026-09-05", series: "requests", value: 210 },
  { x: "2026-09-06", series: "requests", value: 280 },
  { x: "2026-09-07", series: "requests", value: 260 },
];

const series = [{ key: "requests", label: "请求量" }];

type DemoQuery = (data: readonly ChartDatum[], dateRange?: ChartDateRange, kind?: "bar") => Pick<LineChartProps, "data" | "dateRange" | "rangeSelection">;

export default function NormalBarDemo({ query = (data, dateRange) => ({ data, dateRange }) }: { query?: DemoQuery } = {}) {
  return <BarChart focusable {...query(data, undefined, "bar")} series={series} label="每日请求量柱状图" unit="次" />;
}
