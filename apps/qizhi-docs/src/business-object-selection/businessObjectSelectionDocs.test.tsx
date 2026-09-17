import { render, screen } from "@testing-library/react";
import { BusinessObjectSelectionDocsIsland } from "./BusinessObjectSelectionDocsIsland";
import { businessObjectSelectionDemos } from "./businessObjectSelection.registry";

describe("Business object selection docs", () => {
  it("preserves the four legacy demos in order with exact copy", () => {
    render(<BusinessObjectSelectionDocsIsland />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent))
      .toEqual([
        "基础选项卡",
        "不同尺寸",
        "带图标选项卡",
        "业务对象选择器",
        "API",
      ]);
    expect(screen.getByText("用于少量互斥业务方案的平铺选择；点击或使用方向键切换，禁用项不可选择。")).toBeInTheDocument();
    expect(screen.getByText("图标帮助快速区分部署方式，选择行为与基础选项卡保持一致。")).toBeInTheDocument();
  });

  it("uses the common action area and exposes every public API", () => {
    const { container } = render(<BusinessObjectSelectionDocsIsland />);
    expect(container.querySelectorAll(".codebox-wrapper")).toHaveLength(4);
    expect(container.querySelectorAll(".component-example-actions")).toHaveLength(4);
    expect(container.querySelectorAll(".qizhi-code-action")).toHaveLength(8);
    expect(container.querySelectorAll("#business-object-selection-API table"))
      .toHaveLength(5);
    expect(screen.getByRole("table", { name: "BasicChoiceCards API" }))
      .toBeInTheDocument();
    expect(screen.getByRole("table", { name: "IconChoiceCards API" }))
      .toBeInTheDocument();
    expect(screen.getByRole("table", { name: "ChoiceCard API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "ObjectSelector API" })).toBeInTheDocument();
  });

  it("keeps demos on public components and same-source TSX", () => {
    for (const demo of businessObjectSelectionDemos) {
      expect(demo.source).not.toMatch(/<(button|input|select|textarea|svg)\b/);
      expect(demo.source).not.toContain("style={{");
      expect(demo.source).not.toContain("component-example-actions");
    }
    expect(businessObjectSelectionDemos[0].source)
      .toContain("<BasicChoiceCards");
    expect(businessObjectSelectionDemos[2].source)
      .toContain("<IconChoiceCards");
  });
});
