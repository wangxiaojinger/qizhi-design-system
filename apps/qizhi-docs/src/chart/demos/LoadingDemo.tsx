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

export default function LoadingDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="chart-demo-stack">
      <div className="chart-demo-controls" aria-label="图表演示控制">
        <div className="chart-demo-control">
          <span>加载中</span>
          <Switch
            checked={loading}
            aria-label="切换图表加载状态"
            onChange={setLoading}
          />
        </div>
      </div>
      <LineChart focusable
        data={data}
        series={series}
        label="加载中的请求量趋势图"
        unit="次"
        loading={loading}
      />
    </div>
  );
}
