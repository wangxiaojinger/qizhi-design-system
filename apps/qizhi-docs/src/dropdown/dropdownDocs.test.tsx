import { render, screen } from "@testing-library/react";
import { DropdownDocsIsland } from "./DropdownDocsIsland";
import { dropdownDemos } from "./dropdownDocs.registry";

describe("Dropdown docs", () => {
  it("locks all seven legacy demos in their original order", () => {
    expect(dropdownDemos.map((demo) => demo.id)).toEqual([
      "下拉菜单-基础用法",
      "下拉菜单-弹出方向",
      "下拉菜单-触发方式",
      "下拉菜单-触发事件",
      "下拉菜单-按钮下拉框",
      "下拉菜单-多级菜单",
      "下拉菜单-带图标的菜单",
    ]);
  });

  it("renders only same-source TSX demos and the unique API anchor", () => {
    render(<DropdownDocsIsland />);
    expect(screen.getAllByRole("article")).toHaveLength(7);
    expect(screen.getByRole("heading", { name: "下拉菜单 Dropdown" })).toBeInTheDocument();
    expect(document.querySelectorAll("#dropdown-API")).toHaveLength(1);
    expect(dropdownDemos.every((demo) => demo.source.includes('from "@wangxiaojinger/qizhi-react"'))).toBe(true);
    expect(dropdownDemos.every((demo) => !("cssSource" in demo))).toBe(true);
    expect(dropdownDemos.every((demo) => demo.source.split("\n").length > 10)).toBe(true);
    expect(dropdownDemos.every((demo) => Math.max(...demo.source.split("\n").map((line) => line.length)) <= 100)).toBe(true);
  });

  it("reuses the established Button code actions and code panel", () => {
    render(<DropdownDocsIsland />);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(7);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(7);
    expect(document.querySelectorAll(".qizhi-code-action")).toHaveLength(14);
    expect(document.querySelector(".dropdown-demo__tool")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".component-example-actions")).toHaveLength(7);
  });
});
