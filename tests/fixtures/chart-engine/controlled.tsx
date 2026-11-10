import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BarChart, LineChart } from "@wangxiaojinger/qizhi-react";
import type { ChartTimeRange } from "@wangxiaojinger/qizhi-react";

const Chart = new URLSearchParams(location.search).get("kind") === "line" ? LineChart : BarChart;
const day = (date: number) => Date.UTC(2026, 0, date);
const series = [{ key: "requests", label: "请求量" }];
const data = [{ x: new Date(day(1)).toISOString(), series: "requests", value: 1 }];

function Fixture() {
  const [shifted, setShifted] = useState(false);
  const [scope, setScope] = useState("旧筛选");
  const [submission, setSubmission] = useState<{ scope: string; range: ChartTimeRange }>();
  const timeDomain = { start: day(shifted ? 0 : 1), end: day(shifted ? 2 : 4), step: 3_600_000 };

  useEffect(() => {
    const shift = () => setShifted(true);
    const changeScope = () => setScope("新筛选");
    window.addEventListener("qizhi-test-shift-domain", shift);
    window.addEventListener("qizhi-test-change-scope", changeScope);
    return () => {
      window.removeEventListener("qizhi-test-shift-domain", shift);
      window.removeEventListener("qizhi-test-change-scope", changeScope);
    };
  }, []);

  return <>
    <Chart label="受控图表" data={data} series={series}
      rangeSelection={{ timeDomain, onChange: range => setSubmission({ scope, range }) }} />
    <output aria-label="当前筛选">{scope}</output>
    <output aria-label="当前结束时间">{timeDomain.end}</output>
    <output aria-label="提交结果">{submission ? JSON.stringify(submission) : ""}</output>
  </>;
}

createRoot(document.getElementById("chart")!).render(<Fixture />);
