import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LineChart } from "./LineChart";
const engine = vi.hoisted(() => ({ render: vi.fn() }));
vi.mock("./chartEngine", () => ({ BAR_BAND_PADDING: { inner: 0.3, outer: 0.5 }, getValueAxisPadding: () => 64, getPlotPadding: () => ({ left: 64, right: 48, top: 24, bottom: 40 }), renderChart: engine.render }));
const series = [{ key: "a", label: "请求量" }];
const data = [{ x: "一", series: "a", value: 12 }];
beforeEach(() => {
  engine.render.mockReset();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 400, 280));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe("图表引擎生命周期", () => {
  it("过期异步渲染完成后销毁，不覆盖新数据", async () => {
    let resolveOld!: (value: { destroy: () => void }) => void;
    const oldDestroy = vi.fn(), newDestroy = vi.fn();
    engine.render.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; })).mockResolvedValue({ destroy: newDestroy });
    const { rerender, unmount } = render(<LineChart label="请求量" data={data} series={series} />);
    await waitFor(() => expect(engine.render).toHaveBeenCalledTimes(1));
    rerender(<LineChart label="请求量" data={[{ ...data[0], value: 99 }]} series={series} />);
    await waitFor(() => expect(engine.render).toHaveBeenCalledTimes(2));
    await act(async () => resolveOld({ destroy: oldDestroy }));
    expect(oldDestroy).toHaveBeenCalledOnce(); expect(newDestroy).not.toHaveBeenCalled();
    unmount(); expect(newDestroy).toHaveBeenCalledOnce();
  });
  it("渲染失败保留辅助技术数据，更新数据后可以恢复", async () => {
    const destroy = vi.fn(); engine.render.mockRejectedValueOnce(new Error("引擎内部详情")).mockResolvedValue({ destroy });
    const { rerender } = render(<LineChart label="请求量" data={data} series={series} />);
    await screen.findByText("图表暂时无法显示"); expect(screen.queryByText("引擎内部详情")).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "请求量数据" })).toHaveTextContent("12");
    rerender(<LineChart label="请求量" data={[{ ...data[0], value: 20 }]} series={series} />);
    await waitFor(() => expect(screen.queryByText("图表暂时无法显示")).not.toBeInTheDocument());
  });
  it("卸载后完成的引擎会销毁", async () => {
    let finish!: (value: { destroy: () => void }) => void; const destroy = vi.fn();
    engine.render.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const { unmount } = render(<LineChart label="请求量" data={data} series={series} />);
    await waitFor(() => expect(engine.render).toHaveBeenCalledOnce()); unmount();
    await act(async () => finish({ destroy })); expect(destroy).toHaveBeenCalledOnce();
  });
});

it("聚焦和悬停变化不重建引擎，卸载后解除引擎", async () => {
  const destroy = vi.fn(), updateFocus = vi.fn(); engine.render.mockResolvedValue({ destroy, updateFocus });
  const { rerender, unmount } = render(<LineChart label="请求量" data={data} series={series} focusable />);
  await waitFor(() => expect(screen.getByRole("listbox")).toHaveAttribute("data-ready", "true"));
  fireEvent.keyDown(screen.getByRole("listbox"), { key: "Enter" });
  expect(updateFocus).toHaveBeenLastCalledWith(expect.objectContaining({ seriesKey: "a", dataKey: "一" }), 0.3);
  fireEvent.pointerLeave(screen.getByRole("listbox"));
  rerender(<LineChart label="请求量" data={data} series={series} focusable dimOpacity={0.2} />);
  expect(engine.render).toHaveBeenCalledOnce(); expect(destroy).not.toHaveBeenCalled();
  expect(updateFocus).toHaveBeenLastCalledWith(expect.objectContaining({ dataKey: "一" }), 0.2);
  fireEvent.keyDown(screen.getByRole("listbox"), { key: "Enter" });
  expect(updateFocus).toHaveBeenLastCalledWith(null, 0.2); expect(engine.render).toHaveBeenCalledOnce();
  unmount(); expect(destroy).toHaveBeenCalledOnce();
});

it("卸载后迟到的尺寸回调安全退出", () => {
  let resize!: ResizeObserverCallback;
  vi.stubGlobal("ResizeObserver", class { constructor(callback: ResizeObserverCallback) { resize = callback; } observe() {} disconnect() {} });
  engine.render.mockResolvedValue({ destroy: vi.fn() });
  try {
    const { unmount } = render(<LineChart label="请求量" data={data} series={series} />);
    unmount(); expect(() => resize([], {} as ResizeObserver)).not.toThrow();
  } finally { vi.unstubAllGlobals(); }
});
