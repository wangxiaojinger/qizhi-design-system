import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RadioDocsIsland } from "./RadioDocsIsland";
import { radioApi, radioGroupApi } from "./radioApi";
import { radioDemos } from "./radioDocs.registry";

const titles = ["基础用法", "单选框组", "线框型单选按钮组"];

describe("Radio docs", () => {
  it("保留审定后的 3 组 Demo 顺序、说明和同源 TSX", () => {
    expect(radioDemos.map((demo) => demo.title)).toEqual(titles);
    expect(radioDemos.map((demo) => demo.description)).toEqual([
      "基础单选框。",
      "单选组的用法。有两种用法，可以通过 children 的方式或者 options 数组的方式。",
      "指定 type=\"button\"，单选框会展示为线框按钮样式。",
    ]);
    radioDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).toContain("const App = () => {");
      expect(demo.source).toContain("export default App;");
      expect(demo.source).not.toContain("Demo.tsx");
      expect(demo.source).not.toContain('mode="fill"');
    });
  });

  it("渲染 3 组 Demo、公共代码操作和两张 API 表", () => {
    render(<RadioDocsIsland />);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(3);
    expect(document.getElementById("radio-API")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Radio API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Radio.Group API" })).toBeInTheDocument();
    expect(screen.queryByText("Demo.tsx")).not.toBeInTheDocument();
  });

  it("保持旧站实例数量和初始状态", () => {
    render(<RadioDocsIsland />);
    expect(document.querySelectorAll("#单选框-基础用法 .qizhi-radio")).toHaveLength(2);
    expect(document.querySelectorAll("#单选框-单选框组 .qizhi-radio")).toHaveLength(12);
    expect(document.querySelectorAll("#单选框-线框型单选按钮组 [data-radio-preview] .qizhi-radio-button")).toHaveLength(3);
    expect(within(document.getElementById("单选框-基础用法")!).getByRole("radio", { name: "禁用单选框" })).toBeChecked();
    expect(within(document.getElementById("单选框-基础用法")!).getByRole("radio", { name: "禁用单选框" })).toBeDisabled();
    expect(within(document.getElementById("单选框-线框型单选按钮组")!).getByRole("radio", { name: "北京" })).toBeChecked();
  });

  it("文档分段控制器更新线框预览并回退隐藏选项", () => {
    render(<RadioDocsIsland />);
    const outline = document.getElementById("单选框-线框型单选按钮组")!;
    fireEvent.click(within(outline).getByRole("radio", { name: "4" }));
    fireEvent.click(within(outline).getByRole("radio", { name: "深圳" }));
    fireEvent.click(within(outline).getByRole("radio", { name: "2" }));
    expect(outline.querySelectorAll("[data-radio-preview] .qizhi-radio-button")).toHaveLength(2);
    expect(within(outline).getByRole("radio", { name: "北京" })).toBeChecked();
    fireEvent.click(within(outline).getByRole("radio", { name: "large 36px" }));
    expect(outline.querySelector("[data-radio-preview]")).toHaveClass("qizhi-radio-size-large");

  });

  it("API 元数据只覆盖已审定的 Radio 能力", () => {
    expect(radioApi.map((item) => item.name)).toEqual([
      "children", "value", "checked", "defaultChecked", "disabled", "type", "size", "onChange", "className", "style",
    ]);
    expect(radioGroupApi.map((item) => item.name)).toEqual([
      "children", "options", "value", "defaultValue", "disabled", "type", "size", "name", "onChange", "className", "style",
    ]);
    expect(radioApi.find((item) => item.name === "type")?.defaultValue).toBe("radio");
    expect(radioGroupApi.find((item) => item.name === "size")?.defaultValue).toBe("default");
  });
});
