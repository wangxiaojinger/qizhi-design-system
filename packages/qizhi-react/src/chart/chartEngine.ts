import type { ChartSeries, BarChartMode, FocusedItem } from "./Chart.types";
import type { ChartModel } from "./chartModel";
import { colorTokenCss, seriesColorToken } from "./chartModel";
import { focusOpacity } from "./chartFocus";
import type { G2Spec } from "@antv/g2";

export const PLOT_PADDING = { left: 44, right: 1, top: 24, bottom: 40 };
export const BAR_BAND_PADDING = { inner: 0.3, outer: 0.5 };
const FOCUS_POINT_RADIUS = 3;
export const getPlotPadding = (_width: number, focusableLine = false, left = PLOT_PADDING.left) => ({ ...PLOT_PADDING, left, right: PLOT_PADDING.right + (focusableLine ? FOCUS_POINT_RADIUS : 0) });
export const getValueAxisPadding = (labels: Iterable<string>, measure: (label: string) => number) => {
  let width = 0;
  for (const label of labels) width = Math.max(width, measure(label));
  return Math.max(PLOT_PADDING.left, Math.ceil(width) + 16);
};
export const visibleCategoryIndexes = (length: number, limit = 7) => {
  if (length <= 0) return [];
  const count = Math.min(length, limit);
  if (count === 1) return [0];
  return Array.from({ length: count }, (_, index) => Math.round(index * (length - 1) / (count - 1)));
};
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})$/i;

const UTC_DAY = 86_400_000;
const X_LABEL_GAP = 12;

function regularTimeInterval(timestamps: readonly number[]): number | undefined {
  const step = timestamps[1] - timestamps[0];
  return step > 0 && timestamps.every((time, index) => time === timestamps[0] + index * step) ? step : undefined;
}

function timeAxisLayout(categories: readonly string[]) {
  if (!categories.length || !categories.every(value => ISO_TIMESTAMP.test(value))) return;
  const timestamps = categories.map(Date.parse);
  if (!timestamps.every(Number.isFinite)) return;
  const iso = timestamps.map(time => new Date(time).toISOString());
  const first = iso[0];
  const last = iso[iso.length - 1];
  const span = Math.abs(timestamps[timestamps.length - 1] - timestamps[0]);
  const sameDay = first.slice(0, 10) === last.slice(0, 10);
  const dateStart = first.slice(0, 4) === last.slice(0, 4) ? 5 : 0;
  let calendarTicks: number[] | undefined;
  if (span >= 7 * UTC_DAY) {
    const interval = regularTimeInterval(timestamps);
    if (interval && interval < UTC_DAY && UTC_DAY % interval === 0) {
      const stride = UTC_DAY / interval;
      const firstMidnight = Math.ceil(timestamps[0] / UTC_DAY) * UTC_DAY;
      const offset = Math.ceil((firstMidnight - timestamps[0]) / interval) % stride;
      calendarTicks = [];
      for (let index = offset; index < timestamps.length; index += stride) calendarTicks.push(index);
    }
    if (calendarTicks || new Set(iso.map(value => value.slice(0, 10))).size === iso.length) {
      return { labels: iso.map(value => value.slice(dateStart, 10)), calendarTicks };
    }
  }
  const timeEnd = span > 0 && span < 1_000 ? 23 : span > 0 && span < 600_000 ? 19 : 16;
  const labels = iso.map(value => {
    const time = value.slice(11, timeEnd);
    return sameDay ? time : `${value.slice(dateStart, 10)} ${time}`;
  });
  return { labels, calendarTicks };
}

export function formatTimeAxisLabels(categories: readonly string[]): string[] | undefined {
  return timeAxisLayout(categories)?.labels;
}

function isRegularTimeAxis(categories: readonly string[]) {
  return categories.length > 1 && categories.every(value => ISO_DATE.test(value) || ISO_TIMESTAMP.test(value))
    && regularTimeInterval(categories.map(Date.parse)) !== undefined;
}

function isChronologicalTimestampAxis(categories: readonly string[]) {
  if (categories.length < 2 || !categories.every(value => ISO_TIMESTAMP.test(value))) return false;
  const timestamps = categories.map(Date.parse);
  return timestamps.every((time, index) => Number.isFinite(time) && (index === 0 || time > timestamps[index - 1]));
}

function customTimeTickIndexes(labels: readonly string[]): number[] | undefined {
  const groups = labels.flatMap((label, index) => index === 0 || label !== labels[index - 1] ? [index] : []);
  // A formatter that omits the time can return one label for many consecutive samples.
  // Keep each group at its actual boundary, including boundaries in the formatter's time zone.
  if (groups.length === labels.length || groups.length !== new Set(labels).size || labels.includes("")) return;
  return groups.length === 1 ? [Math.floor(labels.length / 2)] : groups;
}

export function selectXAxisLabels(labels: readonly string[], plotWidth: number, isLine: boolean, measure: (text: string) => number, regularTime = false, centeredInsets?: { left: number; right: number }, calendarTicks?: readonly number[], slotCount = labels.length): Set<number> {
  if (!labels.length || plotWidth <= 0) return new Set();
  const count = labels.length;
  const bandStep = plotWidth / (count - BAR_BAND_PADDING.inner + 2 * BAR_BAND_PADDING.outer);
  const firstBandCenter = (BAR_BAND_PADDING.outer + (1 - BAR_BAND_PADDING.inner) / 2) * bandStep;
  const bounds = (index: number) => {
    const width = measure(labels[index]);
    const center = isLine ? slotCount === 1 ? plotWidth / 2 : index * plotWidth / (slotCount - 1) : firstBandCenter + index * bandStep;
    const left = !centeredInsets && isLine && slotCount > 1 && index === 0 ? center
      : !centeredInsets && isLine && slotCount > 1 && index === slotCount - 1 ? center - width : center - width / 2;
    return { left, right: left + width };
  };

  const fits = (index: number) => {
    const { left, right } = bounds(index);
    return Boolean(labels[index]) && left >= -(centeredInsets?.left ?? 0) - 0.5 && right <= plotWidth + (centeredInsets?.right ?? 0) + 0.5;
  };
  const overlaps = (indexes: number[]) => indexes.some((index, position) =>
    position > 0 && bounds(index).left < bounds(indexes[position - 1]).right + X_LABEL_GAP);

  let best: number[] = [];
  if (regularTime || calendarTicks) {
    const tickCount = calendarTicks?.length ?? count;
    for (let step = 1; step < tickCount && !best.length; step++) {
      for (let offset = 0; offset < step && offset + step < tickCount; offset++) {
        const selected: number[] = [];
        for (let index = offset; index < tickCount; index += step) selected.push(calendarTicks?.[index] ?? index);
        if (selected.every(fits) && !overlaps(selected)) { best = selected; break; }
      }
    }
  } else {
    for (let limit = Math.min(7, count); limit >= 2; limit--) {
      if (best.length >= limit) break;
      const selected = visibleCategoryIndexes(count, limit).filter(fits);
      if (!overlaps(selected) && selected.length > best.length) best = selected;
    }
  }
  if (!best.length) {
    const middle = calendarTicks?.[Math.floor(calendarTicks.length / 2)] ?? Math.floor(count / 2);
    if (fits(middle)) best = [middle];
  }
  return new Set(best);
}

export interface EngineInput {
  model: ChartModel; series: readonly ChartSeries[]; visibleKeys: string[];
  kind: "line" | "bar"; mode: BarChartMode; width: number; height: number;
  focusable?: boolean;
  onItemClick?: (identity: { seriesKey: string; dataKey: string }) => void;
  onBackgroundClick?: () => void;
  useDefaultTimeLabels?: boolean;
  categoricalAxis?: boolean;
  terminalCategory?: string;
  singleBarCenter?: number;
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
  const chart = new Chart({ container: host, width: input.width, height: input.height, autoFit: false });
  const isLine = input.kind === "line";
  let padding = getPlotPadding(input.width, isLine && input.focusable);
  const measurement = document.createElement("canvas").getContext("2d");
  if (measurement) measurement.font = `${fontSize}px ${fontFamily || "sans-serif"}`;
  const measureLabel = (label: string) => measurement?.measureText(label).width ?? label.length * fontSize;
  const yLabels = new Set<string>();
  const categories = input.model.categories;
  const scaleCategories = input.terminalCategory ? [...categories, input.terminalCategory] : categories;
  const timeAxis = input.useDefaultTimeLabels ? timeAxisLayout(categories) : undefined;
  const axisLabels = timeAxis?.labels ?? categories.map(input.xFormatter);
  const regularTime = Boolean(timeAxis?.calendarTicks) || isRegularTimeAxis(categories);
  const customTicks = !input.useDefaultTimeLabels && !input.categoricalAxis && isChronologicalTimestampAxis(categories)
    ? customTimeTickIndexes(axisLabels) : undefined;
  const calendarTicks = timeAxis?.calendarTicks ?? customTicks;
  const centeredDates = Boolean(calendarTicks) || (regularTime && categories.every(value => ISO_DATE.test(value)));
  if (centeredDates && isLine) {
    // Center date labels on their data points, including the ends of the plot.
    const endInset = Math.min(Math.ceil(Math.max(measureLabel(axisLabels[0]), measureLabel(axisLabels[axisLabels.length - 1])) / 2) + 1, input.width / 8);
    padding = { ...padding, left: Math.max(padding.left, endInset), right: Math.max(padding.right, endInset) };
  }
  const makeOptions = (): G2Spec => {
    const plotWidth = input.width - padding.left - padding.right;
    const visibleIndexes = selectXAxisLabels(axisLabels, plotWidth, isLine, measureLabel, regularTime, centeredDates ? padding : undefined, calendarTicks, scaleCategories.length);
    const visibleLabels = new Map([...visibleIndexes].map(index => [categories[index], axisLabels[index]]));
    const singleBarAnchor = input.singleBarCenter === undefined ? undefined : input.singleBarCenter * plotWidth;
    const alignSingleBarLabelLeft = singleBarAnchor !== undefined
      && measureLabel(axisLabels[0]) / 2 > Math.min(singleBarAnchor, plotWidth - singleBarAnchor);
    if (alignSingleBarLabelLeft) {
      const limit = plotWidth - singleBarAnchor - X_LABEL_GAP;
      let label = axisLabels[0];
      if (measureLabel(label) > limit) {
        const chars = Array.from(label);
        while (chars.length && measureLabel(chars.join("") + "…") > limit) chars.pop();
        label = chars.length ? chars.join("") + "…" : "";
      }
      visibleLabels.set(categories[0], label);
    } else if (!visibleLabels.size && plotWidth > X_LABEL_GAP && categories.length) {
      const middle = Math.floor(categories.length / 2);
      // Very long custom text can be too wide even for a single centered label.
      const chars = Array.from(axisLabels[middle]);
      const limit = plotWidth - X_LABEL_GAP;
      while (chars.length && measureLabel(chars.join("") + "…") > limit) chars.pop();
      if (chars.length) visibleLabels.set(categories[middle], chars.join("") + "…");
    }
    const axis = {
      x: { title: false, grid: false, tick: false, line: true, lineStroke: axisColor,
        labelSpacing: parseFloat(css.getPropertyValue("--chart-axis-label-gap")),
        labelTextAlign: (datum: { id: string }) => alignSingleBarLabelLeft ? "left" : centeredDates || !isLine || scaleCategories.length === 1 ? "center" : datum.id === "0" ? "left" : datum.id === String(scaleCategories.length - 1) ? "right" : "center",
        labelFill: textColor, labelOpacity: 1, labelFontFamily: fontFamily, labelFontSize: fontSize,
        labelAutoHide: false, labelAutoRotate: false, labelAutoEllipsis: false, transform: [],
        labelFormatter: (x: string) => visibleLabels.get(x) ?? "" },
      y: { title: false, line: false, tick: false, labelSpacing: 16, labelTextAlign: "right", grid: true, gridStroke: borderColor, gridStrokeOpacity: 1, gridLineDash: [],
        labelFill: textColor, labelOpacity: 1, labelFontFamily: fontFamily, labelFontSize: fontSize,
        transform: [], labelAutoHide: false, labelAutoEllipsis: false, labelFormatter: (value: number) => {
          const label = input.valueFormatter(Number(value));
          yLabels.add(label);
          return label;
        } },
    };
    const widthTier = window.innerWidth >= 1280 ? "large" : window.innerWidth >= 768 ? "medium" : "small";
    const maxBarWidth = parseFloat(css.getPropertyValue(`--chart-bar-width-${widthTier}`));
    const common = { data, encode: { x: "x", y: "value", color: "series" }, animate: false as const, tooltip: false as const };
    return {
      type: "view", margin: 0, inset: 0, paddingLeft: padding.left, paddingRight: padding.right,
      paddingTop: padding.top, paddingBottom: padding.bottom,
      scale: { x: { type: isLine ? "point" : "band", domain: scaleCategories, ...(isLine ? { padding: 0 } : { paddingInner: BAR_BAND_PADDING.inner, paddingOuter: BAR_BAND_PADDING.outer }),
        range: input.singleBarCenter === undefined ? undefined : [0, input.singleBarCenter * 2] },
        y: { zero: true, nice: true, tickCount: 5 }, color: { type: "ordinal", domain: input.series.map(s => s.key), range: colors } },
      axis, legend: false, interaction: { tooltip: false }, animate: false,
      theme: { view: { viewFill: "transparent", plotFill: "transparent" } },
      children: isLine ? input.visibleKeys.flatMap(key => {
        const filtered = data.filter(datum => datum.series === key);
        return [
          { ...common, data: filtered, type: "line", encode: { ...common.encode, series: "segment", shape: "smooth" },
            style: { lineWidth: parseFloat(css.getPropertyValue("--chart-line-width")) || 2, lineDash: [] } },
          ...(input.focusable ? [{ ...common, data: filtered, type: "point", encode: { ...common.encode, size: FOCUS_POINT_RADIUS, shape: "circle" }, style: { fillOpacity: 0, strokeOpacity: 0, lineWidth: 12, cursor: "pointer" } }] : []),
        ];
      }) : [{ ...common, type: "interval", style: input.mode === "grouped" ? {} : { maxWidth: maxBarWidth }, transform: input.mode === "grouped" ? [{ type: "dodgeX" }] : input.mode === "stacked" ? [{ type: "stackY" }] : [] }],
    };
  };
  const visibility = host.style.visibility;
  host.style.visibility = "hidden";
  try {
    chart.options(makeOptions());
    await chart.render();
    // Measure the strings G2 actually uses after generating its Y ticks.
    // Only render again when they need more than the standard left inset.
    const measuredLeft = Math.max(padding.left, getValueAxisPadding(yLabels, measureLabel));
    if (measuredLeft !== padding.left) {
      padding = { ...padding, left: measuredLeft };
      chart.options(makeOptions());
      await chart.render();
    }
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
    return Object.assign(chart, { updateFocus, plotPadding: padding });
  }
  catch (error) { chart.destroy(); throw error; }
  finally { host.style.visibility = visibility; }
}
