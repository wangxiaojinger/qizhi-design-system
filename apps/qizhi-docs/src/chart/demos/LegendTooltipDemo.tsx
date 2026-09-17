import { useState } from "react";
import { LineChart, Switch } from "@wangxiaojinger/qizhi-react";

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

export default function LegendTooltipDemo() {
  const [legend, setLegend] = useState(true);
  const [tooltip, setTooltip] = useState(true);

  return (
    <div className="chart-demo-stack">
      <div className="chart-demo-controls" aria-label="图表演示控制">
        <div className="chart-demo-control">
          <span>显示图例</span>
          <Switch
            checked={legend}
            aria-label="切换图例显示"
            onChange={setLegend}
          />
        </div>
        <div className="chart-demo-control">
          <span>显示提示信息</span>
          <Switch
            checked={tooltip}
            aria-label="切换提示信息显示"
            onChange={setTooltip}
          />
        </div>
      </div>
      <LineChart focusable
        data={data}
        series={series}
        label="服务请求量图例与提示信息示例"
        unit="次"
        legend={legend}
        tooltip={tooltip}
      />
    </div>
  );
}
