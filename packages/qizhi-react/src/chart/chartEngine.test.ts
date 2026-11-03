import { describe, expect, it } from "vitest";
import { getValueAxisPadding, visibleCategoryIndexes } from "./chartEngine";

describe("图表坐标轴布局", () => {
  it("横轴最多显示七项且保留首尾并均匀分布", () => {
    expect(visibleCategoryIndexes(5)).toEqual([0, 1, 2, 3, 4]);
    expect(visibleCategoryIndexes(14)).toEqual([0, 2, 4, 7, 9, 11, 13]);
  });

  it("纵轴按完整格式化数值增加左侧空间", () => {
    expect(getValueAxisPadding([20_000], value => value.toLocaleString("zh-CN"))).toBeGreaterThan(44);
  });
});
