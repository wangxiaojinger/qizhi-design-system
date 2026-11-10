import type { ChartDateRange, ChartDatum, LineChartProps } from "@wangxiaojinger/qizhi-react";
import { useState } from "react";
import { LineChart, Switch } from "@wangxiaojinger/qizhi-react";

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

type DemoQuery = (data: readonly ChartDatum[], dateRange?: ChartDateRange) => Pick<LineChartProps, "data" | "dateRange" | "rangeSelection">;

export default function ErrorDemo({ query = (data, dateRange) => ({ data, dateRange }) }: { query?: DemoQuery } = {}) {
  const [hasError, setHasError] = useState(true);

  return (
    <div className="chart-demo-stack">
      <div className="chart-demo-controls" aria-label="图表演示控制">
        <div className="chart-demo-control">
          <span>显示错误状态</span>
          <Switch
            checked={hasError}
            aria-label="切换图表错误状态"
            onChange={setHasError}
          />
        </div>
      </div>
      <LineChart focusable
        {...query(data)}
        series={series}
        label="错误状态请求量趋势图"
        unit="次"
        error={hasError ? "数据加载失败，请稍后重试" : undefined}
      />
    </div>
  );
}
