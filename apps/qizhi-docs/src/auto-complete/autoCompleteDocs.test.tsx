import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutoCompleteDocsIsland } from "./AutoCompleteDocsIsland";
import { autoCompleteApi } from "./autoCompleteApi";
import { autoCompleteDemos } from "./autoCompleteDocs.registry";

describe("AutoComplete docs", () => {
  const popupFor = (input: HTMLElement) => within(document.getElementById(input.getAttribute("aria-controls")!)!);

  it("保留旧站 8 组 Demo 的顺序、标题和说明", () => {
    expect(autoCompleteDemos.map((demo) => demo.title)).toEqual([
      "基础用法", "自定义选项", "自定义输入组件", "区分大小写", "复杂用法", "查询模式 确定类目", "查询模式 不确定类目", "自定义过滤规则",
    ]);
    expect(autoCompleteDemos.map((demo) => demo.description)).toEqual([
      "根据当前输入展示输入建议（下拉选择）。",
      "可以传入 AutoComplete.Option 作为组件的 children，而非使用 data。",
      "支持自定义输入组件。",
      "使用 strict=true 来指明在匹配时严格区分大小写。",
      "这个示例展示了：1. 添加 Tooltip，2. 自定义显示，3. 对值进行操控。",
      "根据查询结果补全输入内容（确定类目）。",
      "根据查询结果补全输入内容（不确定类目）。",
      "如果你依赖用户输入来动态更新选项，请通过 filterOption 属性来覆盖默认的选项过滤规则，或者将其设为 false 来关闭默认过滤规则。",
    ]);
    autoCompleteDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toContain("Demo.tsx");
    });
  });

  it("渲染 8 组 Demo、公共代码操作和 API 表", () => {
    render(<AutoCompleteDocsIsland />);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(8);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(8);
    expect(screen.getByRole("table", { name: "AutoComplete API" })).toBeInTheDocument();
    expect(screen.queryByText("Demo.tsx")).not.toBeInTheDocument();
  });

  it("保持旧站每组一个输入控件和初始值", () => {
    render(<AutoCompleteDocsIsland />);
    autoCompleteDemos.forEach((demo) => expect(document.querySelectorAll(`#${demo.id} [role="combobox"]`)).toHaveLength(1));
    expect(within(document.getElementById("自动补全-复杂用法")!).getByRole("combobox")).toHaveValue("Beijing");
    expect(within(document.getElementById("自动补全-自定义输入组件")!).getByRole("combobox").tagName).toBe("TEXTAREA");
  });

  it("保持基础、严格和查询模式的候选数量", () => {
    render(<AutoCompleteDocsIsland />);
    const basic = within(document.getElementById("自动补全-基础用法")!).getByRole("combobox");
    fireEvent.change(basic, { target: { value: "bei" } });
    expect(popupFor(basic).getAllByRole("option")).toHaveLength(5);

    const strict = within(document.getElementById("自动补全-区分大小写")!).getByRole("combobox");
    fireEvent.change(strict, { target: { value: "B" } });
    expect(popupFor(strict).getByText("暂无匹配结果")).toBeInTheDocument();
    expect(popupFor(strict).queryByRole("option")).not.toBeInTheDocument();
    fireEvent.change(strict, { target: { value: "b" } });
    expect(popupFor(strict).getAllByRole("option")).toHaveLength(3);

    const certain = within(document.getElementById("自动补全-查询模式-确定类目")!).getByRole("combobox");
    fireEvent.change(certain, { target: { value: "model" } });
    expect(popupFor(certain).getAllByRole("option")).toHaveLength(9);
  });

  it("API 列出远程查询四态能力", () => {
    expect(autoCompleteApi.map((item) => item.name)).toEqual([
      "data", "children", "value", "defaultValue", "strict", "filterOption", "triggerElement", "loading", "emptyContent", "error", "onRetry", "onChange", "onSearch", "onSelect", "className", "style", "ref",
    ]);
  });
});
