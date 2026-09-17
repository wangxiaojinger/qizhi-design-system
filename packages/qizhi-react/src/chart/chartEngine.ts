import type { ChartSeries, BarChartMode, FocusedItem } from "./Chart.types";
import type { ChartModel } from "./chartModel";
import { colorTokenCss, seriesColorToken } from "./chartModel";
import { focusOpacity } from "./chartFocus";
import type { G2Spec } from "@antv/g2";

export const PLOT_PADDING = { left: 44, right: 1, top: 24, bottom: 40 };
const FOCUS_POINT_RADIUS = 3;
export const getPlotPadding = (_width: number, focusableLine = false) => focusableLine ? { ...PLOT_PADDING, right: PLOT_PADDING.right + FOCUS_POINT_RADIUS } : PLOT_PADDING;
export interface EngineInput {
  model: ChartModel; series: readonly ChartSeries[]; visibleKeys: string[];
  kind: "line" | "bar"; mode: BarChartMode; width: number; height: number;
  focusable?: boolean;
  onItemClick?: (identity: { seriesKey: string; dataKey: string }) => void;
  onBackgroundClick?: () => void;
  xFormatter: (value: string) => string; valueFormatter: (value: number) => string;
}

export function buildPlotData(input: Pick<EngineInput, "model" | "series" | "visibleKeys">) {
  return input.series.flatMap((series, seriesIndex) => {
    if (!input.visibleKeys.includes(series.key)) return [];
    let segment = 0;
    return input.model.rows.flatMap(row => {
      const value = row.values[seriesIndex];
      if (value === null) { segment++; return []; }
      return [{ x: row.x, value, series: series.key, segment: `${seriesIndex}:${segment}`, seriesIndex }];
    });
  });
}

export async function renderChart(host: HTMLElement, input: EngineInput) {
  const { Chart } = await import("@antv/g2");
  const css = getComputedStyle(host);
  const probe = document.createElement("span"); host.append(probe);
  const resolveColor = (value: string) => { probe.style.color = value; return getComputedStyle(probe).color; };
  const colors = input.series.map((series, index) => resolveColor(colorTokenCss(seriesColorToken(series, index))));
  const textColor = resolveColor("var(--chart-text)");
  const borderColor = resolveColor("var(--chart-grid)");
  const axisColor = resolveColor("var(--chart-axis)");
  probe.remove();
  const fontFamily = css.getPropertyValue("--font-sans");
  const fontSize = parseFloat(css.getPropertyValue("--chart-label-font-size")) || 12;
  const data = buildPlotData(input);
  const measure = document.createElement("canvas").getContext("2d");
  if (measure) measure.font = `${fontSize}px ${fontFamily}`;
  const shorten = (text: string, maxWidth: number) => {
    const chars = Array.from(String(text));
    const widthOf = (value: string) => measure?.measureText(value).width ?? value.length * fontSize;
    if (widthOf(chars.join("")) <= maxWidth) return chars.join("");
    while (chars.length && widthOf(`${chars.join("")}…`) > maxWidth) chars.pop();
    return `${chars.join("")}…`;
  };
  const chart = new Chart({ container: host, width: input.width, height: input.height, autoFit: false });
  const isLine = input.kind === "line";
  const padding = getPlotPadding(input.width, isLine && input.focusable);
  const maxLabels = Math.max(2, Math.floor((input.width - padding.left - padding.right) / 100) + 1);
  const step = Math.max(1, Math.ceil((input.model.categories.length - 1) / (maxLabels - 1)));
  const axis = {
    x: { title: false, grid: false, tick: false, line: true, lineStroke: axisColor,
      labelSpacing: parseFloat(css.getPropertyValue("--chart-axis-label-gap")),
      labelTextAlign: (datum: { id: string }) => !isLine || input.model.categories.length === 1 ? "center" : datum.id === "0" ? "left" : datum.id === String(input.model.categories.length - 1) ? "right" : "center",
      labelFill: textColor, labelOpacity: 1, labelFontFamily: fontFamily, labelFontSize: fontSize,
      labelAutoHide: false, labelAutoRotate: false, labelAutoEllipsis: false, transform: [],
      labelFormatter: (x: string) => {
        const index = input.model.categories.indexOf(x);
        if (index % step !== 0 && index !== input.model.categories.length - 1) return "";
        const plotWidth = input.width - padding.left - padding.right;
        const budget = Math.max(12, Math.min(84, isLine ? plotWidth / Math.max(1, maxLabels - 1) * 0.85 : plotWidth / (input.model.categories.length + 0.7) * 1.65));
        let text = input.xFormatter(x);
        if (/^\d{4}-\d{2}-\d{2}$/.test(text) && (input.width < 260 || (measure?.measureText(text).width ?? text.length * fontSize) > budget)) text = text.slice(5);
        return shorten(text, budget);
      } },
    y: { title: false, line: false, tick: false, labelSpacing: padding.left, labelTextAlign: "left", grid: true, gridStroke: borderColor, gridStrokeOpacity: 1, gridLineDash: [],
      labelFill: textColor, labelOpacity: 1, labelFontFamily: fontFamily, labelFontSize: fontSize,
      transform: [], labelAutoEllipsis: false, labelFormatter: (value: number) => shorten(input.valueFormatter(Number(value)), padding.left - 6) },
  };
  const widthTier = window.innerWidth >= 1280 ? "large" : window.innerWidth >= 768 ? "medium" : "small";
  const maxBarWidth = parseFloat(css.getPropertyValue(`--chart-bar-width-${widthTier}`));
  const common = { data, encode: { x: "x", y: "value", color: "series" }, animate: false as const, tooltip: false as const };
  const options: G2Spec = {
    type: "view", margin: 0, inset: 0, paddingLeft: padding.left, paddingRight: padding.right,
    paddingTop: padding.top, paddingBottom: padding.bottom,
    scale: { x: { type: isLine ? "point" : "band", domain: input.model.categories, ...(isLine ? { padding: 0 } : { paddingInner: 0.3, paddingOuter: 0.5 }) },
      y: { zero: true, nice: true, tickCount: 5 }, color: { type: "ordinal", domain: input.series.map(s => s.key), range: colors } },
    axis, legend: false, interaction: { tooltip: false }, animate: false,
    theme: { view: { viewFill: "transparent", plotFill: "transparent" } },
    children: isLine ? input.visibleKeys.flatMap(key => {
      const filtered = data.filter(datum => datum.series === key);
      return [
        { ...common, data: filtered, type: "line", encode: { ...common.encode, series: "segment", shape: "smooth" },
          style: { lineWidth: parseFloat(css.getPropertyValue("--chart-line-width")) || 2, lineDash: [] } },
        { ...common, data: filtered, type: "point", encode: { ...common.encode, size: input.focusable ? FOCUS_POINT_RADIUS : 2, ...(input.focusable ? { shape: "circle" } : {}) }, style: { lineWidth: input.focusable ? 12 : 0, ...(input.focusable ? { strokeOpacity: 0, cursor: "pointer" } : {}) } },
      ];
    }) : [{ ...common, type: "interval", style: input.mode === "grouped" ? {} : { maxWidth: maxBarWidth }, transform: input.mode === "grouped" ? [{ type: "dodgeX" }] : input.mode === "stacked" ? [{ type: "stackY" }] : [] }],
  };
  try {
    chart.options(options); await chart.render();
    const canvas = chart.getContext().canvas!;
    const elements = canvas.document.getElementsByClassName("element");
    const records = elements.map(element => {
      // G2 绑定的原始绘图数据；seriesIndex 数组表示整段折线，不可当作单点。
      const binding = (element as unknown as { __data__: { data: { x: string; series: string }; seriesIndex?: number[] } }).__data__;
      return { element, datum: binding.data, line: Array.isArray(binding.seriesIndex) };
    });
    const click = (event: { target: unknown; canvasX?: number; canvasY?: number }) => {
      let target = event.target as { parentNode?: unknown } | null;
      while (target) {
        const record = records.find(r => r.element === target);
        if (record) {
          if (!record.line) input.onItemClick?.({ seriesKey: record.datum.series, dataKey: record.datum.x });
          return;
        }
        target = target.parentNode as typeof target;
      }
      const x = event.canvasX ?? -1, y = event.canvasY ?? -1;
      if (x >= padding.left && x <= input.width - padding.right && y >= padding.top && y <= input.height - padding.bottom) input.onBackgroundClick?.();
    };
    if (input.focusable) canvas.document.addEventListener("click", click);
    let frame = 0;
    const updateFocus = (item: FocusedItem | null, opacity = 0.3) => {
      if (!input.focusable) return;
      cancelAnimationFrame(frame);
      const visible = item && input.visibleKeys.includes(item.seriesKey);
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const transitions = records.map(({ element, datum, line }) => ({
        element, from: Number(element.style.opacity ?? 1),
        to: !visible || (!line && datum.series === item.seriesKey && datum.x === item.dataKey) ? 1 : focusOpacity(opacity),
      }));
      const start = performance.now();
      const tick = (now: number) => {
        const progress = reduce ? 1 : Math.min(1, (now - start) / 180);
        for (const { element, from, to } of transitions) element.style.opacity = progress === 1 ? to : from + (to - from) * progress;
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      tick(start);
    };
    const destroy = chart.destroy.bind(chart);
    chart.destroy = () => { cancelAnimationFrame(frame); canvas.document.removeEventListener("click", click); destroy(); };
    return Object.assign(chart, { updateFocus });
  }
  catch (error) { chart.destroy(); throw error; }
}
