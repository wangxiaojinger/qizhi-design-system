import { useEffect, useMemo, useState } from "react";
import { Alert, Button, DateTimeRangePicker, GranularitySelect } from "@wangxiaojinger/qizhi-react";
import type { TimeRange } from "@wangxiaojinger/qizhi-react";
import { ChartApiTable } from "./ChartApiTable";
import { ChartDemoCodebox } from "./ChartDemoCodebox";
import { chartDemos } from "./chartDocs.registry";
import { defaultRange, queryDemoData, resolveDemoGranularity, shortcuts, validateDemoRange } from "./chartDocsRange";
import type { DemoGranularity } from "./chartDocsRange";
import "./chartDocs.css";

const options = [{ value: "hour", label: "按小时" }, { value: "day", label: "按天" }] as const;

export function ChartDocsIsland() {
  const [range, setRange] = useState<TimeRange>();
  const [mode, setMode] = useState<DemoGranularity>("auto");
  const [previous, setPrevious] = useState<{ range?: TimeRange; mode: DemoGranularity }>();
  const [brushFeedback, setBrushFeedback] = useState<{ message: string; invalid?: boolean }>();
  const current = range ?? defaultRange;
  const query = useMemo(() => queryDemoData(range, mode, next => {
    const error = validateDemoRange(next, mode);
    if (error) {
      setBrushFeedback({ message: error, invalid: true });
      return;
    }
    setBrushFeedback(undefined);
    if (next.start === current.start && next.end === current.end) return;
    if (mode === "auto" && resolveDemoGranularity(next, mode) === "day" && validateDemoRange(next, "hour")) {
      setBrushFeedback({ message: "已按自然日对齐选区，使用按天粒度查询。" });
    }
    setPrevious({ range, mode });
    setRange(next);
  }), [range, mode, current]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  return (
    <>
      <div className="qz-nav-intro">
        <p>基础组件 <span className="separator">/</span> <strong>数据展示</strong></p>
        <h1 id="图表-chart">图表</h1>
        <p>用于展示数据的变化趋势与分类对比，支持折线图、柱状图及分组、堆叠模式。由业务页面传入数据，统一提供图例、提示信息和状态反馈。</p>
        <p>指标计算、时间范围和数据请求由业务页面管理；传入日期范围后，图表组件会补齐缺失日期并以 0 展示。</p>
        <p>时间轴默认支持在绘图区框选，分类轴不启用。用量示例框选后会更新共同时间范围，响应式示例演示单图缩放。自动模式支持从日图框选到小时范围。快捷项以演示数据的最后一天（2026 年 9 月 10 日）为基准。</p>
        <div className="chart-demo-controls" role="group" aria-label="图表共同时间范围">
          <DateTimeRangePicker value={current} shortcuts={shortcuts} validate={next => validateDemoRange(next, mode)}
            onChange={next => { setRange(next); setPrevious(undefined); setBrushFeedback(undefined); }} />
          <GranularitySelect value={mode} resolvedValue={resolveDemoGranularity(current, mode)}
            options={options.map(option => ({ ...option, disabled: Boolean(validateDemoRange(current, option.value)) }))}
            onChange={next => {
              if (next === "auto" || next === "hour" || next === "day") {
                setRange(current);
                setMode(next);
                setPrevious(undefined);
                setBrushFeedback(undefined);
              }
            }} />
          {previous && <Button onClick={() => {
            setRange(previous.range); setMode(previous.mode); setPrevious(undefined); setBrushFeedback(undefined);
          }}>返回上一时间范围</Button>}
        </div>
        {brushFeedback && <Alert
          type={brushFeedback.invalid ? "warning" : "info"}
          role={brushFeedback.invalid ? "alert" : "status"}
          content={brushFeedback.message}
        />}
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {chartDemos.map((demo) => <ChartDemoCodebox key={demo.id} demo={demo} query={query} />)}
        <ChartApiTable />
      </div>
    </>
  );
}
