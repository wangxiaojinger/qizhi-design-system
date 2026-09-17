import { LineChart } from "@wangxiaojinger/qizhi-react";

const data = [
  { x: "2026-09-01", series: "service-a", value: 80 },
  { x: "2026-09-01", series: "service-b", value: 40 },
  { x: "2026-09-02", series: "service-a", value: 100 },
  { x: "2026-09-02", series: "service-b", value: 80 },
  { x: "2026-09-03", series: "service-a", value: 90 },
  { x: "2026-09-03", series: "service-b", value: 60 },
  { x: "2026-09-04", series: "service-a", value: 140 },
  { x: "2026-09-04", series: "service-b", value: 90 },
  { x: "2026-09-05", series: "service-a", value: 120 },
  { x: "2026-09-05", series: "service-b", value: 90 },
  { x: "2026-09-06", series: "service-a", value: 160 },
  { x: "2026-09-06", series: "service-b", value: 120 },
  { x: "2026-09-07", series: "service-a", value: 150 },
  { x: "2026-09-07", series: "service-b", value: 110 },
];

const series = [
  { key: "service-a", label: "服务甲" },
  { key: "service-b", label: "服务乙" },
];

export default function MultiLineDemo() {
  return <LineChart focusable data={data} series={series} label="不同服务请求量趋势图" unit="次" />;
}
