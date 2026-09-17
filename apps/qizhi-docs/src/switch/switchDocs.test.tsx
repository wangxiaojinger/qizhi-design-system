import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SwitchDocsIsland } from "./SwitchDocsIsland";
import { switchApi } from "./switchApi";
import { switchDemos } from "./switchDocs.registry";

describe("Switch docs", () => {
  it("保留旧站 4 组 Demo 顺序、说明和同源 TSX", () => {
    expect(switchDemos.map((demo) => demo.title)).toEqual(["基础用法", "不同尺寸的开关", "自定义文案", "加载中"]);
    expect(switchDemos.map((demo) => demo.description)).toEqual([
      "最基础的应用，支持点击切换；同时展示禁用状态。",
      "默认尺寸高度为 24px，小号尺寸高度为 16px。",
      "自定义开关打开或关闭时显示的文字。",
      "开关处于加载中状态时不可点击。",
    ]);
    switchDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toContain("Demo.tsx");
    });
  });

  it("保持旧站实例数量、尺寸与初始状态", () => {
    render(<SwitchDocsIsland />);
    expect(document.querySelectorAll("#开关-基础用法 .qizhi-switch")).toHaveLength(3);
    expect(document.querySelectorAll("#开关-不同尺寸的开关 .qizhi-switch")).toHaveLength(2);
    expect(document.querySelectorAll("#开关-自定义文案 .qizhi-switch")).toHaveLength(1);
    expect(document.querySelectorAll("#开关-加载中 .qizhi-switch")).toHaveLength(1);
    expect(document.querySelector("#开关-不同尺寸的开关 .qizhi-switch-small")).toBeInTheDocument();
    expect(within(document.getElementById("开关-加载中")!).getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("自定义文案按旧站从 OFF 切换为 ON", () => {
    render(<SwitchDocsIsland />);
    const demo = document.getElementById("开关-自定义文案")!;
    const control = within(demo).getByRole("switch");
    expect(control).toHaveTextContent("OFF");
    fireEvent.click(control);
    expect(control).toHaveTextContent("ON");
  });

  it("API 只列出 QIZHI Switch v1 能力", () => {
    expect(switchApi.map((item) => item.name)).toEqual([
      "checked", "defaultChecked", "disabled", "loading", "size", "checkedText", "uncheckedText", "onChange", "className", "style", "ref",
    ]);
    expect(switchApi.find((item) => item.name === "size")?.type).toBe('"default" | "small"');
    render(<SwitchDocsIsland />);
    expect(screen.getByRole("table", { name: "Switch API" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(4);
    expect(screen.queryByText("Demo.tsx")).not.toBeInTheDocument();
  });
});
