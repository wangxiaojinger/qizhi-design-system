import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { Alert } from "../alert/Alert";
import { Button } from "../button/Button";
import { Empty } from "../empty/Empty";
import { Spin } from "../spin/Spin";
import { Table } from "../table/Table";
import type { TableColumn } from "../table/Table.types";
import type { BarChartMode, LineChartProps, FocusedItem } from "./Chart.types";
import { normalizeChart, colorTokenCss, seriesColorToken } from "./chartModel";
import type { ChartRow } from "./chartModel";
import { renderChart, getPlotPadding } from "./chartEngine";
import { useChartFocus } from "./useChartFocus";
import { focusItems, resolveFocus, sameFocus } from "./chartFocus";
import { ChartTooltip } from "./ChartTooltip";
import "./chart.css";

const identity = (value: string) => value;
const numberFormat = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 20 });
const defaultValueFormat = (value: number) => numberFormat.format(value);

export function ChartView({ kind, mode = "normal", data, series, label, unit = "", xFormatter = identity, valueFormatter = defaultValueFormat,
  legend = true, tooltip = true, loading = false, error, height = 280, className, id, ref, focusable = false, focusedItem, defaultFocusedItem, onFocusChange, dimOpacity = 0.3, clearFocusOnBackgroundClick = true }: LineChartProps & { kind: "line" | "bar"; mode?: BarChartMode }) {
  const internalId = useId(); const tableId = `${internalId}-data`; const tipId = `${internalId}-tip`; const helpId = `${internalId}-help`;
  const plot = useRef<HTMLDivElement>(null); const engineHost = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [width, setWidth] = useState(0); const [hidden, setHidden] = useState<string[]>([]);
  const [engineError, setEngineError] = useState(false); const [ready, setReady] = useState(false);
  const [active, setActive] = useState<{ index: number; x: number; y: number; keyboard: boolean } | null>(null);
  const model = useMemo(() => normalizeChart(data, series), [data, series]);
  const allFocusItems = useMemo(() => focusItems(data, series, model), [data, series, model]);
  const focus = useChartFocus({ focusable, focusedItem, defaultFocusedItem, onFocusChange }, allFocusItems);
  const engine = useRef<Awaited<ReturnType<typeof renderChart>> | null>(null);
  const [keyboardItem, setKeyboardItem] = useState<FocusedItem | null>(null);
  const invalid = model.error || !label?.trim() || !Number.isFinite(height) || height <= 0 || !["normal", "grouped", "stacked"].includes(mode) || (kind === "bar" && mode === "normal" && series.length !== 1);
  const padding = getPlotPadding(width, kind === "line" && focusable);
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
  useEffect(() => { setActive(null); }, [data, series, tooltip, loading, error, width]);
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
      onItemClick: identity => {
        const current = focusCurrent.current;
        const item = current.allFocusItems.find(item => item.seriesKey === identity.seriesKey && item.dataKey === identity.dataKey);
        if (item) { setKeyboardItem(item); current.focus.handleItemClick(item); }
      },
      onBackgroundClick: () => { const current = focusCurrent.current; if (current.clearFocusOnBackgroundClick) current.focus.clearFocus(); },
    })
      .then(chart => { if (disposed) chart.destroy(); else { engine.current = chart; chart.updateFocus?.(focusCurrent.current.focus.focusedItem, focusCurrent.current.dimOpacity); disposeEngine = () => { if (engine.current === chart) engine.current = null; chart.destroy(); }; setReady(true); } })
      .catch(() => { if (!disposed) { holder.remove(); setEngineError(true); } });
    return () => { disposed = true; disposeEngine?.(); holder.remove(); };
  }, [state, model, series, visibleSignature, kind, mode, focusable, width, viewportWidth, safeHeight, xFormatter, valueFormatter]);
  useEffect(() => {
    if (!active) return;
    const close = () => setActive(null);
    const outside = (event: globalThis.PointerEvent) => { if (!plot.current?.contains(event.target as Node)) close(); };
    const scroll = () => setActive(current => {
      if (!current?.keyboard || !plot.current) return null;
      const rect = plot.current.getBoundingClientRect();
      const count = model.rows.length;
      const ratio = kind === "bar" ? (current.index + 0.5) / count : count === 1 ? 0.5 : current.index / (count - 1);
      return { ...current, x: rect.left + padding.left + Math.max(0, rect.width - padding.left - padding.right) * ratio, y: rect.top + rect.height / 2 };
    });
    window.addEventListener("resize", close); window.addEventListener("scroll", scroll, true); document.addEventListener("pointerdown", outside);
    return () => { window.removeEventListener("resize", close); window.removeEventListener("scroll", scroll, true); document.removeEventListener("pointerdown", outside); };
  }, [!!active]);
  const showAt = (index: number, keyboard: boolean, pointerY?: number) => {
    if (!tooltip || state !== "normal" || engineError || !plot.current || !model.rows.length) return;
    const bounded = Math.max(0, Math.min(index, model.rows.length - 1)); const rect = plot.current.getBoundingClientRect();
    const count = model.rows.length;
    const ratio = kind === "bar" ? (bounded + 0.5) / count : count === 1 ? 0.5 : bounded / (count - 1);
    setActive({ index: bounded, keyboard, x: rect.left + padding.left + Math.max(0, rect.width - padding.left - padding.right) * ratio,
      y: pointerY ?? rect.top + rect.height / 2 });
  };
  const onPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top;
    if (x < padding.left || x > rect.width - padding.right || y < padding.top || y > rect.height - padding.bottom) { setActive(null); return; }
    const ratio = (x - padding.left) / Math.max(1, rect.width - padding.left - padding.right);
    const index = kind === "bar" ? Math.floor(ratio * model.rows.length) : Math.round(ratio * (model.rows.length - 1));
    showAt(index, false, event.clientY);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { setActive(null); return; }
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
  const items = row ? series.flatMap((item, index) => visibleKeys.includes(item.key) ? [{ series: item, index, value: formatValue(row.values[index]) }] : []) : [];
  return <div ref={ref} id={id ?? internalId} className={["qizhi-chart", className].filter(Boolean).join(" ")} role="region" aria-label={label} aria-busy={loading} data-kind={kind} data-mode={mode} data-state={engineError && state === "normal" ? "engine-error" : state}>
    <div className="qizhi-chart__title">{label}{unit ? <span className="qizhi-chart__unit">（{unit}）</span> : null}</div>
    <div ref={plot} className="qizhi-chart__plot" style={{ height: safeHeight }} role={focusable && state === "normal" && !engineError ? "listbox" : "group"} aria-label={`${label}绘图区`}
      aria-activedescendant={focusable && cursor && state === "normal" && !engineError ? `${internalId}-item-${allFocusItems.indexOf(cursor)}` : undefined}
      tabIndex={state === "normal" && !engineError ? 0 : undefined} aria-describedby={`${helpId}${row ? ` ${tipId}` : ""}`} data-ready={ready}
      onPointerMove={event => { if (event.pointerType !== "touch") onPointer(event); }} onPointerDown={onPointer}
      onPointerLeave={event => { if (event.pointerType !== "touch") setActive(current => current?.keyboard ? current : null); }} onKeyDown={onKeyDown} onBlur={() => setActive(null)}>
      {focusable && state === "normal" && !engineError ? <div className="qizhi-chart__sr-only">
        {selectable.map(item => <div key={JSON.stringify([item.seriesKey, item.dataKey])} id={`${internalId}-item-${allFocusItems.indexOf(item)}`} role="option" aria-selected={focus.isFocused(item)}>
          {`${xFormatter(item.dataKey!)}，${series.find(s => s.key === item.seriesKey)!.label}：${formatValue(item.data!.value)}`}
        </div>)}
      </div> : null}
      <div ref={engineHost} className="qizhi-chart__canvas" aria-hidden="true" />
      {state !== "normal" || engineError ? <div className="qizhi-chart__state">
        {state === "loading" ? <Spin tip="正在加载" /> : state === "error" || state === "invalid" || engineError ? <Alert type="error" content={state === "error" ? error : state === "invalid" ? "图表数据格式有误" : "图表暂时无法显示"} /> : <Empty description={state === "empty" ? "暂无数据" : "暂无有效数据"} />}
      </div> : null}
    </div>
    <span id={helpId} className="qizhi-chart__sr-only">{focusable ? "左右方向键切换分类，上下方向键切换系列，起始和结束键定位首尾，回车或空格选择或取消，退出键关闭提示且保留选择。" : "使用左右方向键查看数据，起始和结束键定位首尾，退出键关闭提示。"}辅助技术可读取完整数据表。</span>
    {state === "normal" && !engineError && legend ? <div className="qizhi-chart__legend" role="group" aria-label="图例">
      {series.map((item, index) => <Button key={item.key} type="text" className="qizhi-chart__legend-item" aria-label={item.label} aria-pressed={visibleKeys.includes(item.key)}
        title={visibleKeys.length === 1 && visibleKeys.includes(item.key) ? "至少保留一个系列可见" : undefined}
        onClick={() => { if (visibleKeys.includes(item.key) && visibleKeys.length === 1) return; setHidden(visibleKeys.includes(item.key) ? [...hidden, item.key] : hidden.filter(key => key !== item.key)); setActive(null); }}>
        <span className="qizhi-chart__swatch" aria-hidden="true" style={{ backgroundColor: colorTokenCss(seriesColorToken(item, index)) }} />{item.label}
      </Button>)}
    </div> : null}
    {canShowData ? <div id={tableId} className="qizhi-chart__sr-only"><Table columns={columns} dataSource={model.rows} rowKey="x" size="small" aria-label={`${label}数据`} /></div> : null}
    {row && active ? <ChartTooltip id={tipId} anchor={active} title={xFormatter(row.x)} items={items} /> : null}
    <span className="qizhi-chart__sr-only" role="status" aria-live="polite">{active?.keyboard && row ? `${xFormatter(row.x)}，${items.map(item => `${item.series.label}：${item.value}`).join("，")}` : ""}</span>
  </div>;
}
