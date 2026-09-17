import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BreadcrumbDocsIsland } from "./BreadcrumbDocsIsland";
import { breadcrumbApi, breadcrumbItemApi } from "./breadcrumbApi";
import { breadcrumbDemos } from "./breadcrumbDocs.registry";

describe("Breadcrumb docs", () => {
  it("locks both legacy demos in exact order and copy", () => {
    expect(breadcrumbDemos.map((demo) => demo.title)).toEqual([
      "基础用法",
      "自定义图标",
    ]);
    expect(breadcrumbDemos.map((demo) => demo.description)).toEqual([
      "适用于广泛基本用法。分隔方式分为图标分隔及斜线分隔两种方式，可根据不同场景使用。",
      "可以在内容中使用自定义图标。",
    ]);
  });

  it("preserves labels, values, href, sizes, and HomeIcon", () => {
    render(<BreadcrumbDocsIsland />);

    expect(screen.getByRole("heading", { name: "面包屑 Breadcrumb" }))
      .toBeInTheDocument();
    expect(screen.getByText(
      "面包屑是辅助导航模式，用于识别页面在层次结构内的位置，并根据需要向上返回。",
    )).toBeInTheDocument();

    const basic = screen.getByRole("navigation", { name: "基础面包屑" });
    expect(within(basic).getByRole("link", { name: "频道" }))
      .toHaveAttribute("href", "#components-navigation");
    expect(within(basic).getByText("消息").closest("li"))
      .toHaveAttribute("aria-current", "page");

    const normal = screen.getByRole("navigation", {
      name: "带图标的面包屑",
    });
    const small = screen.getByRole("navigation", {
      name: "小尺寸带图标的面包屑",
    });
    expect(normal).not.toHaveClass("qizhi-breadcrumb--small");
    expect(small).toHaveClass("qizhi-breadcrumb--small");
    expect(normal.querySelector("svg")).toBeInTheDocument();
    expect(small.querySelector("svg")).toBeInTheDocument();
  });

  it("keeps preview, display, and copy on one readable TSX source", () => {
    for (const demo of breadcrumbDemos) {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toMatch(/<(button|input|select|textarea)\b/);
      expect(demo.source).not.toContain("<svg");
      expect(demo.source).not.toContain("style={{");
      expect(demo.source).not.toMatch(/qizhi-[\w-]+__/);
      expect(Math.max(...demo.source.split("\n").map((line) => line.length)))
        .toBeLessThanOrEqual(80);
    }

    render(<BreadcrumbDocsIsland />);
    const examples = document.querySelectorAll("article.codebox-wrapper");
    expect(examples).toHaveLength(2);
    for (const example of examples) {
      expect(example).toHaveClass("qizhi-react-demo-codebox");
    }
    expect(screen.getAllByRole("button", { name: "查看代码" }))
      .toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "复制代码" }))
      .toHaveLength(2);
  });

  it("publishes only the approved v1 API", () => {
    expect(breadcrumbApi.map((item) => item.name)).toEqual([
      "size",
      "separator",
      "children",
      "className",
      "style",
      "ref",
    ]);
    expect(breadcrumbItemApi.map((item) => item.name)).toEqual([
      "href",
      "current",
      "icon",
      "children",
      "className",
      "style",
      "ref",
    ]);
  });
});
