import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BarChart } from "./BarChart";
import { LineChart } from "./LineChart";
const series = [{ key: "cpu", label: "处理器" }, { key: "gpu", label: "显卡" }];
const data = ["一", "二", "三"].flatMap((x, i) => series.map(s => ({ x, series: s.key, value: i })));
afterEach(cleanup);
it("未启用聚焦时不增加选中行为", () => {
  const change = vi.fn(); render(<LineChart label="用量" data={data} series={series} onFocusChange={change} />);
  fireEvent.keyDown(screen.getByRole("group", { name: "用量绘图区" }), { key: "Enter" });
  expect(change).not.toHaveBeenCalled(); expect(screen.queryByRole("option")).not.toBeInTheDocument();
});
it("非受控键盘可以精确选择多系列零值、再次取消、切换，关闭提示不影响选择", () => {
  const change = vi.fn(); render(<BarChart mode="grouped" label="用量" data={data} series={series} focusable tooltip={false} onFocusChange={change} />);
  const plot = screen.getByRole("listbox");
  fireEvent.keyDown(plot, { key: "Home" }); fireEvent.keyDown(plot, { key: "ArrowDown" }); fireEvent.keyDown(plot, { key: "Enter" });
  expect(change).toHaveBeenLastCalledWith({ seriesKey: "gpu", dataKey: "一", dataIndex: 0, data: data[1] });
  expect(screen.getByRole("option", { name: "一，显卡：0" })).toHaveAttribute("aria-selected", "true");
  fireEvent.keyDown(plot, { key: " " }); expect(change).toHaveBeenLastCalledWith(null);
  fireEvent.keyDown(plot, { key: "Enter" }); fireEvent.keyDown(plot, { key: "ArrowRight" }); fireEvent.keyDown(plot, { key: "Enter" });
  expect(change).toHaveBeenLastCalledWith({ seriesKey: "gpu", dataKey: "二", dataIndex: 1, data: data[3] });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});
it("受控模式等待外部更新，外部更新不再次发送回调", () => {
  const change = vi.fn(); const props = { label: "用量", data, series, focusable: true, onFocusChange: change };
  const { rerender } = render(<LineChart {...props} focusedItem={null} />);
  fireEvent.keyDown(screen.getByRole("listbox"), { key: "Enter" });
  expect(change).toHaveBeenCalledTimes(1); expect(screen.getAllByRole("option").some(o => o.getAttribute("aria-selected") === "true")).toBe(false);
  rerender(<LineChart {...props} focusedItem={change.mock.calls[0][0]} />);
  expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true"); expect(change).toHaveBeenCalledTimes(1);
});
it("默认项按稳定键追踪重排，数据移除后清空且不选择相同索引的其他项", () => {
  const change = vi.fn(); const props = { label: "用量", series, focusable: true, onFocusChange: change, defaultFocusedItem: { seriesKey: "gpu", dataIndex: 1, dataKey: "二" } };
  const { rerender } = render(<LineChart {...props} data={data} />);
  rerender(<LineChart {...props} data={[...data].reverse()} />);
  expect(screen.getByRole("option", { name: "二，显卡：1" })).toHaveAttribute("aria-selected", "true");
  rerender(<LineChart {...props} data={data.filter(d => d.x !== "二")} />);
  expect(change).toHaveBeenLastCalledWith(null); expect(screen.getAllByRole("option").some(o => o.getAttribute("aria-selected") === "true")).toBe(false);
});
it("鼠标移出、失焦和退出键不会清除持续选择", () => {
  render(<LineChart label="用量" data={data} series={series} focusable defaultFocusedItem={{ seriesKey: "cpu", dataIndex: 0 }} />);
  const plot = screen.getByRole("listbox"); fireEvent.pointerLeave(plot); fireEvent.blur(plot); fireEvent.keyDown(plot, { key: "Escape" });
  expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true");
});
it("图例隐藏聚焦系列后再次显示，保留选择且不触发选择回调", () => {
  const change = vi.fn(); render(<LineChart label="用量" data={data} series={series} focusable defaultFocusedItem={{ seriesKey: "cpu", dataIndex: 1 }} onFocusChange={change} />);
  fireEvent.click(screen.getByRole("button", { name: "处理器" }));
  expect(screen.getAllByRole("option").some(o => o.getAttribute("aria-selected") === "true")).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "处理器" }));
  expect(screen.getByRole("option", { name: "二，处理器：1" })).toHaveAttribute("aria-selected", "true"); expect(change).not.toHaveBeenCalled();
});
it("缺失数据不可选择，受控无效标识不能回退成其他分类", () => {
  const values = data.map(d => d.series === "gpu" ? { ...d, value: null } : d);
  render(<LineChart label="用量" data={values} series={series} focusable focusedItem={{ seriesKey: "cpu", dataIndex: 0, dataKey: "已删除" }} />);
  expect(screen.getAllByRole("option")).toHaveLength(3);
  expect(screen.getAllByRole("option").some(o => o.getAttribute("aria-selected") === "true")).toBe(false);
});
it("默认聚焦项也是初始键盘活动项，回车可直接取消", () => {
  const change = vi.fn(); render(<LineChart label="用量" data={data} series={series} focusable
    defaultFocusedItem={{ seriesKey: "gpu", dataIndex: 1 }} onFocusChange={change} />);
  const plot = screen.getByRole("listbox");
  const option = screen.getByRole("option", { name: "二，显卡：1" });
  expect(plot).toHaveAttribute("aria-activedescendant", option.id);
  fireEvent.keyDown(plot, { key: "Enter" }); expect(change).toHaveBeenLastCalledWith(null);
});
