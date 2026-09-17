import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DatePickerDocsIsland } from "./DatePickerDocsIsland";
import { datePickerDemos } from "./datePickerDocs.registry";
import PrefixDemo from "./demos/PrefixDemo";
import DisabledTimeDemo from "./demos/DisabledTimeDemo";
import RangeDemo from "./demos/RangeDemo";

describe("DatePicker docs", () => {
  it("keeps the ten confirmed legacy demos in order", () => {
    expect(datePickerDemos.map((demo) => demo.title)).toEqual(["基础用法", "不同状态", "带有前缀", "月份选择器", "年份选择器", "周选择器", "季度选择器", "带时间的日期选择", "不可选取的时间", "范围选择器"]);
  });

  it("renders the demos and component-owned API without file-name headings", () => {
    render(<DatePickerDocsIsland />);
    expect(screen.getByRole("heading", { name: "日期选择器 DatePicker" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(10);
    expect(screen.getByRole("heading", { name: "API" })).toBeInTheDocument();
    expect(screen.queryByText(/Demo\.(tsx|css)/)).not.toBeInTheDocument();
  });

  it("keeps every displayed and copied demo source readable", () => {
    for (const demo of datePickerDemos) {
      const sourceLines = demo.source.split("\n");

      expect(sourceLines.length, demo.title).toBeGreaterThan(3);
      expect(
        Math.max(...sourceLines.map((line) => line.length)),
        demo.title,
      ).toBeLessThanOrEqual(80);
    }
  });

  it("keeps legacy wide range controls only in the matching demos", () => {
    const prefix = render(<PrefixDemo />);
    expect(screen.getAllByTestId("qizhi-date-picker")[1]).toHaveClass("qizhi-date-picker--range-wide");
    prefix.unmount();
    const disabled = render(<DisabledTimeDemo />);
    expect(screen.getAllByTestId("qizhi-date-picker")[1]).toHaveClass("qizhi-date-picker--range-wide");
    disabled.unmount();
    render(<RangeDemo />);
    expect(screen.getByTestId("qizhi-date-picker")).toHaveClass("qizhi-date-picker--range-wide");
  });
});
