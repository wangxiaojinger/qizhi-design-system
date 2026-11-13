import { useEffect, useMemo, useState } from "react";
import { Alert, Button, DateTimeRangePicker, GranularitySelect, usageTimeShortcuts } from "@wangxiaojinger/qizhi-react";
import type { TimeRange } from "@wangxiaojinger/qizhi-react";
import { ChartApiTable } from "./ChartApiTable";
import { ChartDemoCodebox } from "./ChartDemoCodebox";
import { chartDemos } from "./chartDocs.registry";
import { defaultRange, demoSampleShift, demoTimeZone, queryDemoData, resolveDemoGranularity, validateDemoRange } from "./chartDocsRange";
import type { DemoGranularity } from "./chartDocsRange";
import "./chartDocs.css";

const options = [{ value: "hour", label: "按小时" }, { value: "day", label: "按天" }] as const;

export function ChartDocsIsland() {
  const [range, setRange] = useState<TimeRange>(() => defaultRange(Date.now()));
  const [shortcutKey, setShortcutKey] = useState<string | undefined>("default");
  const [sampleShift, setSampleShift] = useState<number | undefined>(() => demoSampleShift(range.end));
  const [mode, setMode] = useState<DemoGranularity>("auto");
  const [history, setHistory] = useState<{ range: TimeRange; mode: DemoGranularity; shortcutKey?: string; sampleShift?: number }[]>([]);
  const previous = history.at(-1);
  const [brushFeedback, setBrushFeedback] = useState<{ message: string; invalid?: boolean }>();
  const current = range;
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
    setHistory(items => [...items, { range, mode, shortcutKey, sampleShift }]);
    setShortcutKey(undefined);
    setRange(next);
  }, sampleShift, true), [range, mode, shortcutKey, sampleShift]);

  function refresh() {
    const selected = usageTimeShortcuts.find(item => item.key === shortcutKey);
    const now = Date.now();
    const next = shortcutKey === "default" ? defaultRange(now) : selected?.resolve(now) ?? { ...range };
    if (shortcutKey) setSampleShift(demoSampleShift(next.end));
    setRange(next);
    setBrushFeedback(undefined);
  }
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
        <p>时间轴默认支持在绘图区框选，分类轴不启用。已有图表共用时间范围。小时轴显示时分，悬浮提示显示当前数据点的日期或时间。以下为演示数据。</p>
        <div className="chart-demo-controls" role="group" aria-label="图表共同时间范围">
          <DateTimeRangePicker value={current} timeZone={demoTimeZone} shortcuts={usageTimeShortcuts} disableFuture
            validate={next => validateDemoRange(next, "auto")}
            onChange={next => {
              if (next.start === range.start && next.end === range.end) return;
              setRange(next);
              setShortcutKey(undefined);
              setSampleShift(undefined);
              if (validateDemoRange(next, mode)) setMode("auto");
              setHistory([]);
              setBrushFeedback(undefined);
            }}
            onShortcutSelect={(key, next) => {
              setShortcutKey(key);
              setSampleShift(demoSampleShift(next.end));
              setMode("auto");
            }} />
          <Button onClick={refresh}>刷新</Button>
          <GranularitySelect value={mode} resolvedValue={resolveDemoGranularity(current, mode)}
            options={options.map(option => ({ ...option, disabled: Boolean(validateDemoRange(current, option.value)) }))}
            onChange={next => {
              if (next === "auto" || next === "hour" || next === "day") {
                setRange(current);
                setMode(next);
                setBrushFeedback(undefined);
              }
            }} />
          {previous && <Button onClick={() => {
            setRange(previous.range); setMode(previous.mode); setShortcutKey(previous.shortcutKey); setSampleShift(previous.sampleShift); setHistory(items => items.slice(0, -1)); setBrushFeedback(undefined);
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
