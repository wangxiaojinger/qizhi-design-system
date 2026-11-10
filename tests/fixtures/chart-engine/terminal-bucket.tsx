import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BarChart, LineChart } from "@wangxiaojinger/qizhi-react";
import type { ChartTimeRange } from "@wangxiaojinger/qizhi-react";

const params = new URLSearchParams(location.search);
const Chart = params.get("kind") === "bar" ? BarChart : LineChart;
const series = [{ key: "requests", label: "请求量" }];
const day = (date: number) => Date.UTC(2026, 0, date);
const data = (params.has("single") ? [1] : [1, 2, 3]).map((date) => ({
  x: new Date(day(date)).toISOString(), series: "requests", value: date,
}));

function Fixture() {
  const [submitted, setSubmitted] = useState<ChartTimeRange>();
  const timeDomain = params.has("explicit") ? { start: day(1), end: day(4), step: 3_600_000 } : undefined;
  const rows = submitted ? data.filter(row => {
    const time = Date.parse(row.x);
    return time >= submitted.start && time < submitted.end;
  }) : [];
  return <>
    <Chart label="末桶探针" data={data} series={series} rangeSelection={{ timeDomain, onChange: params.has("local") ? undefined : setSubmitted }} />
    <output aria-label="提交时间">{submitted ? JSON.stringify(submitted) : ""}</output>
    <ol aria-label="查询结果">{rows.map(row => <li key={row.x}>{row.x}</li>)}</ol>
  </>;
}

createRoot(document.getElementById("chart")!).render(<Fixture />);
