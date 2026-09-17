import { expect, it } from "vitest";
import { focusOpacity, focusItems, resolveFocus } from "./chartFocus";
import { normalizeChart } from "./chartModel";
it("透明度边界约束与非有限值回退", () => {
  expect(focusOpacity()).toBe(0.3); expect(focusOpacity(0)).toBe(0); expect(focusOpacity(1)).toBe(1);
  expect(focusOpacity(-1)).toBe(0); expect(focusOpacity(2)).toBe(1); expect(focusOpacity(NaN)).toBe(0.3);
});
it("分类索引不使用扁平索引，回调数据保留原对象", () => {
  const series = [{ key: "a", label: "甲" }, { key: "b", label: "乙" }];
  const data = [{ x: "二", series: "b", value: 3 }, { x: "一", series: "a", value: 0 }, { x: "二", series: "a", value: null }];
  const items = focusItems(data, series, normalizeChart(data, series));
  expect(resolveFocus({ seriesKey: "a", dataIndex: 1 }, items)?.data).toBe(data[1]);
  expect(resolveFocus({ seriesKey: "b", dataIndex: 99, dataKey: "二" }, items)?.dataIndex).toBe(0);
});
