import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { LineChart } from "./LineChart";
import { seriesColorToken } from "./chartModel";
afterEach(cleanup);
it("图表标题直接使用公共名称，图例使用七色顺序且允许颜色覆盖", () => {
  render(<LineChart label="请求状态趋势" data={[]} series={[{key:"a",label:"请求总数"}]} />);
  expect(screen.getByText("请求状态趋势")).toHaveClass("qizhi-chart__title");
  expect(Array.from({length:8},(_,i)=>seriesColorToken({key:String(i),label:String(i)},i))).toEqual([1,2,3,4,5,6,7,1].map(i=>`--chart-series-${i}`));
  expect(seriesColorToken({key:"a",label:"甲",colorToken:"--purple-6"},1)).toBe("--purple-6");
});

it("单位跟随标题，在空数据状态也显示，绘图区不再单列单位", () => {
  const { container, rerender } = render(<LineChart label="请求趋势" unit="次" data={[]} series={[{ key: "a", label: "请求量" }]} />);
  expect(container.querySelector(".qizhi-chart__title")).toHaveTextContent("请求趋势（次）");
  expect(container.querySelector(".qizhi-chart__plot .qizhi-chart__unit")).toBeNull();
  rerender(<LineChart label="请求趋势" data={[]} series={[{ key: "a", label: "请求量" }]} />);
  expect(container.querySelector(".qizhi-chart__title")).toHaveTextContent(/^请求趋势$/);
});

it("图表不再提供查看或收起数据按钮，保留辅助技术数据表", () => {
  render(<LineChart label="请求趋势" data={[{ x: "09-01", series: "a", value: 12 }]} series={[{ key: "a", label: "请求量" }]} />);
  expect(screen.queryByRole("button", { name: "查看数据" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "收起数据" })).not.toBeInTheDocument();
  expect(screen.getByRole("table", { name: "请求趋势数据" })).toBeInTheDocument();
});
