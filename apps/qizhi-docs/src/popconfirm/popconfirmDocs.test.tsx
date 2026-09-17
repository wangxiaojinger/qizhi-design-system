import { fireEvent, render, screen } from "@testing-library/react";
import { PopconfirmDocsIsland } from "./PopconfirmDocsIsland";
import { popconfirmApi } from "./popconfirmApi";
import { popconfirmDemos } from "./popconfirmDocs.registry";

describe("Popconfirm docs", () => {
  it("left-aligns the basic Demo trigger without changing other layouts", () => {
    render(<PopconfirmDocsIsland />);
    expect(document.querySelector("#popconfirm-basic"))
      .toHaveClass("popconfirm-demo-codebox--left");
    expect(document.querySelector("#popconfirm-position"))
      .not.toHaveClass("popconfirm-demo-codebox--left");
  });

  it("preserves all five legacy demos and seventeen triggers in order", () => {
    render(<PopconfirmDocsIsland />);
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent),
    ).toEqual([
      "基础用法",
      "国际化",
      "位置",
      "异步关闭",
      "自定义图标",
      "API",
    ]);
    expect(document.querySelectorAll("article.codebox-wrapper")).toHaveLength(5);
    expect(document.querySelectorAll(".popconfirm-demo-trigger")).toHaveLength(17);
    expect(popconfirmDemos.map((demo) => demo.description)).toEqual([
      "最基础的用法。",
      "自定义按钮文字。",
      "气泡确认框复用 Tooltip 的 12 个方位：上左、上、上右、下左、下、下右、左上、左、左下、右上、右、右下。",
      "用于异步执行操作，等操作完成后再关闭气泡确认框。",
      "可以替换默认图标，也可以隐藏图标。",
    ]);
  });

  it("renders and copies the actual formatted Demo TSX source", () => {
    render(<PopconfirmDocsIsland />);
    fireEvent.click(screen.getAllByRole("button", { name: "查看代码" })[0]);
    expect(
      document.querySelector("#popconfirm-code-popconfirm-basic code")?.textContent,
    ).toBe(popconfirmDemos[0].source);
    expect(screen.queryByText(/Demo\.tsx|Demo\.css|复制样式/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "复制代码" })[0]).toHaveClass(
      "qizhi-btn",
      "qizhi-code-action",
    );
    expect(Math.max(...popconfirmDemos.map((demo) =>
      Math.max(...demo.source.split("\n").map((line) => line.length))))).toBeLessThanOrEqual(80);
    popconfirmDemos.forEach((demo) => {
      expect(demo.source).not.toMatch(/<button\b|<svg\b|style=\{\{/);
      expect(demo.source).not.toMatch(/qizhi-[a-z-]+__/);
    });
  });

  it("documents exactly the implemented public API", () => {
    expect(popconfirmApi.map((item) => item.name)).toEqual([
      "children",
      "title",
      "content",
      "position",
      "icon",
      "disabled",
      "okText",
      "cancelText",
      "okButtonProps",
      "cancelButtonProps",
      "onOk",
      "onCancel",
      "popupVisible",
      "defaultPopupVisible",
      "onVisibleChange",
      "getPopupContainer",
    ]);
    expect(popconfirmApi.find((item) => item.name === "position")?.defaultValue)
      .toBe('"top"');
    expect(popconfirmApi.find((item) => item.name === "onOk")?.type)
      .toContain("Promise<void>");
  });
});
