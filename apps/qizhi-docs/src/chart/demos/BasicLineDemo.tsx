import { LineChart } from "@wangxiaojinger/qizhi-react";

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

export default function BasicLineDemo() {
  return <LineChart focusable data={data} series={series} label="请求量趋势图" unit="次" />;
}
