import type { ChartSeries, ChartUsageTimeAxis, BarChartMode, FocusedItem } from "./Chart.types";
import type { ChartModel } from "./chartModel";
import { colorTokenCss, parseChartTime, seriesColorToken } from "./chartModel";
import { focusOpacity } from "./chartFocus";
import { usageTick } from "./chartUsageTime";
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
  usageAxis?: ChartUsageTimeAxis;
  timeStart?: number;
  timeEnd?: number;
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
  const { timeStart, timeEnd } = input;
  const timeSpan = timeStart !== undefined && timeEnd !== undefined ? timeEnd - timeStart : 0;
  const usageAxis = input.usageAxis;
  const usageLabels = usageAxis?.buckets.map(bucket => usageTick(bucket.x, usageAxis, bucket.start));
  const categoryIndexes = new Map(categories.map((key, index) => [key, index]));
  let usagePositions: number[] | undefined;
  const timeRatio = (category: string) => usagePositions?.[categoryIndexes.get(category)!]
    ?? (parseChartTime(category) - (timeStart ?? 0)) / timeSpan;
  const scaleCategories = categories;
  const timeAxis = input.useDefaultTimeLabels ? timeAxisLayout(categories) : undefined;
  const axisLabels = timeAxis?.labels ?? categories.map(input.xFormatter);
  const regularTime = Boolean(timeAxis?.calendarTicks) || isRegularTimeAxis(categories);
  const customTicks = !input.useDefaultTimeLabels && !input.categoricalAxis && isChronologicalTimestampAxis(categories)
    ? customTimeTickIndexes(axisLabels) : undefined;
  const calendarTicks = timeAxis?.calendarTicks ?? customTicks;
  const centeredDates = Boolean(calendarTicks) || (regularTime && categories.every(value => ISO_DATE.test(value)));
  if (!timeSpan && centeredDates && isLine) {
    // Center date labels on their data points, including the ends of the plot.
    const endInset = Math.min(Math.ceil(Math.max(measureLabel(axisLabels[0]), measureLabel(axisLabels[axisLabels.length - 1])) / 2) + 1, input.width / 8);
    padding = { ...padding, left: Math.max(padding.left, endInset), right: Math.max(padding.right, endInset) };
  }
  const makeOptions = (): G2Spec => {
    const plotWidth = input.width - padding.left - padding.right;
    if (usageLabels?.length) {
      const last = usageLabels.length - 1;
      // Align the outer text edges with the plot while keeping each label
      // centered on its mark and all mark positions evenly spaced.
      const firstPosition = Math.min(0.25, measureLabel(usageLabels[0]) / (2 * plotWidth));
      const lastPosition = 1 - Math.min(0.25, measureLabel(usageLabels[last]) / (2 * plotWidth));
      usagePositions = usageLabels.map((_, index) => last
        ? firstPosition + (lastPosition - firstPosition) * index / last : 0.5);
    }
    const visibleIndexes = selectXAxisLabels(axisLabels, plotWidth, isLine, measureLabel, regularTime, centeredDates ? padding : undefined, calendarTicks, scaleCategories.length);
    const visibleLabels = new Map([...visibleIndexes].map(index => [categories[index], axisLabels[index]]));
    if (!visibleLabels.size && plotWidth > X_LABEL_GAP && categories.length) {
      const middle = Math.floor(categories.length / 2);
      // Very long custom text can be too wide even for a single centered label.
      const chars = Array.from(axisLabels[middle]);
      const limit = plotWidth - X_LABEL_GAP;
      while (chars.length && measureLabel(chars.join("") + "…") > limit) chars.pop();
      if (chars.length) visibleLabels.set(categories[middle], chars.join("") + "…");
    }
    let timeLabels: string[] = [];
    let timeTicks: number[] = [];
    if (usageLabels?.length) {
      const labels = usageLabels;
      const last = labels.length - 1;
      const slotWidth = last ? plotWidth * (usagePositions![last] - usagePositions![0]) / last : plotWidth;
      const labelWidth = Math.max(...labels.map(measureLabel));
      const selected = [0];
      if (last > 0) {
        const stride = Math.max(1, Math.ceil((labelWidth + X_LABEL_GAP) / slotWidth));
        const intervals = Math.max(1, Math.floor(last / stride));
        // Round to real data points while spreading the labels across the entire plot.
        for (let index = 1; index < intervals; index++) {
          selected.push(Math.round(index * last / intervals));
        }
        selected.push(last);
      }
      timeTicks = selected.map(index => timeRatio(categories[index]));
      timeLabels = selected.map(index => labels[index]);
    } else if (timeSpan && timeStart !== undefined) {
      for (let intervals = 6; intervals >= 1; intervals--) {
        const ticks = Array.from({ length: intervals + 1 }, (_, i) => i / intervals);
        const times = ticks.map(ratio => new Date(Math.round(timeStart + ratio * timeSpan)).toISOString());
        const sameDay = times[0].slice(0, 10) === times[intervals].slice(0, 10);
        const sameYear = times[0].slice(0, 4) === times[intervals].slice(0, 4);
        const dateOnly = !sameDay && times.every(iso => iso.slice(11, 23) === "00:00:00.000");
        const timeEnd = timeSpan < 6_000 ? 23 : times.every(iso => iso.slice(17, 23) === "00.000") ? 16 : 19;
        const fallback = times.map(iso => dateOnly ? iso.slice(sameYear ? 5 : 0, 10)
          : iso.slice(sameDay ? 11 : sameYear ? 5 : 0, timeEnd).replace("T", " "));
        const custom = input.useDefaultTimeLabels ? fallback : times.map(iso =>
          input.xFormatter(dateOnly ? iso.slice(0, 10) : iso));
        const spacing = plotWidth / intervals;
        const fits = (labels: string[]) => {
          const widths = labels.map(measureLabel);
          return widths.every((width, i) => i === 0
            || widths[i - 1] * (i === 1 ? 1 : 0.5) + width * (i === intervals ? 1 : 0.5) + X_LABEL_GAP <= spacing);
        };
        const distinct = new Set(custom).size === custom.length && custom.every(Boolean);
        const labels = distinct && (intervals > 1 || fits(custom)) ? custom : fallback;
        if (intervals > 1 && !fits(labels)) continue;
        timeTicks = ticks;
        timeLabels = labels;
        break;
      }
    }
    const axis = {
      x: { title: false, grid: false, tick: false, line: true, lineStroke: axisColor,
        labelSpacing: parseFloat(css.getPropertyValue("--chart-axis-label-gap")),
        labelTextAlign: (datum: { id: string }) => input.usageAxis ? "center" : timeSpan ? Number(datum.id) === 0 ? "left" : Number(datum.id) === timeTicks.length - 1 ? "right" : "center" : centeredDates || !isLine || scaleCategories.length === 1 ? "center" : datum.id === "0" ? "left" : datum.id === String(scaleCategories.length - 1) ? "right" : "center",
        labelFill: textColor, labelOpacity: 1, labelFontFamily: fontFamily, labelFontSize: fontSize,
        labelAutoHide: false, labelAutoRotate: false, labelAutoEllipsis: false, transform: [],
        labelFormatter: (x: string, index: number) => timeSpan ? timeLabels[index] ?? "" : visibleLabels.get(x) ?? "" },
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
    const common = { data, encode: { x: timeSpan ? (datum: { x: string }) => timeRatio(datum.x) : "x", y: "value", color: "series" }, animate: false as const, tooltip: false as const };
    const ratios = timeSpan ? categories.map(timeRatio) : [];
    const usageBarLimit = usagePositions && usagePositions.length > 1
      ? 2 * Math.min(usagePositions[0], 1 - usagePositions[usagePositions.length - 1]) : 1;
    const barWidth = Math.min(usageBarLimit, (maxBarWidth || plotWidth) / plotWidth, 0.7 * ratios.reduce(
      (minimum, ratio, i) => i ? Math.min(minimum, ratio - ratios[i - 1]) : minimum, 1));
    const groupSize = input.mode === "grouped" ? Math.max(1, input.visibleKeys.length) : 1;
    const timeBars = {
      ...common,
      type: "rect" as const,
      encode: {
        ...common.encode,
        x: (datum: { x: string; series: string }) => barEdge(datum, 0),
        x1: (datum: { x: string; series: string }) => barEdge(datum, 1),
      },
      transform: input.mode === "stacked" ? [{ type: "stackY" as const, groupBy: "x" }] : [],
    };
    function barEdge(datum: { x: string; series: string }, edge: number) {
      const groupIndex = input.mode === "grouped" ? input.visibleKeys.indexOf(datum.series) : 0;
      const left = Math.max(0, Math.min(1 - barWidth, timeRatio(datum.x) - barWidth / 2));
      return left + barWidth * (groupIndex + edge) / groupSize;
    }
    return {
      type: "view", margin: 0, inset: 0, paddingLeft: padding.left, paddingRight: padding.right,
      paddingTop: padding.top, paddingBottom: padding.bottom,
      scale: { x: timeSpan ? { type: "linear", domain: [0, 1], nice: false, tickMethod: () => timeTicks } : { type: isLine ? "point" : "band", domain: scaleCategories, ...(isLine ? { padding: 0 } : { paddingInner: BAR_BAND_PADDING.inner, paddingOuter: BAR_BAND_PADDING.outer }) },
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
      }) : timeSpan ? [timeBars] : [{ ...common, type: "interval", style: input.mode === "grouped" ? {} : { maxWidth: maxBarWidth }, transform: input.mode === "grouped" ? [{ type: "dodgeX" }] : input.mode === "stacked" ? [{ type: "stackY" }] : [] }],
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
    const getBarBounds = (key: string) => {
      const bars = records.filter(record => !record.line && record.datum.x === key);
      if (!bars.length) return;
      const bounds = bars.map(({ element }) => (element as unknown as { getBBox: () => { x: number; width: number } }).getBBox());
      return {
        left: Math.min(...bounds.map(box => box.x)),
        right: Math.max(...bounds.map(box => box.x + box.width)),
      };
    };
    const usageEdges = usagePositions && [
      0,
      ...usagePositions.slice(1).map((position, index) => (position + usagePositions![index]) / 2),
      1,
    ];
    return Object.assign(chart, { updateFocus, getBarBounds, usagePositions, usageEdges, plotPadding: padding });
  }
  catch (error) { chart.destroy(); throw error; }
  finally { host.style.visibility = visibility; }
}
