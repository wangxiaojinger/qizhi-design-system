import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { Alert } from "../alert/Alert";
import { Button } from "../button/Button";
import { Empty } from "../empty/Empty";
import { Spin } from "../spin/Spin";
import { Table } from "../table/Table";
import type { TableColumn } from "../table/Table.types";
import type { BarChartMode, ChartTimeDomain, ChartTimeRange, ChartTimeRangeSelection, LineChartProps, FocusedItem } from "./Chart.types";
import { normalizeChart, parseChartTime, colorTokenCss, seriesColorToken } from "./chartModel";
import type { ChartRow } from "./chartModel";
import { renderChart, getPlotPadding } from "./chartEngine";
import { useChartFocus } from "./useChartFocus";
import { focusItems, resolveFocus, sameFocus } from "./chartFocus";
import { ChartTooltip } from "./ChartTooltip";
import { interpolateUsageBrush, usageBrushAnchors, usageBucketTitle } from "./chartUsageTime";
import "./chart.css";

const numberFormat = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 20 });
const RANGE_SELECTION_THRESHOLD = 6;
const TIME_SELECTION_STEPS = { millisecond: 1, second: 1_000, minute: 60_000 };
const TIME_LABEL_END = { millisecond: 23, second: 19, minute: 16 };

type ActiveBrush = {
  pointerId: number;
  startX: number;
  currentX: number;
  captured: boolean;
  selection: ChartTimeRangeSelection;
  domain: ChartTimeDomain;
  usageAnchors?: ReturnType<typeof usageBrushAnchors>;
  selectionLeft: number;
  selectionWidth: number;
  element: HTMLDivElement;
};

type BrushPreview = { left: number; width: number; guideY: number; label: string };

type BrushListeners = {
  move: (event: globalThis.PointerEvent) => void;
  up: (event: globalThis.PointerEvent) => void;
  cancel: (event: globalThis.PointerEvent) => void;
  lostCapture: (event: Event) => void;
  keydown: (event: globalThis.KeyboardEvent) => void;
};

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value));
const isValidTimeDomain = (domain: ChartTimeDomain) => Number.isFinite(domain.start) && Number.isFinite(domain.end) && domain.end > domain.start && (domain.step === undefined || Number.isFinite(domain.step) && domain.step > 0);
const formatCursorTime = (time: number, selection?: ChartTimeRangeSelection) => {
  if (selection?.formatTime) return selection.formatTime(time);
  const date = new Date(time);
  if (!Number.isFinite(date.getTime())) return "无效时间";
  const end = TIME_LABEL_END[selection?.precision ?? "second"];
  return date.toISOString().slice(0, end).replace("T", " ");
};
const inferTimeDomain = (categories: readonly string[], timestamps: readonly number[]): ChartTimeDomain | undefined => {
  const start = timestamps[0];
  const last = timestamps[timestamps.length - 1];
  if (categories.every(category => /^\d{4}-\d{2}-\d{2}$/.test(category))) return { start, end: last + 86_400_000 };
  if (timestamps.length < 2) return;
  const interval = timestamps[1] - start;
  const regular = timestamps.every((time, index) => time === start + index * interval);
  // Irregular samples do not reveal a bucket length. Include the last timestamp without inventing one.
  return { start, end: last + (regular ? interval : 1) };
};
const timeRangeAt = (brush: ActiveBrush): ChartTimeRange => {
  const { domain } = brush;
  const rawAt = (x: number) => {
    const ratio = clamp((x - brush.selectionLeft) / brush.selectionWidth, 0, 1);
    return brush.usageAnchors ? interpolateUsageBrush(ratio, brush.usageAnchors, "ratio") : domain.start + ratio * (domain.end - domain.start);
  };
  const rawStart = rawAt(Math.min(brush.startX, brush.currentX));
  const rawEnd = rawAt(Math.max(brush.startX, brush.currentX));
  const resolvedStep = brush.selection.resolveStep?.({ start: rawStart, end: rawEnd });
  const step = resolvedStep !== undefined && Number.isFinite(resolvedStep) && resolvedStep > 0
    ? resolvedStep : domain.step ?? TIME_SELECTION_STEPS[brush.selection.precision ?? "second"];
  const origin = brush.selection.stepOrigin ?? 0;
  return {
    start: clamp(origin + Math.floor((rawStart - origin) / step) * step, domain.start, domain.end),
    end: clamp(origin + Math.ceil((rawEnd - origin) / step) * step, domain.start, domain.end),
  };
};
const timeRangeGeometry = (brush: ActiveBrush, range: ChartTimeRange) => {
  const { domain } = brush;
  const toX = (time: number) => brush.selectionLeft
    + (brush.usageAnchors ? interpolateUsageBrush(time, brush.usageAnchors, "time") : (time - domain.start) / (domain.end - domain.start)) * brush.selectionWidth;
  const start = toX(range.start);
  const end = toX(range.end);
  return { left: start, width: end - start };
};
const defaultValueFormat = (value: number) => numberFormat.format(value);
const defaultXFormat = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${Number(match[2])}月${Number(match[3])}日` : value;
};

export function ChartView({ kind, mode = "normal", data, series, dateRange, label, unit = "", xFormatter = defaultXFormat, valueFormatter = defaultValueFormat,
  legend = true, tooltip = true, rangeSelection, usageTimeAxis, xAxisType, loading = false, error, height = 280, className, id, ref, focusable = false, focusedItem, defaultFocusedItem, onFocusChange, dimOpacity = 0.3, clearFocusOnBackgroundClick = true }: LineChartProps & { kind: "line" | "bar"; mode?: BarChartMode }) {
  const internalId = useId(); const tableId = `${internalId}-data`; const tipId = `${internalId}-tip`; const helpId = `${internalId}-help`;
  const plot = useRef<HTMLDivElement>(null); const engineHost = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [width, setWidth] = useState(0); const [hidden, setHidden] = useState<string[]>([]);
  const [engineError, setEngineError] = useState(false); const [ready, setReady] = useState(false);
  const [active, setActive] = useState<{ index: number; x: number; y: number; keyboard: boolean; plotLeft: number; plotTop: number } | null>(null);
  const [brushPreview, setBrushPreview] = useState<BrushPreview | null>(null);
  const suppressBrushClick = useRef(false);
  const activeBrush = useRef<ActiveBrush | null>(null);
  const brushListeners = useRef<BrushListeners | null>(null);
  const finishBrushRef = useRef<(commit: boolean) => void>(() => undefined);
  const sourceModel = useMemo(() => normalizeChart(data, series, dateRange), [data, series, dateRange?.start, dateRange?.end]);
  const [localSelection, setLocalSelection] = useState<{ source: typeof sourceModel; range: ChartTimeRange }>();
  const selection = rangeSelection || undefined;
  const localRange = rangeSelection !== false && !usageTimeAxis && xAxisType !== "category" && !selection?.onChange && localSelection?.source === sourceModel
    ? localSelection.range : undefined;
  const model = useMemo(() => {
    if (!localRange) return sourceModel;
    const rows = sourceModel.rows.filter(row => {
      const time = parseChartTime(row.x);
      return time >= localRange.start && time < localRange.end;
    });
    return { ...sourceModel, rows, categories: rows.map(row => row.x), hasValues: rows.some(row => row.values.some(value => value !== null)) };
  }, [sourceModel, localRange]);
  const timestamps = useMemo(() => model.categories.map(parseChartTime), [model.categories]);
  const isTimeAxis = xAxisType !== "category" && timestamps.length > 0
    && timestamps.every((time, index) => Number.isFinite(time) && (index === 0 || time > timestamps[index - 1]));
  // A single retained timestamp has no inferable interval; the prior selection still defines one.
  const buckets = usageTimeAxis?.buckets;
  const validBuckets = isTimeAxis && buckets?.length === model.categories.length
    && buckets.every((bucket, index) => bucket.x === model.categories[index]
      && Number.isFinite(bucket.start) && Number.isFinite(bucket.end) && bucket.end > bucket.start
      && (index === 0 || bucket.start === buckets[index - 1].end));
  const usageAxis = validBuckets ? usageTimeAxis : undefined;
  const usageDomain = usageAxis && {
    start: usageAxis.buckets[0].start, end: usageAxis.buckets[usageAxis.buckets.length - 1].end,
    step: selection?.timeDomain?.step,
  };
  const availableDomain: ChartTimeDomain | undefined = usageDomain ?? selection?.timeDomain
    ?? (isTimeAxis ? inferTimeDomain(model.categories, timestamps) ?? localRange : undefined);
  const timeDomain = availableDomain && localRange ? {
    ...availableDomain,
    start: Math.max(availableDomain.start, localRange.start),
    end: Math.min(availableDomain.end, localRange.end),
  } : availableDomain;
  const axisDomain = isTimeAxis && timeDomain && isValidTimeDomain(timeDomain) ? timeDomain : undefined;
  const canBrush = rangeSelection !== false && axisDomain !== undefined && (!usageAxis || Boolean(selection?.onChange));
  const lineIntervals = Math.max(0, model.categories.length - 1);
  const allFocusItems = useMemo(() => focusItems(data, series, model), [data, series, model]);
  const focus = useChartFocus({ focusable, focusedItem, defaultFocusedItem, onFocusChange }, allFocusItems);
  const engine = useRef<Awaited<ReturnType<typeof renderChart>> | null>(null);
  const [keyboardItem, setKeyboardItem] = useState<FocusedItem | null>(null);
  const invalid = model.error || Boolean(usageTimeAxis && model.categories.length && !validBuckets) || !label?.trim() || !Number.isFinite(height) || height <= 0 || !["normal", "grouped", "stacked"].includes(mode) || (kind === "bar" && mode === "normal" && series.length !== 1);
  const [renderedPadding, setRenderedPadding] = useState<ReturnType<typeof getPlotPadding>>();
  const padding = renderedPadding ?? getPlotPadding(width, kind === "line" && focusable);
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 280;
  const state = loading ? "loading" : error ? "error" : invalid ? "invalid" : !model.rows.length ? "empty" : !model.hasValues ? "missing" : "normal";
  const keys = series.map(s => s.key); const keySignature = JSON.stringify(keys);
  const visibleKeys = useMemo(() => { const filtered = keys.filter(key => !legend || !hidden.includes(key)); return filtered.length ? filtered : keys; }, [keySignature, legend, hidden]);
  const selectable = allFocusItems.filter(item => visibleKeys.includes(item.seriesKey));
  const cursor = resolveFocus(keyboardItem, selectable) ?? resolveFocus(focus.focusedItem, selectable) ?? selectable[0] ?? null;
  const focusCurrent = useRef({ focus, dimOpacity, clearFocusOnBackgroundClick, allFocusItems });
  focusCurrent.current = { focus, dimOpacity, clearFocusOnBackgroundClick, allFocusItems };
  useEffect(() => { engine.current?.updateFocus?.(focus.focusedItem, dimOpacity); }, [focus.focusedItem, dimOpacity]);
  const visibleSignature = JSON.stringify(visibleKeys);
  const canShowData = state === "normal" || state === "missing";
  const formatValue = (value: number | null) => value === null ? "暂无数据" : `${valueFormatter(value)}${unit ? ` ${unit}` : ""}`;
  const columns: TableColumn<ChartRow>[] = [{ key: "x", title: "日期／分类", render: (_value, row) => xFormatter(row.x) },
    ...series.map((item, index) => ({ key: `series-${item.key}`, title: item.label, render: (_value: unknown, row: ChartRow) => formatValue(row.values[index]) }))];
  useEffect(() => { if (!legend) setHidden([]); }, [legend]);
  useEffect(() => { setActive(null); }, [model, tooltip, loading, error, width]);
  const hasBrushCallback = Boolean(selection?.onChange);
  useLayoutEffect(() => () => finishBrushRef.current(false), [
    kind, model, state, width, canBrush, hasBrushCallback, usageAxis,
    timeDomain?.start, timeDomain?.end, timeDomain?.step, selection?.precision,
    padding.left, padding.right,
  ]);
  useEffect(() => {
    if (!plot.current) return;
    const measure = () => { const node = plot.current; if (!node) return; setWidth(Math.max(0, Math.floor(node.getBoundingClientRect().width))); setViewportWidth(window.innerWidth); };
    measure(); const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure); observer?.observe(plot.current);
    window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  useEffect(() => {
    setEngineError(false); setReady(false);
    if (state !== "normal" || width <= 0 || !engineHost.current) return;
    const holder = document.createElement("div"); engineHost.current.append(holder);
    let disposed = false; let disposeEngine: (() => void) | undefined;
    renderChart(holder, { model, series, visibleKeys, kind, mode, width, height: safeHeight, xFormatter, valueFormatter, focusable,
      useDefaultTimeLabels: xFormatter === defaultXFormat, categoricalAxis: xAxisType === "category", usageAxis, timeStart: axisDomain?.start, timeEnd: axisDomain?.end,
      onItemClick: identity => {
        if (suppressBrushClick.current) return;
        const current = focusCurrent.current;
        const item = current.allFocusItems.find(item => item.seriesKey === identity.seriesKey && item.dataKey === identity.dataKey);
        if (item) { setKeyboardItem(item); current.focus.handleItemClick(item); }
      },
      onBackgroundClick: () => {
        if (suppressBrushClick.current) return;
        const current = focusCurrent.current; if (current.clearFocusOnBackgroundClick) current.focus.clearFocus();
      },
    })
      .then(chart => { if (disposed) chart.destroy(); else { engine.current = chart; setRenderedPadding(chart.plotPadding); chart.updateFocus?.(focusCurrent.current.focus.focusedItem, focusCurrent.current.dimOpacity); disposeEngine = () => { if (engine.current === chart) engine.current = null; chart.destroy(); }; setReady(true); } })
      .catch(() => { if (!disposed) { holder.remove(); setEngineError(true); } });
    return () => { disposed = true; disposeEngine?.(); holder.remove(); };
  }, [state, model, series, visibleSignature, kind, mode, focusable, width, viewportWidth, safeHeight, xFormatter, valueFormatter, xAxisType, usageAxis, axisDomain?.start, axisDomain?.end]);
  const pointCount = model.rows.length;
  const anchorX = useCallback((index: number, rect: DOMRect) => {
    const ratio = usageAxis ? engine.current?.usagePositions?.[index] ?? (index + 0.5) / pointCount : axisDomain ? clamp((timestamps[index] - axisDomain.start) / (axisDomain.end - axisDomain.start), 0, 1) : kind === "bar" ? (index + 0.5) / pointCount : lineIntervals ? index / lineIntervals : 0.5;
    return rect.left + padding.left + Math.max(0, rect.width - padding.left - padding.right) * ratio;
  }, [kind, usageAxis, axisDomain, timestamps, pointCount, lineIntervals, padding.left, padding.right]);
  const hasActive = Boolean(active);
  useEffect(() => {
    if (!hasActive) return;
    setActive(current => {
      if (!current || !plot.current) return current;
      const rect = plot.current.getBoundingClientRect();
      const x = anchorX(current.index, rect);
      return current.x === x && current.plotLeft === rect.left ? current : { ...current, x, plotLeft: rect.left };
    });
    const close = () => setActive(null);
    const outside = (event: globalThis.PointerEvent) => { if (!plot.current?.contains(event.target as Node)) close(); };
    const scroll = () => setActive(current => {
      if (!current || !plot.current) return null;
      const rect = plot.current.getBoundingClientRect();
      // A deferred scroll event can arrive after a pointer move already used the new position.
      if (!current.keyboard) return rect.left === current.plotLeft && rect.top === current.plotTop ? current : null;
      return { ...current, x: anchorX(current.index, rect), y: rect.top + rect.height / 2, plotLeft: rect.left, plotTop: rect.top };
    });
    window.addEventListener("resize", close); window.addEventListener("scroll", scroll, true); document.addEventListener("pointerdown", outside);
    return () => { window.removeEventListener("resize", close); window.removeEventListener("scroll", scroll, true); document.removeEventListener("pointerdown", outside); };
  }, [hasActive, anchorX]);
  const showAt = (index: number, keyboard: boolean, pointerY?: number) => {
    if (!tooltip || state !== "normal" || engineError || !plot.current || !model.rows.length) return;
    const bounded = Math.max(0, Math.min(index, model.rows.length - 1)); const rect = plot.current.getBoundingClientRect();
    setActive({ index: bounded, keyboard, x: anchorX(bounded, rect),
      y: pointerY ?? rect.top + rect.height / 2, plotLeft: rect.left, plotTop: rect.top });
  };
  const onPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top;
    if (x < padding.left || x > rect.width - padding.right || y < padding.top || y > rect.height - padding.bottom) { setActive(null); return; }
    const ratio = (x - padding.left) / Math.max(1, rect.width - padding.left - padding.right);
    const time = axisDomain ? axisDomain.start + ratio * (axisDomain.end - axisDomain.start) : undefined;
    const edges = engine.current?.usageEdges;
    const index = usageAxis && edges ? edges.findIndex((edge, i) => i > 0 && ratio <= edge) - 1 : time !== undefined ? timestamps.reduce((nearest, value, i) =>
      Math.abs(value - time) < Math.abs(timestamps[nearest] - time) ? i : nearest, 0) : kind === "bar" ? Math.floor(ratio * model.rows.length) : Math.round(ratio * lineIntervals);
    showAt(index, false, event.clientY);
  };
  const removeBrushListeners = () => {
    const listeners = brushListeners.current;
    const current = activeBrush.current;
    if (!listeners) return;
    window.removeEventListener("pointermove", listeners.move);
    window.removeEventListener("pointerup", listeners.up);
    window.removeEventListener("pointercancel", listeners.cancel);
    document.removeEventListener("keydown", listeners.keydown);
    current?.element.removeEventListener("lostpointercapture", listeners.lostCapture);
    brushListeners.current = null;
  };
  const finishBrush = (commit: boolean) => {
    const current = activeBrush.current;
    if (!current) return;
    removeBrushListeners(); activeBrush.current = null; setBrushPreview(null);
    try { if (current.captured) current.element.releasePointerCapture?.(current.pointerId); } catch {
      // Pointer capture can already have been released when the browser cancels a gesture.
    }
    const moved = Math.abs(current.currentX - current.startX) >= RANGE_SELECTION_THRESHOLD;
    if (!commit || !moved) return;
    const range = timeRangeAt(current);
    if (range.end <= range.start) return;
    if (selection?.onChange) selection.onChange(range);
    else setLocalSelection({ source: sourceModel, range });
  };
  finishBrushRef.current = finishBrush;
  const updateBrush = (event: Pick<globalThis.PointerEvent, "pointerId" | "clientX" | "clientY">) => {
    const current = activeBrush.current;
    if (!current || event.pointerId !== current.pointerId || !Number.isFinite(event.clientX)) return;
    const rect = current.element.getBoundingClientRect();
    const nextX = clamp(event.clientX - rect.left, current.selectionLeft, current.selectionLeft + current.selectionWidth);
    const guideY = clamp(Number.isFinite(event.clientY) ? event.clientY - rect.top : rect.height / 2, padding.top, rect.height - padding.bottom);
    if (nextX === current.currentX) {
      setBrushPreview(previous => previous && previous.guideY !== guideY ? { ...previous, guideY } : previous);
      return;
    }
    current.currentX = nextX;
    if (Math.abs(nextX - current.startX) >= RANGE_SELECTION_THRESHOLD) {
      suppressBrushClick.current = true;
      if (!current.captured) {
        try {
          current.element.setPointerCapture?.(current.pointerId);
          current.captured = true;
        } catch {
          // The window listeners still handle the gesture if capture is unavailable.
        }
      }
      setActive(null);
      const timeRange = timeRangeAt(current);
      const previewGeometry = timeRangeGeometry(current, timeRange);
      const label = `${formatCursorTime(timeRange.start, current.selection)} ～ ${formatCursorTime(timeRange.end, current.selection)}`;
      setBrushPreview({ ...previewGeometry, guideY, label });
    } else {
      setBrushPreview(null);
    }
  };
  const beginBrush = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canBrush || !timeDomain || state !== "normal" || engineError || event.button !== 0 || (event.isPrimary === false && Boolean(event.pointerType))) return false;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const plotWidth = rect.width - padding.left - padding.right;
    const geometry = { left: padding.left, width: plotWidth };
    if (geometry.width <= 0 || x < geometry.left || x > geometry.left + geometry.width || y < padding.top || y > rect.height - padding.bottom) return false;
    finishBrush(false);
    const positions = engine.current?.usagePositions;
    if (usageAxis && (!ready || !positions)) return false;
    const current: ActiveBrush = {
      pointerId: event.pointerId, startX: x, currentX: x, captured: false,
      selection: selection ?? {}, domain: timeDomain,
      usageAnchors: usageAxis && positions ? usageBrushAnchors(usageAxis.buckets, positions) : undefined,
      selectionLeft: geometry.left, selectionWidth: geometry.width, element: event.currentTarget,
    };
    activeBrush.current = current;
    const belongsToActivePointer = (pointerEvent: globalThis.PointerEvent | Event) => {
      const pointerId = (pointerEvent as globalThis.PointerEvent).pointerId;
      return typeof pointerId !== "number" || pointerId === current.pointerId;
    };
    const listeners: BrushListeners = {
      move: pointerEvent => updateBrush(pointerEvent),
      up: pointerEvent => { if (!belongsToActivePointer(pointerEvent)) return; updateBrush(pointerEvent); finishBrushRef.current(true); },
      cancel: pointerEvent => { if (belongsToActivePointer(pointerEvent)) finishBrushRef.current(false); },
      lostCapture: lostCaptureEvent => {
        // Touch starts with implicit capture on the renderer's canvas.
        // Its bubbled loss during transfer must not cancel the plot gesture.
        if (lostCaptureEvent.target === current.element && belongsToActivePointer(lostCaptureEvent)) finishBrushRef.current(false);
      },
      keydown: keyEvent => { if (keyEvent.key === "Escape") { keyEvent.preventDefault(); finishBrushRef.current(false); } },
    };
    brushListeners.current = listeners;
    window.addEventListener("pointermove", listeners.move);
    window.addEventListener("pointerup", listeners.up);
    window.addEventListener("pointercancel", listeners.cancel);
    document.addEventListener("keydown", listeners.keydown);
    current.element.addEventListener("lostpointercapture", listeners.lostCapture);
    return true;
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { finishBrush(false); setActive(null); return; }
    if (focusable && state === "normal" && !engineError && cursor) {
      if (["Enter", " "].includes(event.key)) { event.preventDefault(); focus.handleItemClick(cursor); return; }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const sameSeries = selectable.filter(item => item.seriesKey === cursor.seriesKey);
        const sameCategory = selectable.filter(item => item.dataKey === cursor.dataKey);
        const vertical = event.key === "ArrowUp" || event.key === "ArrowDown";
        const candidates = vertical ? sameCategory : sameSeries;
        const currentIndex = candidates.findIndex(item => sameFocus(item, cursor));
        const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? candidates.length - 1 : currentIndex + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1);
        const next = candidates[Math.max(0, Math.min(candidates.length - 1, nextIndex))];
        if (next) { setKeyboardItem(next); showAt(next.dataIndex, true); }
        return;
      }
    }
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === "Home" ? 0 : event.key === "End" ? model.rows.length - 1 : active ? active.index + (event.key === "ArrowRight" ? 1 : -1) : 0;
    showAt(index, true);
  };
  const row = active && state === "normal" && tooltip && !engineError ? model.rows[active.index] : undefined;
  const cursorTime = row && xFormatter === defaultXFormat && /^\d{4}-\d{2}-\d{2}T/.test(row.x) ? Date.parse(row.x) : NaN;
  const cursorLabel = !row ? "" : usageAxis && active ? usageBucketTitle(usageAxis.buckets[active.index], usageAxis) : Number.isFinite(cursorTime)
    ? formatCursorTime(cursorTime, selection)
    : xFormatter(row.x);
  const items = row ? series.flatMap((item, index) => visibleKeys.includes(item.key) ? [{ series: item, index, value: formatValue(row.values[index]) }] : []) : [];
  const indicatorLeft = active && plot.current ? active.x - plot.current.getBoundingClientRect().left : 0;
  return <div ref={ref} id={id ?? internalId} className={["qizhi-chart", className].filter(Boolean).join(" ")} role="region" aria-label={label} aria-busy={loading} data-kind={kind} data-mode={mode} data-usage-axis={Boolean(usageAxis)} data-state={engineError && state === "normal" ? "engine-error" : state}>
    <div className="qizhi-chart__scroll"><div className="qizhi-chart__content">
    <div className="qizhi-chart__title">{label}{unit ? <span className="qizhi-chart__unit">（{unit}）</span> : null}</div>
    <div ref={plot} className={canBrush && state === "normal" && !engineError ? "qizhi-chart__plot qizhi-chart__plot--range-selectable" : "qizhi-chart__plot"} style={{ height: safeHeight }} role={focusable && state === "normal" && !engineError ? "listbox" : "group"} aria-label={`${label}绘图区`}
      aria-activedescendant={focusable && cursor && state === "normal" && !engineError ? `${internalId}-item-${allFocusItems.indexOf(cursor)}` : undefined}
      tabIndex={state === "normal" && !engineError ? 0 : undefined} aria-describedby={`${helpId}${row ? ` ${tipId}` : ""}`} data-ready={ready}
      onPointerDown={event => {
        if (!canBrush || (event.isPrimary === false && Boolean(event.pointerType))) return;
        suppressBrushClick.current = false;
        beginBrush(event);
        if (event.pointerType !== "touch") onPointer(event);
      }}
      onPointerMove={event => { if (event.pointerType !== "touch" && !activeBrush.current?.captured) onPointer(event); }}
      onClickCapture={event => {
        if (!suppressBrushClick.current) return;
        suppressBrushClick.current = false;
        event.stopPropagation();
      }}
      onPointerLeave={event => { if (event.pointerType !== "touch" && !activeBrush.current) setActive(current => current?.keyboard ? current : null); }} onKeyDown={onKeyDown} onBlur={() => setActive(null)}>
      {focusable && state === "normal" && !engineError ? <div className="qizhi-chart__sr-only">
        {selectable.map(item => <div key={JSON.stringify([item.seriesKey, item.dataKey])} id={`${internalId}-item-${allFocusItems.indexOf(item)}`} role="option" aria-selected={focus.isFocused(item)}>
          {`${xFormatter(item.dataKey!)}，${series.find(s => s.key === item.seriesKey)!.label}：${formatValue(item.data!.value)}`}
        </div>)}
      </div> : null}
      <div ref={engineHost} className="qizhi-chart__canvas" aria-hidden="true" />
      {brushPreview ? <>
        <span className="qizhi-chart__range-selection" aria-hidden="true" style={{ left: brushPreview.left, width: brushPreview.width, top: padding.top, bottom: padding.bottom }} />
        <span className="qizhi-chart__range-guide" aria-hidden="true" style={{ left: padding.left, right: padding.right, top: brushPreview.guideY }} />
        <span className="qizhi-chart__range-selection-label" role="status" aria-live="polite" style={{ left: padding.left + 4, top: padding.top + 4 }}>{brushPreview.label}</span>
      </> : null}
      {kind === "line" && row && active ? <span className="qizhi-chart__indicator" aria-hidden="true" style={{ left: indicatorLeft, top: padding.top, bottom: padding.bottom }} /> : null}
      {state !== "normal" || engineError ? <div className="qizhi-chart__state">
        {state === "loading" ? <Spin tip="正在加载" /> : state === "error" || state === "invalid" || engineError ? <Alert type="error" content={state === "error" ? error : state === "invalid" ? "图表数据格式有误" : "图表暂时无法显示"} /> : <Empty description={state === "empty" ? "暂无数据" : "暂无有效数据"} />}
      </div> : null}
    </div>
    </div></div>
    <span id={helpId} className="qizhi-chart__sr-only">{focusable ? "左右方向键切换分类，上下方向键切换系列，起始和结束键定位首尾，回车或空格选择或取消，退出键关闭提示且保留选择。" : "使用左右方向键查看数据，起始和结束键定位首尾，退出键关闭提示。"}{canBrush ? "可在绘图区横向拖动选择时间范围。" : ""}辅助技术可读取完整数据表。</span>
    {localRange ? <Button type="text" onClick={() => setLocalSelection(undefined)}>重置时间范围</Button> : null}
    {state === "normal" && !engineError && legend ? <div className="qizhi-chart__legend" role="group" aria-label="图例">
      {series.map((item, index) => <Button key={item.key} type="text" className="qizhi-chart__legend-item" aria-label={item.label} aria-pressed={visibleKeys.includes(item.key)}
        title={visibleKeys.length === 1 && visibleKeys.includes(item.key) ? "至少保留一个系列可见" : undefined}
        onClick={() => { if (visibleKeys.includes(item.key) && visibleKeys.length === 1) return; setHidden(visibleKeys.includes(item.key) ? [...hidden, item.key] : hidden.filter(key => key !== item.key)); setActive(null); }}>
        <span className="qizhi-chart__swatch" aria-hidden="true" style={{ backgroundColor: colorTokenCss(seriesColorToken(item, index)) }} />{item.label}
      </Button>)}
    </div> : null}
    {canShowData ? <div id={tableId} className="qizhi-chart__sr-only"><Table columns={columns} dataSource={model.rows} rowKey="x" size="small" aria-label={`${label}数据`} /></div> : null}
    {row && active ? <ChartTooltip id={tipId} kind={kind} anchor={active} barBounds={kind === "bar" && usageAxis ? engine.current?.getBarBounds?.(row.x) : undefined} plotLeft={active.plotLeft} title={cursorLabel} items={items} /> : null}
    <span className="qizhi-chart__sr-only" role="status" aria-live="polite">{active?.keyboard && row ? `${cursorLabel}，${items.map(item => `${item.series.label}：${item.value}`).join("，")}` : ""}</span>
  </div>;
}
