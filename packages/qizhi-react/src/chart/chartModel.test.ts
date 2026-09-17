import { describe, expect, it } from "vitest";
import * as model from "./chartModel";
const series = [{ key: "a", label: "输入" }, { key: "b", label: "输出" }];
const data = [{ x: "二", series: "a", value: 0 }, { x: "一", series: "a", value: null }, { x: "二", series: "b", value: -5 }];
describe("图表数据语义", () => {
  it("保留分类顺序、零值、负值与缺失，且不修改输入", () => {
    const before = JSON.stringify(data);
    const result = model.normalizeChart(data, series);
    expect(result.error).toBeUndefined();
    expect(result.categories).toEqual(["二", "一"]);
    expect(result.rows).toEqual([{ x: "二", values: [0, -5] }, { x: "一", values: [null, null] }]);
    expect(JSON.stringify(data)).toBe(before);
  });
  it.each([
    [[...data, data[0]], series],
    [[{ x: "二", series: "unknown", value: 1 }], series],
    [[{ x: "二", series: "a", value: Infinity }], series],
    [[{ x: "二", series: "a", value: NaN }], series],
    [data, [series[0], series[0]]],
    [data, [{ ...series[0], colorToken: "--not-a-token" }, series[1]]],
  ])("拒绝错误输入且不静默聚合", (values, definitions) => {
    expect(model.normalizeChart(values, definitions).error).toBe("图表数据格式有误");
  });
  it("接受登记色板而拒绝尺寸变量", () => {
    expect(model.normalizeChart(data, [{ ...series[0], colorToken: "--primary-6" }, series[1]]).error).toBeUndefined();
    expect(model.normalizeChart(data, [{ ...series[0], colorToken: "--font-sans" }, series[1]]).error).toBeDefined();
  });
  it("全空值与全零有不同的有效性", () => {
    expect(model.normalizeChart([{ x: "一", series: "a", value: null }], series).hasValues).toBe(false);
    expect(model.normalizeChart([{ x: "一", series: "a", value: 0 }], series).hasValues).toBe(true);
  });
});

it("品牌别名解析为颜色而不是裸 RGB 三元组", () => {
  expect(model.colorTokenCss("--primary-6")).toBe("rgb(var(--primary-6))");
  expect(model.colorTokenCss("--color-text-1")).toBe("var(--color-text-1)");
});
