import { render, screen } from "@testing-library/react";
import { DetailHeaderDocsIsland } from "./DetailHeaderDocsIsland";
import { detailHeaderDemos } from "./detailHeaderDocs.registry";

describe("Detail header docs", () => {
  it("preserves the legacy copy and section order", () => {
    const { container } = render(<DetailHeaderDocsIsland />);
    expect(screen.getByRole("heading", { level: 1, name: "详情头部" })).toBeInTheDocument();
    expect(screen.getByText("用于详情页顶部集中展示对象身份、服务状态、关键属性、审计信息与页面级操作，并承接详情内容页签。")).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll(".qz-demo-title")).map((node) => node.textContent))
      .toEqual(["基本用法", "交互说明", "API"]);
    expect(screen.getByText("名称、状态与主要操作构成首要信息层级；属性和审计信息位于次级区域，底部页签切换详情内容。")).toBeInTheDocument();
    expect(screen.getByText("部署版本点击后直接打开版本列表抽屉，不在详情头部内切换版本。")).toBeInTheDocument();
  });

  it("uses the common action area, API table and same-source public components", () => {
    const { container } = render(<DetailHeaderDocsIsland />);
    expect(container.querySelectorAll(".component-example-actions")).toHaveLength(1);
    expect(container.querySelectorAll(".qizhi-code-action")).toHaveLength(2);
    expect(screen.getByRole("table", { name: "DetailHeader API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "ServiceDetailHeader API" }))
      .toBeInTheDocument();
    expect(detailHeaderDemos).toHaveLength(1);
    expect(detailHeaderDemos[0].source).toContain("<ServiceDetailHeader");
    expect(detailHeaderDemos[0].source).not.toMatch(/<(button|input|select|textarea|svg)\b/);
    expect(detailHeaderDemos[0].source).not.toContain("style={{");
  });
});
