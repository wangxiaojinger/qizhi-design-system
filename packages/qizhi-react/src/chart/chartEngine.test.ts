import { describe, expect, it } from "vitest";
import { formatTimeAxisLabels, getValueAxisPadding, selectXAxisLabels, visibleCategoryIndexes } from "./chartEngine";

describe("图表坐标轴布局", () => {
  it("横轴最多显示七项且保留首尾并均匀分布", () => {
    expect(visibleCategoryIndexes(5)).toEqual([0, 1, 2, 3, 4]);
    expect(visibleCategoryIndexes(14)).toEqual([0, 2, 4, 7, 9, 11, 13]);
  });

  it("按范围缩短时间标签，保留跨日信息和短范围的秒", () => {
    expect(formatTimeAxisLabels(["2026-09-01T05:00:00.000Z", "2026-09-01T10:00:00.000Z"])).toEqual(["05:00", "10:00"]);
    expect(formatTimeAxisLabels(["2026-09-01T23:00:00.000Z", "2026-09-02T02:00:00.000Z"])).toEqual(["09-01 23:00", "09-02 02:00"]);
    expect(formatTimeAxisLabels(["2026-09-01T05:00:05Z", "2026-09-01T05:01:10Z"])).toEqual(["05:00:05", "05:01:10"]);
    expect(formatTimeAxisLabels(["2026-09-01", "2026-09-02"])).toBeUndefined();
  });

  it("跨多天的不等间隔数据保留同日不同时间", () => {
    expect(formatTimeAxisLabels(["2026-09-01T01:00:00Z", "2026-09-01T02:00:00Z", "2026-09-10T01:00:00Z"]))
      .toEqual(["09-01 01:00", "09-01 02:00", "09-10 01:00"]);
  });

  it("按实际文字宽度减少刻度，并兼容柱状图端点居中", () => {
    const labels = Array.from({ length: 15 }, () => "09-01 00:00");
    const measure = () => 75;
    expect(selectXAxisLabels(labels, 1100, true, measure).size).toBe(7);
    const narrow = selectXAxisLabels(labels, 250, true, measure);
    expect(narrow.size).toBeGreaterThan(1);
    expect(narrow.size).toBeLessThan(7);
    expect(narrow.has(0)).toBe(true);
    expect(narrow.has(14)).toBe(true);
    const bars = selectXAxisLabels(labels, 250, false, measure);
    expect(bars.has(0)).toBe(false);
    expect(bars.has(14)).toBe(false);
    expect(bars.size).toBeGreaterThan(0);
  });

  it("纵轴按完整格式化数值增加左侧空间", () => {
    const measure = (label: string) => label.length * 7;
    expect(getValueAxisPadding(["0", "2", "4", "6", "8", "10", "12"], measure)).toBe(44);
    expect(getValueAxisPadding(["0", "20,000"], measure)).toBe(58);
  });
});
