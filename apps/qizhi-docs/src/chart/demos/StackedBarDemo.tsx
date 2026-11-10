import type { ChartDateRange, ChartDatum, LineChartProps } from "@wangxiaojinger/qizhi-react";
import { BarChart } from "@wangxiaojinger/qizhi-react";

const data = [
  { x: "2026-09-01", series: "input", value: 1200 },
  { x: "2026-09-01", series: "output", value: 600 },
  { x: "2026-09-02", series: "input", value: 1600 },
  { x: "2026-09-02", series: "output", value: 800 },
  { x: "2026-09-03", series: "input", value: 1400 },
  { x: "2026-09-03", series: "output", value: 700 },
  { x: "2026-09-04", series: "input", value: 2000 },
  { x: "2026-09-04", series: "output", value: 1000 },
  { x: "2026-09-05", series: "input", value: 1800 },
  { x: "2026-09-05", series: "output", value: 900 },
  { x: "2026-09-06", series: "input", value: 2400 },
  { x: "2026-09-06", series: "output", value: 1200 },
  { x: "2026-09-07", series: "input", value: 2200 },
  { x: "2026-09-07", series: "output", value: 1100 },
];

const series = [
  { key: "input", label: "输入用量" },
  { key: "output", label: "输出用量" },
];

type DemoQuery = (data: readonly ChartDatum[], dateRange?: ChartDateRange, kind?: "bar") => Pick<LineChartProps, "data" | "dateRange" | "rangeSelection">;

export default function StackedBarDemo({ query = (data, dateRange) => ({ data, dateRange }) }: { query?: DemoQuery } = {}) {
  return (
    <BarChart focusable
      {...query(data, undefined, "bar")}
      series={series}
      label="输入与输出用量堆叠柱状图"
      unit="词元"
      mode="stacked"
    />
  );
}
