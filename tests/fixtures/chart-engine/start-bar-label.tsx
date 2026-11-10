import { createRoot } from "react-dom/client";
import { BarChart } from "@wangxiaojinger/qizhi-react";

const start = Date.UTC(2026, 0, 1);
const label = new URLSearchParams(location.search).has("short") ? "起点标签"
  : "起点标签 2026-01-01 00:00:00 至 2026-01-04 00:00:00 （本地时间）".repeat(4);
createRoot(document.getElementById("chart")!).render(<BarChart
  label="起点单柱"
  series={[{ key: "requests", label: "请求量" }]}
  data={[{ x: new Date(start).toISOString(), series: "requests", value: 1 }]}
  rangeSelection={{ timeDomain: { start, end: Date.UTC(2026, 0, 4) } }}
  xFormatter={() => label}
/>);
