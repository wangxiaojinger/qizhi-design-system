import { fireEvent, render, screen, within } from "@testing-library/react";
import { BusinessGuidanceDocsIsland } from "./BusinessGuidanceDocsIsland";
import { businessGuidanceDemos } from "./businessGuidanceDocs.registry";

describe("Business guidance docs", () => {
  it("preserves the legacy title, copy, steps, assets, and order", () => {
    const { container } = render(<BusinessGuidanceDocsIsland />);
    expect(screen.getByRole("heading", { name: "引导与流程" }))
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "基础用法" }))
      .toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 }).map((node) => (
      node.textContent
    ))).toEqual([
      "申请/加入项目",
      "模型训练与资产沉淀",
      "模型服务化部署",
    ]);
    expect(container.querySelectorAll("img")).toHaveLength(3);
  });

  it("completes close and restore with focus recovery", () => {
    render(<BusinessGuidanceDocsIsland />);
    fireEvent.click(screen.getByRole("button", { name: "关闭业务引导" }));
    expect(screen.getByText("业务引导已关闭").closest("[role='status']"))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重新显示" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "重新显示" }));
    expect(screen.getByRole("button", { name: "关闭业务引导" })).toHaveFocus();
  });

  it("keeps the demo source reusable and free of native controls", () => {
    const source = businessGuidanceDemos[0].source;
    expect(source).toContain("<BusinessGuide");
    expect(source).toContain('from "@wangxiaojinger/qizhi-react"');
    expect(source).not.toMatch(/<(button|input|select|textarea)\b/);
    expect(source).not.toContain("<svg");
    expect(source).not.toContain("style={{");
    expect(Math.max(...source.split("\n").map((line) => line.length)))
      .toBeLessThanOrEqual(80);
  });

  it("documents the complete public guide component", () => {
    render(<BusinessGuidanceDocsIsland />);
    expect(screen.getByRole("table", { name: "BusinessGuide API" }))
      .toBeInTheDocument();
  });
});
