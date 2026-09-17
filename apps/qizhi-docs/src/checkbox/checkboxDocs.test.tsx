import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CheckboxDocsIsland } from "./CheckboxDocsIsland";
import { checkboxApi, checkboxGroupApi } from "./checkboxApi";
import { checkboxDemos } from "./checkboxDocs.registry";

describe("Checkbox docs", () => {
  it("保留确认的 5 组 Demo 顺序、说明和同源 TSX", () => {
    expect(checkboxDemos.map((demo) => demo.title)).toEqual(["基础用法", "受控", "复选框组", "全选", "布局"]);
    expect(checkboxDemos.map((demo) => demo.description)).toEqual([
      "最基本的点击选中操作，包含禁用状态。",
      "通过 checked 属性控制是否选中。",
      "生成复选框组。设置 direction=\"vertical\" 可以展示竖向的复选框组。",
      "通过 indeterminate 属性可以实现半选效果。",
      "可以通过 children 传入 Checkbox，配合 CSS Grid 实现灵活的响应式布局。",
    ]);
    checkboxDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).toContain("const App = () => {");
      expect(demo.source).toContain("export default App;");
      expect(demo.source).not.toContain("Demo.tsx");
    });
  });

  it("渲染 5 组 Demo、公共代码操作和两张 API 表", () => {
    render(<CheckboxDocsIsland />);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(5);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(5);
    expect(document.getElementById("checkbox-API")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Checkbox API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Checkbox.Group API" })).toBeInTheDocument();
    expect(screen.queryByText("Demo.tsx")).not.toBeInTheDocument();
  });

  it("保持旧站实例数量和初始状态", () => {
    render(<CheckboxDocsIsland />);
    expect(document.querySelectorAll("#复选框-基础用法 .qizhi-checkbox")).toHaveLength(4);
    expect(document.querySelectorAll("#复选框-受控 .qizhi-checkbox")).toHaveLength(2);
    expect(document.querySelectorAll("#复选框-复选框组 .qizhi-checkbox")).toHaveLength(10);
    expect(document.querySelectorAll("#复选框-全选 .qizhi-checkbox")).toHaveLength(4);
    expect(document.querySelectorAll("#复选框-布局 .qizhi-checkbox")).toHaveLength(5);
    expect(within(document.getElementById("复选框-全选")!).getByRole("checkbox", { name: "全选" })).toBePartiallyChecked();
  });

  it("受控按钮和全选 Demo 保持旧站联动", () => {
    render(<CheckboxDocsIsland />);
    const controlled = document.getElementById("复选框-受控")!;
    fireEvent.click(within(controlled).getByRole("button", { name: "选中" }));
    expect(within(controlled).getAllByRole("checkbox").every((item) => (item as HTMLInputElement).checked)).toBe(true);
    expect(within(controlled).getByRole("button", { name: "取消选中" })).toBeInTheDocument();

    const all = document.getElementById("复选框-全选")!;
    fireEvent.click(within(all).getByRole("checkbox", { name: "全选" }));
    expect(within(all).getAllByRole("checkbox").every((item) => (item as HTMLInputElement).checked)).toBe(true);
    fireEvent.click(within(all).getByRole("checkbox", { name: "选项 1" }));
    expect(within(all).getByRole("checkbox", { name: "全选" })).toBePartiallyChecked();
  });

  it("API 元数据只覆盖 Checkbox v1 已实现能力", () => {
    expect(checkboxApi.map((item) => item.name)).toEqual(["children", "value", "checked", "defaultChecked", "indeterminate", "disabled", "onChange", "className", "style", "ref"]);
    expect(checkboxGroupApi.map((item) => item.name)).toEqual(["children", "options", "value", "defaultValue", "disabled", "direction", "onChange", "className", "style"]);
    expect(checkboxApi.find((item) => item.name === "indeterminate")?.defaultValue).toBe("false");
    expect(checkboxGroupApi.find((item) => item.name === "direction")?.defaultValue).toBe("horizontal");
    expect(checkboxGroupApi.find((item) => item.name === "options")?.description).toContain("不包含 icon");
    render(<CheckboxDocsIsland />);
    expect(screen.getByText("type CheckboxValue = string | number;")).toBeInTheDocument();
    expect(screen.getByText(/interface CheckboxOption/)).toBeInTheDocument();
    expect(checkboxApi.map((item) => item.name)).not.toEqual(expect.arrayContaining(["error", "icon", "useCheckbox"]));
  });
});
