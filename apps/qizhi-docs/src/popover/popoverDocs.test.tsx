import { fireEvent, render, screen } from "@testing-library/react";
import { PopoverDocsIsland } from "./PopoverDocsIsland";
import { popoverApi } from "./popoverApi";
import { popoverDemos } from "./popoverDocs.registry";

describe("Popover docs", () => {
  it("renders the four approved demos in legacy order", () => {
    render(<PopoverDocsIsland />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual(["基础用法", "触发方式", "位置", "浮层内关闭", "API"]);
    expect(document.querySelectorAll("article.codebox-wrapper")).toHaveLength(4);
    expect(document.querySelectorAll(".popover-demo-trigger")).toHaveLength(18);
    expect(document.getElementById("popover-API")).toBeInTheDocument();
    expect(screen.queryByText(/Demo\.tsx|Demo\.css/)).not.toBeInTheDocument();
  });

  it("uses formal QIZHI controls and exact raw TSX source", () => {
    render(<PopoverDocsIsland />);
    expect(document.querySelectorAll(".popover-demo-trigger.qizhi-btn")).toHaveLength(18);
    fireEvent.click(screen.getAllByRole("button", { name: "查看代码" })[0]);
    expect(document.querySelector("#popover-code-popover-basic code")?.textContent).toBe(popoverDemos[0].source);
    expect(popoverDemos[0].source).not.toContain("useState");
    expect(popoverDemos[0].source).not.toContain("popupVisible");
    expect(screen.getAllByRole("button", { name: "复制代码" })[0]).toHaveClass("qizhi-btn");
  });

  it("keeps the position example focused on Popover usage", () => {
    const source = popoverDemos.find((demo) => demo.id === "popover-position")?.source ?? "";
    expect(source).toContain('["topLeft", "上左"]');
    expect(source).not.toContain("ReadonlyArray");
    expect(source).not.toContain("gridColumn");
    expect(source).not.toContain("gridRow");
  });

  it("documents only the approved Popover API", () => {
    expect(popoverApi.map((item) => item.name)).toEqual(["children", "title", "content", "trigger", "position", "popupVisible", "defaultPopupVisible", "onVisibleChange", "getPopupContainer", "role"]);
    expect(popoverApi.find((item) => item.name === "trigger")?.defaultValue).toBe('"hover"');
    expect(popoverApi.find((item) => item.name === "position")?.defaultValue).toBe('"top"');
    expect(popoverApi.find((item) => item.name === "getPopupContainer")?.type).toBe("(trigger: HTMLElement) => Element");
  });
});
