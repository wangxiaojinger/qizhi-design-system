import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TagDocsIsland } from "./TagDocsIsland";
import { tagApi } from "./tagApi";
import { tagDemos } from "./tagDocs.registry";

const titles = ["基础用法", "可关闭标签", "多彩标签", "可选中", "不同尺寸", "带边框的标签"];

describe("Tag docs", () => {
  it("保留旧站 6 组 Demo 的顺序、文案和同源 TSX", () => {
    expect(tagDemos.map((demo) => demo.title)).toEqual(titles);
    expect(tagDemos.map((demo) => demo.description)).toEqual([
      "标签的基础用法，可单独展示文本，也可搭配图标表达完成、状态和分类。",
      "可设置 closable 属性控制标签是否可关闭，也可通过 visible 属性控制标签的显示隐藏。",
      "通过 color 设置标签颜色，支持内置色板名称和自定义颜色。",
      "通过参数 checkable，可以实现点击选中的效果。",
      "使用 size 属性设置不同尺寸，覆盖 small、default、medium、large 四种规格。",
      "通过参数 bordered，可以显示带边框的标签。",
    ]);
    tagDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).toContain("const App = () => {");
      expect(demo.source).toContain("export default App;");
      expect(demo.source).not.toContain("export default function");
      expect(demo.source).not.toContain("Demo.tsx");
    });
  });

  it("渲染 6 组 Demo、公共代码操作和独立 API 锚点", () => {
    render(<TagDocsIsland />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(7);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(6);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(6);
    expect(document.getElementById("tag-API")).toBeInTheDocument();
    expect(screen.queryByText("Demo.tsx")).not.toBeInTheDocument();
  });

  it("保持旧站每组 Tag 实例数量和初始状态", () => {
    render(<TagDocsIsland />);
    expect(document.querySelectorAll("#标签-基础用法 .qizhi-tag")).toHaveLength(4);
    expect(document.querySelectorAll("#标签-可关闭标签 .qizhi-tag")).toHaveLength(2);
    expect(document.querySelectorAll("#标签-多彩标签 .qizhi-tag")).toHaveLength(12);
    expect(document.querySelectorAll("#标签-可选中 .qizhi-tag")).toHaveLength(3);
    expect(document.querySelectorAll("#标签-不同尺寸 .qizhi-tag")).toHaveLength(4);
    expect(document.querySelectorAll("#标签-带边框的标签 .qizhi-tag")).toHaveLength(7);
    expect(within(document.getElementById("标签-可选中")!).getByRole("checkbox", { name: "Awesome" })).toHaveAttribute("aria-checked", "false");
  });

  it("补全关闭和 Toggle 显示隐藏交互", () => {
    render(<TagDocsIsland />);
    const demo = document.getElementById("标签-可关闭标签")!;
    fireEvent.click(within(demo).getAllByRole("button", { name: "关闭标签" })[0]);
    expect(demo.querySelectorAll(".qizhi-tag")).toHaveLength(1);
    const toggle = within(demo).getByRole("switch", { name: "显示标签" });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(demo.querySelectorAll(".qizhi-tag")).toHaveLength(0);
    fireEvent.click(toggle);
    expect(demo.querySelectorAll(".qizhi-tag")).toHaveLength(1);
  });

  it("API 元数据覆盖 QIZHI Tag 公开组件能力", () => {
    expect(tagApi.map((item) => item.name)).toEqual([
      "children", "icon", "size", "color", "bordered", "closable", "visible",
      "closeAriaLabel", "onClose", "checkable", "checked", "defaultChecked", "onChange",
      "className", "style", "onClick",
    ]);
    expect(tagApi.find((item) => item.name === "visible")?.defaultValue).toBe("true");
  });
});
