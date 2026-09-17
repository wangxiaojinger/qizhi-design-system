import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeaderDocsIsland } from "./PageHeaderDocsIsland";
import { pageHeaderApi } from "./pageHeaderApi";
import { pageHeaderDemos } from "./pageHeaderDocs.registry";

describe("PageHeader docs", () => {
  it("locks the only legacy demo and exact original copy", () => {
    expect(pageHeaderDemos.map((demo) => ({
      title: demo.title,
      description: demo.description,
    }))).toEqual([{
      title: "基础用法",
      description: "基础页头用于展示当前工作区的欢迎语，高度固定为 54px。",
    }]);
  });

  it("renders the exact page and greeting contract", () => {
    render(<PageHeaderDocsIsland />);

    expect(screen.getByRole("heading", { name: "页头 PageHeader" }))
      .toBeInTheDocument();
    expect(screen.getByText(
      "页头位于页容器顶部，用于概括当前内容并引导页级操作，通常由面包屑、标题、说明和操作区组成。",
    )).toBeInTheDocument();
    expect(screen.getByText(
      "Good day，欢迎使用 启智 开启新的一天 😃",
    ).closest("header")).toHaveClass("qizhi-page-header");
  });

  it("uses the formatted Demo TSX as preview, display, and copy source", () => {
    expect(pageHeaderDemos).toHaveLength(1);
    const [demo] = pageHeaderDemos;
    expect(demo.source).toContain('import { PageHeader } from "@wangxiaojinger/qizhi-react"');
    expect(demo.source).not.toMatch(/<(button|input|select|textarea)\b/);
    expect(demo.source).not.toContain("<svg");
    expect(demo.source).not.toContain("style={{");
    expect(demo.source).not.toMatch(/qizhi-[\w-]+__/);
    expect(Math.max(...demo.source.split("\n").map((line) => line.length)))
      .toBeLessThanOrEqual(80);

    render(<PageHeaderDocsIsland />);
    expect(document.querySelectorAll("article.codebox-wrapper")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "查看代码" }))
      .toHaveClass("qizhi-code-action");
    expect(screen.getByRole("button", { name: "复制代码" }))
      .toHaveClass("qizhi-code-action");
  });

  it("publishes only the approved v1 API", () => {
    expect(pageHeaderApi.map((item) => item.name)).toEqual([
      "children",
      "className",
      "style",
      "ref",
    ]);
  });
});
