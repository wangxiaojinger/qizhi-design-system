import "@wangxiaojinger/qizhi-tokens/style.css";
import { createRoot } from "react-dom/client";
import { BarChart, LineChart } from "../src/index";
import type { FocusedItem, BarChartProps } from "../src/index";
import { renderChart } from "../src/chart/chartEngine";
import { normalizeChart } from "../src/chart/chartModel";
const root = createRoot(document.getElementById("public")!);
const host = document.getElementById("probe")!;
const series = [{ key: "cpu", label: "处理器" }, { key: "gpu", label: "显卡" }];
const data = ["09-01", "09-02", "09-03"].flatMap((x, i) => series.map((s, j) => ({ x, series: s.key, value: 20 + i * 15 + j * 10 })));
let chart: Awaited<ReturnType<typeof renderChart>>;
let changes: (FocusedItem | null)[] = [];
let props: BarChartProps;
let kind = "bar";
let generation = 0;
const draw = () => root.render(kind === "line" ? <LineChart key={generation} {...props} /> : <BarChart key={generation} {...props} />);
const init = async (mode: "normal" | "grouped" | "stacked" | "line", controlled = false, focusable = true, clear = true, dimOpacity = 0.3) => {
  generation++; chart?.destroy(); changes = []; kind = mode === "line" ? "line" : "bar";
  const definitions = mode === "normal" ? series.slice(0, 1) : series;
  const values = data.filter(d => definitions.some(s => s.key === d.series));
  props = { label: "聚焦用量", unit: "次", data: values, series: definitions, mode: mode === "line" ? "normal" : mode,
    focusable, clearFocusOnBackgroundClick: clear, dimOpacity, ...(controlled ? { focusedItem: null } : {}), onFocusChange: item => { changes.push(item); } };
  draw();
  // 公共卡片两侧各24px，窄屏绘图区至少520px；探针保持相同几何尺寸。
  const width = Math.max(520, Math.floor(document.getElementById("public")!.getBoundingClientRect().width - 48));
  chart = await renderChart(host, { model: normalizeChart(values, definitions), series: definitions, visibleKeys: definitions.map(s => s.key),
    kind: kind as "line" | "bar", mode: props.mode!, width, height: 280, xFormatter: x => x, valueFormatter: String, focusable });
};
const shapes = () => chart.getContext().canvas!.document.getElementsByClassName("element").map(element => {
  const bound = (element as unknown as { __data__: { data: { x: string; series: string }; seriesIndex?: number[] } }).__data__;
  const box = element.getBBox();
  return { key: bound.data.x, series: bound.data.series, line: Array.isArray(bound.seriesIndex), x: box.x, y: box.y, width: box.width, height: box.height, opacity: Number(element.style.opacity ?? 1), fill: String(element.style.fill), stroke: String(element.style.stroke) };
});
Object.assign(window, { chartFocusProbe: { init, shapes, changes: () => changes,
  set: (item: FocusedItem | null) => { props = { ...props, focusedItem: item }; draw(); },
  focusEngine: (item: FocusedItem | null, opacity = 0.3) => chart.updateFocus(item, opacity),
} });

