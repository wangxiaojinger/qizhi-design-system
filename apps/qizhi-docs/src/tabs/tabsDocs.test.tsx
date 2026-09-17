import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TabsDocsIsland } from "./TabsDocsIsland";
import { tabsApi } from "./tabsApi";
import { tabsDemos } from "./tabsDocs.registry";

describe("Tabs docs", () => {
  it("保留业务需要的 12 组 Demo 顺序", () => {
    expect(tabsDemos.map((demo) => demo.title)).toEqual([
      "基础用法",
      "带图标的页签",
      "位置",
      "不同类型",
      "隐藏分割线",
      "受控模式",
      "嵌套使用",
      "不同尺寸",
      "自定义选项卡头部",
      "可拖拽页签",
      "滚动",
      "滚动偏移位置",
    ]);
  });

  it("所有 Demo 展示和复制同一份整洁 TSX", () => {
    tabsDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toContain("Demo.tsx");
      expect(Math.max(...demo.source.split("\n").map((line) => line.length)))
        .toBeLessThanOrEqual(80);
    });
  });

  it("渲染 12 组 Demo、操作按钮和 API 表", () => {
    render(<TabsDocsIsland />);
    expect(screen.getAllByRole("button", { name: "查看代码" }))
      .toHaveLength(12);
    expect(screen.getAllByRole("button", { name: "复制代码" }))
      .toHaveLength(12);
    expect(screen.getByRole("table", { name: "Tabs API" }))
      .toBeInTheDocument();
  });

  it("展示代码与复制代码逐字使用同一份源码", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<TabsDocsIsland />);
    const article = document.getElementById("标签页-基础用法")!;
    fireEvent.click(within(article).getByRole("button", {
      name: "查看代码",
    }));
    fireEvent.click(within(article).getByRole("button", {
      name: "复制代码",
    }));
    expect(article.querySelector(".qizhi-code-wrapper")?.textContent)
      .toBe(tabsDemos[0].source);
    expect(writeText).toHaveBeenCalledWith(tabsDemos[0].source);
  });

  it("API 只列出 v1 已实现能力", () => {
    expect(tabsApi.map((item) => item.name)).toEqual([
      "items",
      "activeKey",
      "defaultActiveKey",
      "onChange",
      "type",
      "position",
      "size",
      "scrollPosition",
      "renderContent",
      "showDivider",
      "className",
      "style",
    ]);
  });
});
