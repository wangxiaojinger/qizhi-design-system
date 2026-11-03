import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as publicApi from "../index";
const series = [{ key: "a", label: "输入" }, { key: "b", label: "输出" }];
const data = [{ x: "一", series: "a", value: 12 }, { x: "一", series: "b", value: null }];
afterEach(cleanup);
describe("公共图表契约", () => {
  it("正式导出两种组件", () => { expect(publicApi.LineChart).toBeDefined(); expect(publicApi.BarChart).toBeDefined(); });
  it("加载优先于业务错误", () => {
    render(<publicApi.LineChart label="请求量" data={data} series={series} loading error="失败" />);
    expect(screen.getByText("正在加载")).toBeVisible(); expect(screen.queryByText("失败")).not.toBeInTheDocument();
  });
  it("区分空数组与全部缺失", () => {
    const { rerender } = render(<publicApi.LineChart label="请求量" data={[]} series={series} />);
    expect(screen.getByText("暂无数据")).toBeVisible();
    rerender(<publicApi.LineChart label="请求量" data={[data[1]]} series={series} />);
    expect(screen.getByText("暂无有效数据")).toBeVisible(); expect(screen.queryByRole("button", { name: "查看数据" })).not.toBeInTheDocument();
  });
  it("普通柱形拒绝多系列，分组接受", () => {
    const { rerender } = render(<publicApi.BarChart label="用量" data={data} series={series} />);
    expect(screen.getByText("图表数据格式有误")).toBeVisible();
    rerender(<publicApi.BarChart label="用量" data={data} series={series} mode="grouped" />);
    expect(screen.queryByText("图表数据格式有误")).not.toBeInTheDocument();
  });
  it("图例不能全隐藏，关闭图例后重新开启恢复全部", () => {
    const { rerender } = render(<publicApi.LineChart label="请求量" data={data} series={series} />);
    fireEvent.click(screen.getByRole("button", { name: "输入" }));
    expect(screen.getByRole("button", { name: "输入" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: "输出" }));
    expect(screen.getByRole("button", { name: "输出" })).toHaveAttribute("aria-pressed", "true");
    rerender(<publicApi.LineChart label="请求量" data={data} series={series} legend={false} />);
    expect(screen.queryByRole("button", { name: "输入" })).not.toBeInTheDocument();
    rerender(<publicApi.LineChart label="请求量" data={data} series={series} />);
    expect(screen.getByRole("button", { name: "输入" })).toHaveAttribute("aria-pressed", "true");
  });
  it("数据表同源格式化、单位与缺失保持一致，根引用可用", () => {
    const ref = createRef<HTMLDivElement>();
    render(<publicApi.LineChart ref={ref} id="test-chart" className="layout" label="用量" data={data} series={series} unit="词元" xFormatter={x => `日期${x}`} valueFormatter={x => x.toFixed(2)} height={320} />);
    expect(ref.current).toHaveAttribute("id", "test-chart"); expect(ref.current).toHaveClass("layout");
    expect(screen.getByRole("table", { name: "用量数据" })).toBeVisible();
    expect(screen.getByText("日期一")).toBeVisible(); expect(screen.getByText("12.00 词元")).toBeVisible(); expect(screen.getByText("暂无数据")).toBeVisible();
    expect(screen.queryByRole("button", { name: "收起数据" })).not.toBeInTheDocument();
  });
  it("键盘定位同类提示，退出关闭，禁止提示后仍能看数据", () => {
    const { rerender } = render(<publicApi.LineChart label="请求量" data={data} series={series} />);
    fireEvent.keyDown(screen.getByRole("group", { name: "请求量绘图区" }), { key: "ArrowRight" });
    expect(screen.getByRole("tooltip")).toHaveTextContent("输入");
    fireEvent.keyDown(screen.getByRole("group", { name: "请求量绘图区" }), { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    rerender(<publicApi.LineChart label="请求量" data={data} series={series} tooltip={false} />);
    fireEvent.keyDown(screen.getByRole("group", { name: "请求量绘图区" }), { key: "ArrowRight" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(); expect(screen.queryByRole("button", { name: "查看数据" })).not.toBeInTheDocument();
  });
  it("仅折线图的提示带垂直指示线，柱状图只显示数据气泡", () => {
    const singleSeries = [series[0]];
    const singleData = [data[0]];
    const { container, rerender } = render(<publicApi.LineChart label="趋势" data={singleData} series={singleSeries} />);
    fireEvent.keyDown(screen.getByRole("group", { name: "趋势绘图区" }), { key: "Home" });
    expect(screen.getByRole("tooltip")).toBeVisible();
    expect(container.querySelector(".qizhi-chart__indicator")).toBeInTheDocument();
    rerender(<publicApi.BarChart label="柱图" data={singleData} series={singleSeries} />);
    fireEvent.keyDown(screen.getByRole("group", { name: "柱图绘图区" }), { key: "Home" });
    expect(screen.getByRole("tooltip")).toBeVisible();
    expect(container.querySelector(".qizhi-chart__indicator")).not.toBeInTheDocument();
  });
});

it("未传 id 的多个图表生成不同的根标识", () => {
  render(<><publicApi.LineChart label="甲" data={[]} series={series} /><publicApi.LineChart label="乙" data={[]} series={series} /></>);
  const a = screen.getByRole("region", { name: "甲" }), b = screen.getByRole("region", { name: "乙" });
  expect(a.id).not.toBe(""); expect(a.id).not.toBe(b.id);
});

it("键盘提示在聚焦引发的滚动期间保持定位", () => {
  render(<publicApi.LineChart label="请求量" data={data} series={series} />);
  const plot = screen.getByRole("group", { name: "请求量绘图区" });
  fireEvent.keyDown(plot, { key: "Home" }); fireEvent.scroll(window);
  expect(screen.getByRole("tooltip")).toHaveTextContent("输入");
});
