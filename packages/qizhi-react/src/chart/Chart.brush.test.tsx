import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BarChart } from "./BarChart";
import { LineChart } from "./LineChart";

const engine = vi.hoisted(() => ({ render: vi.fn() }));
vi.mock("./chartEngine", () => ({
  BAR_BAND_PADDING: { inner: 0.3, outer: 0.5 },
  getValueAxisPadding: () => 44,
  getPlotPadding: () => ({ left: 44, right: 1, top: 24, bottom: 40 }),
  renderChart: engine.render,
}));

const series = [{ key: "requests", label: "请求" }];
const categories = ["2026-11-01T00:00:00Z", "2026-11-01T01:00:00Z", "2026-11-01T02:00:00Z", "2026-11-01T03:00:00Z"];
const data = categories.map((x, index) => ({ x, series: "requests", value: index + 1 }));
const firePointer = (target: Element | Window | Document, type: string, init: { button: number; pointerId: number; pointerType: "mouse" | "pen" | "touch"; clientX: number; clientY: number; isPrimary?: boolean }) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  for (const [key, value] of Object.entries({ ...init, isPrimary: init.isPrimary ?? true })) Object.defineProperty(event, key, { value });
  fireEvent(target, event);
};

beforeEach(() => {
  engine.render.mockReset();
  engine.render.mockResolvedValue({ destroy: vi.fn() });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 400, 280));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const gesture = (target: Element | Window, type: string, x: number, pointerId = 1, pointerType: "mouse" | "touch" = "mouse") =>
  firePointer(target, type, { button: 0, clientX: x, clientY: 80, pointerId, pointerType });

it("只从绘图区提交，跨越起点后仍按时间顺序回调", () => {
  const onChange = vi.fn();
  render(<LineChart label="请求趋势" data={data} series={series} rangeSelection={{ onChange }} />);
  const plot = screen.getByRole("group", { name: "请求趋势绘图区" });
  gesture(screen.getByRole("group", { name: "请求趋势绘图区" }), "pointerdown", 40);
  gesture(window, "pointerup", 240);
  expect(onChange).not.toHaveBeenCalled();

  gesture(plot, "pointerdown", 240);
  gesture(window, "pointermove", 330);
  gesture(window, "pointermove", 240);
  gesture(window, "pointermove", 130);
  gesture(window, "pointerup", 130);
  expect(onChange).toHaveBeenCalledOnce();
  const { start, end } = onChange.mock.calls[0][0];
  expect(start).toBeGreaterThan(Date.parse(categories[0]));
  expect(end).toBeGreaterThan(start);
  expect(end).toBeLessThan(Date.parse(categories[3]));
});

it("触屏可拖选，短拖动、取消和其他指针不会提交", () => {
  const onChange = vi.fn();
  render(<BarChart label="请求趋势" data={data} series={series} rangeSelection={{ onChange }} />);
  const plot = screen.getByRole("group", { name: "请求趋势绘图区" });
  gesture(plot, "pointerdown", 220);
  gesture(window, "pointerup", 223);
  gesture(plot, "pointerdown", 120);
  gesture(window, "pointermove", 260);
  gesture(window, "pointerup", 260, 2);
  fireEvent.keyDown(document, { key: "Escape" });
  gesture(window, "pointerup", 260);
  expect(onChange).not.toHaveBeenCalled();

  gesture(plot, "pointerdown", 180, 3, "touch");
  gesture(window, "pointermove", 260, 3, "touch");
  gesture(plot.querySelector(".qizhi-chart__canvas")!, "lostpointercapture", 260, 3, "touch");
  gesture(window, "pointerup", 260, 3, "touch");
  expect(onChange).toHaveBeenCalledOnce();
  const { start, end } = onChange.mock.calls[0][0];
  expect(start).toBeGreaterThan(Date.parse(categories[0]));
  expect(end).toBeGreaterThan(start);
  expect(end).toBeLessThan(Date.parse(categories[3]));
});

it("绘图区拖选后不抑制下一次图表数据点聚焦", async () => {
  const onChange = vi.fn();
  const onFocusChange = vi.fn();
  render(<LineChart label="请求趋势" data={data} series={series} focusable onFocusChange={onFocusChange} rangeSelection={{ onChange }} />);
  const plot = screen.getByRole("listbox", { name: "请求趋势绘图区" });
  await waitFor(() => expect(engine.render).toHaveBeenCalledOnce());
  const input = engine.render.mock.calls[0][1] as { onItemClick?: (identity: { seriesKey: string; dataKey: string }) => void };
  gesture(plot, "pointerdown", 80);
  gesture(window, "pointermove", 220);
  gesture(window, "pointercancel", 220);
  expect(onChange).not.toHaveBeenCalled();
  gesture(plot, "pointerdown", 80);
  gesture(window, "pointerup", 220);
  expect(onChange).toHaveBeenCalledOnce();
  input.onItemClick?.({ seriesKey: "requests", dataKey: categories[1] });
  expect(onFocusChange).not.toHaveBeenCalled();
  gesture(plot, "pointerdown", 180);
  gesture(window, "pointerup", 180);
  input.onItemClick?.({ seriesKey: "requests", dataKey: categories[1] });
  expect(onFocusChange).toHaveBeenCalledWith(expect.objectContaining({ dataKey: categories[1] }));
});

it("时间域拖选可在单个展示桶内按步长提交更细的范围", () => {
  const onChange = vi.fn();
  render(<LineChart label="单日趋势" data={[data[0]]} series={series} rangeSelection={{
    timeDomain: { start: 0, end: 3_600_000, step: 60_000 }, onChange,
  }} />);
  const plot = screen.getByRole("group", { name: "单日趋势绘图区" });

  gesture(plot, "pointerdown", 100);
  gesture(window, "pointermove", 130);
  gesture(window, "pointerup", 130);

  expect(onChange).toHaveBeenCalledExactlyOnceWith({ start: 540_000, end: 900_000 });
});

it("时间域拖选预览以提交边界显示浅色区间、虚线指引和范围文本", () => {
  render(<LineChart label="单日趋势" data={[data[0]]} series={series} rangeSelection={{
    timeDomain: { start: 0, end: 3_600_000, step: 60_000 }, onChange: vi.fn(), formatTime: ms => `T${ms}`,
  }} />);
  const plot = screen.getByRole("group", { name: "单日趋势绘图区" });

  gesture(plot, "pointerdown", 100);
  gesture(window, "pointermove", 130);

  const selection = plot.querySelector(".qizhi-chart__range-selection") as HTMLElement;
  const guide = plot.querySelector(".qizhi-chart__range-guide") as HTMLElement;
  expect(selection.style.left).toBe("97.25px");
  expect(selection.style.width).toBe("35.5px");
  expect(screen.getByText("T540000 ～ T900000")).toBeVisible();
  expect(guide.style.left).toBe("44px");
  expect(guide.style.right).toBe("1px");
  expect(guide.style.top).toBe("80px");
});

it.each([LineChart, BarChart])("连续时间拖选默认按秒预览并提交相同边界", (Chart) => {
  const onChange = vi.fn();
  render(<Chart label="秒级拖选" data={data} series={series} rangeSelection={{
    timeDomain: { start: 0, end: 3_600_000 }, onChange,
  }} />);
  const plot = screen.getByRole("group", { name: "秒级拖选绘图区" });
  gesture(plot, "pointerdown", 100);
  gesture(window, "pointermove", 130);
  const label = plot.querySelector(".qizhi-chart__range-selection-label")?.textContent;

  gesture(window, "pointerup", 130);
  expect(onChange).toHaveBeenCalledOnce();
  const { start, end } = onChange.mock.calls[0][0];
  expect(start % 1_000).toBe(0);
  expect(end % 1_000).toBe(0);
  expect(end).toBeGreaterThan(start);
  const format = (time: number) => new Date(time).toISOString().slice(0, 19).replace("T", " ");
  expect(label).toBe(`${format(start)} ～ ${format(end)}`);
});

it.each([LineChart, BarChart])("时间游标默认显示到秒，支持显式配置分钟精度", (Chart) => {
  const onChange = vi.fn();
  const props = { label: "时间游标", data, series };
  const { rerender } = render(<Chart {...props} />);
  const plot = screen.getByRole("group", { name: "时间游标绘图区" });
  fireEvent.keyDown(plot, { key: "Home" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("2026-11-01 00:00:00");
  expect(screen.getByRole("tooltip")).not.toHaveTextContent(/\.000|UTC/);

  rerender(<Chart {...props} rangeSelection={{ timeDomain: { start: 0, end: 3_600_000 }, precision: "minute", onChange }} />);
  fireEvent.keyDown(plot, { key: "Home" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("2026-11-01 00:00");
  gesture(plot, "pointerdown", 100);
  gesture(window, "pointermove", 130);
  expect(plot.querySelector(".qizhi-chart__range-selection-label")).toHaveTextContent(/\d{2}:\d{2} ～ .*\d{2}:\d{2}$/);
  gesture(window, "pointerup", 130);
  const { start, end } = onChange.mock.calls[0][0];
  expect(start % 60_000).toBe(0);
  expect(end % 60_000).toBe(0);
});

it.each([LineChart, BarChart])("时间轴默认框选并可重置，分类轴和显式关闭均无选区", (Chart) => {
  const props = { label: "默认时间轴", data, series };
  const { rerender } = render(<Chart {...props} />);
  const plot = screen.getByRole("group", { name: "默认时间轴绘图区" });
  expect(plot).toHaveClass("qizhi-chart__plot--range-selectable");
  gesture(plot, "pointerdown", 125);
  gesture(window, "pointermove", 280);
  gesture(window, "pointerup", 280);
  const selectedRows = [...screen.getByRole("table", { name: "默认时间轴数据" }).querySelectorAll("tbody tr")];
  expect(selectedRows.map(row => row.querySelector("td")?.textContent)).toEqual(categories.slice(1, 3));
  fireEvent.click(screen.getByRole("button", { name: "重置时间范围" }));
  expect(screen.getByRole("table", { name: "默认时间轴数据" }).querySelectorAll("tbody tr")).toHaveLength(4);

  const onChange = vi.fn();
  rerender(<Chart {...props} data={data.map((item, index) => ({ ...item, x: `分类 ${index}` }))} rangeSelection={{ onChange }} />);
  gesture(plot, "pointerdown", 125);
  gesture(window, "pointermove", 305);
  gesture(window, "pointerup", 305);
  expect(plot).not.toHaveClass("qizhi-chart__plot--range-selectable");
  expect(onChange).not.toHaveBeenCalled();

  rerender(<Chart {...props} xAxisType="category" />);
  expect(plot).not.toHaveClass("qizhi-chart__plot--range-selectable");
  rerender(<Chart {...props} rangeSelection={false} />);
  expect(plot).not.toHaveClass("qizhi-chart__plot--range-selectable");
});

it.each([
  { Chart: LineChart, kind: "折线", days: [1, 2, 3], finalBucket: false },
  { Chart: LineChart, kind: "折线", days: [1, 2, 11], finalBucket: false },
  { Chart: LineChart, kind: "折线含末桶", days: [1, 2, 3], finalBucket: true },
  { Chart: LineChart, kind: "折线含末桶", days: [1, 2, 11], finalBucket: true },
  { Chart: BarChart, kind: "柱状", days: [1, 2, 3], finalBucket: true },
  { Chart: BarChart, kind: "柱状", days: [1, 2, 11], finalBucket: true },
])("显式时间域的$kind图按实际时间点和桶边界框选 $days", ({ Chart, days, finalBucket }) => {
  const onChange = vi.fn();
  const timestamps = days.map(day => Date.UTC(2026, 0, day));
  const last = timestamps.at(-1)!;
  const isBar = Chart === BarChart;
  const end = last + (finalBucket ? 86_400_000 : 0);
  render(<Chart label="时间域" data={timestamps.map((time, index) => ({
    x: new Date(time).toISOString(), series: "requests", value: index + 1,
  }))} series={series} rangeSelection={{ timeDomain: { start: timestamps[0], end }, onChange, formatTime: String }} />);

  const plot = screen.getByRole("group", { name: "时间域绘图区" });
  const intervalWidth = isBar ? 355 / 3.7 : 355 / (finalBucket ? 3 : 2);
  const axisStart = isBar ? 44 + 0.35 * intervalWidth : 44;
  const point = axisStart + intervalWidth;
  const halfway = point + intervalWidth / 2;
  const midpoint = (timestamps[1] + last) / 2;

  gesture(plot, "pointerdown", halfway);
  gesture(window, "pointermove", point);
  expect(plot.querySelector(".qizhi-chart__range-selection-label")).toHaveTextContent(`${timestamps[1]} ～ ${midpoint}`);
  const selection = plot.querySelector<HTMLElement>(".qizhi-chart__range-selection")!;
  expect(parseFloat(selection.style.left)).toBeCloseTo(point, 6);
  expect(parseFloat(selection.style.width)).toBeCloseTo(halfway - point, 6);
  gesture(window, "pointerup", point);
  expect(onChange).toHaveBeenCalledExactlyOnceWith({ start: timestamps[1], end: midpoint });

  gesture(plot, "pointerdown", halfway);
  gesture(window, "pointermove", 450);
  gesture(window, "pointerup", 450);
  expect(onChange).toHaveBeenLastCalledWith({ start: midpoint, end });
});

it("悬停提示只在绘图区移动后随滚动关闭", () => {
  render(<BarChart label="滚动图表" data={data} series={series} />);
  const plot = screen.getByRole("group", { name: "滚动图表绘图区" });
  gesture(plot, "pointermove", 120);
  expect(screen.getByRole("tooltip")).toBeVisible();
  fireEvent.scroll(plot.closest(".qizhi-chart__scroll")!);
  expect(screen.getByRole("tooltip")).toBeVisible();

  vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockReturnValue(new DOMRect(-25, 0, 400, 280));
  fireEvent.scroll(plot.closest(".qizhi-chart__scroll")!);
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});

it.each([LineChart, BarChart])("不等间隔时间戳只推断足以包含末点的排他边界", (Chart) => {
  const onChange = vi.fn();
  const timestamps = [1, 2, 11].map(day => Date.UTC(2026, 0, day));
  render(<Chart label="不等间隔" data={timestamps.map((time, index) => ({
    x: new Date(time).toISOString(), series: "requests", value: index + 1,
  }))} series={series} rangeSelection={{ onChange }} />);
  const plot = screen.getByRole("group", { name: "不等间隔绘图区" });
  gesture(plot, "pointerdown", 160);
  gesture(window, "pointermove", 400);
  gesture(window, "pointerup", 400);
  expect(onChange).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ end: timestamps[2] + 1 }));
});
