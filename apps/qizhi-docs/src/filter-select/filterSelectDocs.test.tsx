import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FilterSelectDocsIsland } from "./FilterSelectDocsIsland";
import { filterSelectApi } from "./filterSelectApi";
import { filterSelectDemos } from "./filterSelectDocs.registry";

describe("FilterSelect docs", () => {
  it("归入选择器并提供三组可复制 Demo", () => {
    expect(filterSelectDemos.map((demo) => demo.title)).toEqual([
      "单选筛选",
      "多选筛选",
      "状态与自定义",
    ]);
    filterSelectDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toContain("Demo.tsx");
      expect(Math.max(...demo.source.split("\n").map((line) => line.length)))
        .toBeLessThanOrEqual(80);
    });
  });

  it("渲染三组 Demo 和独立 API", () => {
    render(<FilterSelectDocsIsland />);
    expect(screen.getByRole("heading", {
      level: 1,
      name: "筛选选择器 FilterSelect",
    })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(4);
    expect(document.getElementById("filter-select-API")).toBeInTheDocument();
    expect(screen.getByRole("table", {
      name: "FilterSelect API",
    })).toBeInTheDocument();
  });

  it("单选和多选 Demo 保留摘要且选项不重复筛选名称", () => {
    render(<FilterSelectDocsIsland />);
    const single = document.getElementById("筛选选择器-单选筛选")!;
    fireEvent.click(within(single).getByRole("combobox"));
    expect(within(single).getByText("所有者：全部")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "企业管理员" }))
      .toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "所有者：企业管理员" }))
      .not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: "企业管理员" }));
    expect(within(single).getByText("所有者：企业管理员"))
      .toBeInTheDocument();

    const multiple = document.getElementById("筛选选择器-多选筛选")!;
    expect(within(multiple).getByText("标签：标签A、标签B"))
      .toBeInTheDocument();
    expect(within(multiple).getByText("+3")).toBeInTheDocument();
  });


  it("API 元数据覆盖筛选摘要、搜索和即时变更能力", () => {
    expect(filterSelectApi.map((item) => item.name)).toEqual(
      expect.arrayContaining([
        "label",
        "mode",
        "allOption",
        "emptyText",
        "maxDisplayCount",
        "separator",
        "renderMore",
        "searchable",
        "retainDisplayValueWhenOpen",
        "filterOption",
        "onSearch",
        "onChange",
      ]),
    );
  });
});
