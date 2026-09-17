import { LineChart } from "@wangxiaojinger/qizhi-react";

const data = [
  { x: "2026-09-01", series: "cost", value: 0.36 },
  { x: "2026-09-02", series: "cost", value: 0.54 },
  { x: "2026-09-03", series: "cost", value: 0.45 },
  { x: "2026-09-04", series: "cost", value: 0.69 },
  { x: "2026-09-05", series: "cost", value: 0.63 },
  { x: "2026-09-06", series: "cost", value: 0.84 },
  { x: "2026-09-07", series: "cost", value: 0.78 },
];

const series = [{ key: "cost", label: "费用" }];

export default function CostTrendDemo() {
  return (
    <LineChart focusable
      data={data}
      series={series}
      label="费用趋势图"
      unit="元"
      xFormatter={(value) => value.slice(5)}
      valueFormatter={(value) => value.toFixed(2)}
    />
  );
}
