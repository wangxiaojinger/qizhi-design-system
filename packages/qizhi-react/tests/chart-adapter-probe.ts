import "@wangxiaojinger/qizhi-tokens/style.css";
import { renderChart } from "../src/chart/chartEngine";
import { normalizeChart } from "../src/chart/chartModel";
import type { ChartDatum } from "../src/chart/Chart.types";
const root = document.getElementById("probe")!;
const series = [{ key: "a", label: "输入" }, { key: "b", label: "输出" }];
const data: ChartDatum[] = ["一", "二", "三", "四"].flatMap((x, i) => [{ x, series: "a", value: [2, 0, 4, -2][i] }, { x, series: "b", value: [1, 3, 2, -3][i] }]);
async function run() {
  for (const mode of ["normal", "grouped", "stacked", "line-gap"] as const) {
    const host = document.createElement("div"); root.append(host); host.dataset.mode = mode;
    const single = mode === "normal" || mode === "line-gap";
    const selected = single ? series.slice(0, 1) : series;
    const values = single ? data.filter(d => d.series === "a").map(d => mode === "line-gap" && d.x === "二" ? { ...d, value: null } : d) : data;
    const chart = await renderChart(host, { kind: mode === "line-gap" ? "line" : "bar", mode: mode === "line-gap" ? "normal" : mode,
      model: normalizeChart(values, selected), series: selected, visibleKeys: selected.map(s => s.key), width: 560, height: 280, xFormatter: x => x, valueFormatter: String, focusable: mode === "line-gap" });
    const context = chart.getContext();
    host.dataset.shapes = JSON.stringify(context.canvas!.document.getElementsByClassName("element").map(element => {
      const box = element.getBBox(); return { x: box.x, y: box.y, width: box.width, height: box.height };
    }));
    if (mode === "line-gap") {
      host.dataset.segments = JSON.stringify(context.canvas!.document.getElementsByClassName("element").map(element => {
        const bound = (element as unknown as { __data__: { data: { x: string }; seriesIndex?: number[] } }).__data__;
        const { x, width } = element.getBBox();
        return { key: bound.data.x, line: Array.isArray(bound.seriesIndex), x, width };
      }));
    }
    host.dataset.colors = JSON.stringify(selected.map(s => context.views![0].scale.color.map(s.key)));
    host.dataset.ready = "true";
  }
  const durations: { count: number; milliseconds: number; canvasesAfterDestroy: number }[] = [];
  for (const count of [7, 31, 1000]) {
    const definitions = Array.from({ length: 4 }, (_, i) => ({ key: `s${i}`, label: `系列${i}` }));
    const points = Array.from({ length: count }, (_, i) => definitions.map((series, j) => ({ x: String(i), series: series.key, value: (i + j * 7) % 100 }))).flat();
    const host = document.createElement("div"); root.append(host); const start = performance.now();
    const chart = await renderChart(host, { kind: "line", mode: "normal", model: normalizeChart(points, definitions), series: definitions, visibleKeys: definitions.map(s => s.key), width: 560, height: 280, xFormatter: x => x, valueFormatter: String });
    const milliseconds = performance.now() - start; chart.destroy();
    durations.push({ count, milliseconds, canvasesAfterDestroy: host.querySelectorAll("canvas").length }); host.remove();
  }
  root.dataset.performance = JSON.stringify(durations); root.dataset.ready = "true";
}
run().catch(error => { root.dataset.error = String(error); throw error; });
