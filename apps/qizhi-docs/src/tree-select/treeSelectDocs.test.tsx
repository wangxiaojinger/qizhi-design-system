import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TreeSelectDocsIsland } from "./TreeSelectDocsIsland";
import { treeSelectApi } from "./treeSelectApi";
import { treeSelectDemos } from "./treeSelectDocs.registry";

describe("TreeSelect docs", () => {
  it("保留旧站 10 组 Demo 的顺序、标题和说明", () => {
    expect(treeSelectDemos.map((demo) => demo.title)).toEqual([
      "基础用法",
      "设置 value 格式",
      "自定义渲染",
      "前置标签",
      "通过数据生成树结构",
      "受控模式",
      "动态加载",
      "搜索",
      "远程搜索",
      "不同尺寸",
    ]);
    expect(treeSelectDemos.map((demo) => demo.description)).toEqual([
      "最简单的用法。",
      "labelInValue 为 true 时，value 格式为：{ label: string, value: string }。",
      "单选下通过 renderFormat 可自定义渲染展示。",
      "通过 addBefore 设置前置标签（2.41.0）。",
      "通过传入 treeData 数据生成树结构。",
      "受控模式。",
      "可以通过 loadMore 进行动态加载。此时可设置 isLeaf 来标示叶子节点。",
      "设置 showSearch=true 启用搜索功能。动态加载时候只能在已加载数据中进行搜索。默认的关键字搜索是从 value 字段匹配。也可以传入 filterTreeNode 自定义过滤方式。",
      "当传入 onSearch 为函数时，启用自定义搜索，可以从远程加载数据。",
      "设置 size 可以使用三种尺寸的选择器。高度分别对应 32px、36px、40px。",
    ]);
  });

  it("所有 Demo 使用同一份整洁 TSX 源码展示和复制", () => {
    treeSelectDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toContain("Demo.tsx");
      expect(Math.max(...demo.source.split("\n").map((line) => line.length)))
        .toBeLessThanOrEqual(80);
    });
  });

  it("自定义渲染沿用旧站普通富文本样式", () => {
    const source = treeSelectDemos.find((demo) =>
      demo.title === "自定义渲染")!.source;

    expect(source).toContain('className="tree-select-demo__rich-value"');
    expect(source).not.toContain("<strong>");
  });

  it("渲染 10 组 Demo、代码操作和 API 表", () => {
    render(<TreeSelectDocsIsland />);
    expect(screen.getAllByRole("button", { name: "查看代码" }))
      .toHaveLength(10);
    expect(screen.getAllByRole("button", { name: "复制代码" }))
      .toHaveLength(10);
    expect(screen.getByRole("table", { name: "TreeSelect API" }))
      .toBeInTheDocument();
    expect(screen.queryByText("Demo.tsx")).not.toBeInTheDocument();
  });

  it("展示代码与复制代码逐字使用同一份 TSX 源码", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<TreeSelectDocsIsland />);
    const article = document.getElementById("树选择-基础用法")!;
    fireEvent.click(within(article).getByRole("button", {
      name: "查看代码",
    }));
    fireEvent.click(within(article).getByRole("button", {
      name: "复制代码",
    }));
    expect(article.querySelector(".qizhi-code-wrapper")?.textContent)
      .toBe(treeSelectDemos[0].source);
    expect(writeText).toHaveBeenCalledWith(treeSelectDemos[0].source);
  });

  it("API 只列出 v1 实际能力", () => {
    expect(treeSelectApi.map((item) => item.name)).toEqual([
      "treeData",
      "multiple",
      "value",
      "defaultValue",
      "placeholder",
      "size",
      "status",
      "disabled",
      "allowClear",
      "addBefore",
      "labelInValue",
      "renderFormat",
      "showSearch",
      "filterTreeNode",
      "onSearch",
      "loadMore",
      "defaultExpandedKeys",
      "open",
      "defaultOpen",
      "onOpenChange",
      "onChange",
      "className",
      "style",
    ]);
  });
});
