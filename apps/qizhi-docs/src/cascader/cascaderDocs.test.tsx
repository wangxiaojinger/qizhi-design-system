import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CascaderDocsIsland } from "./CascaderDocsIsland";
import { cascaderDemos } from "./cascaderDocs.registry";
import { cascaderApi } from "./cascaderApi";

describe("Cascader documentation", () => {
  test("keeps all legacy capability groups in their approved order", () => {
    expect(cascaderDemos.map((demo) => demo.id)).toEqual([
      "级联选择-基础用法", "级联选择-允许清除", "级联选择-前置标签", "级联选择-格式化展示选中值",
      "级联选择-自定义选择框", "级联选择-不同尺寸", "级联选择-自定义字段名", "级联选择-拖拽排序",
      "级联选择-选择即改变", "级联选择-支持多选", "级联选择-允许搜索", "级联选择-自定义搜索",
      "级联选择-动态加载", "级联选择-选项禁用", "级联选择-受控模式",
    ]);
    expect(cascaderDemos.every((demo) => demo.source.includes('from "@wangxiaojinger/qizhi-react"'))).toBe(true);
  });

  test("renders package demos, a unique API anchor and the shell ready event", () => {
    const ready = vi.fn();
    window.addEventListener("qizhi:react-island-ready", ready);
    render(<CascaderDocsIsland />);

    expect(screen.getByRole("heading", { name: "级联选择 Cascader" })).toBeInTheDocument();
    expect(document.querySelectorAll("#cascader-API")).toHaveLength(1);
    expect(document.querySelectorAll(".codebox-wrapper")).toHaveLength(15);
    expect(ready).toHaveBeenCalledTimes(1);
    window.removeEventListener("qizhi:react-island-ready", ready);
  });

  test("renders the legacy four-size segmented demo with two synchronized controls", () => {
    render(<CascaderDocsIsland />);

    const section = document.querySelector("#级联选择-不同尺寸");
    const controls = section?.querySelectorAll(".qizhi-cascader");
    const sizeControl = screen.getByRole("radiogroup", { name: "级联选择尺寸" });
    expect(sizeControl.querySelectorAll('[role="radio"]')).toHaveLength(4);
    expect(controls).toHaveLength(2);

    fireEvent.click(screen.getByRole("radio", { name: "mini" }));
    expect(controls?.[0]).toHaveClass("qizhi-cascader--mini");
    expect(controls?.[1]).toHaveClass("qizhi-cascader--mini");
  });

  test("shows readable source that can be copied without private demo dependencies", () => {
    render(<CascaderDocsIsland />);

    const sourceButtons = screen.getAllByRole("button", { name: "查看代码" });
    sourceButtons.forEach((button) => fireEvent.click(button));

    const sourceBlocks = document.querySelectorAll(".qizhi-code-wrapper code");
    expect(sourceBlocks).toHaveLength(15);
    sourceBlocks.forEach((code) => {
      expect(code.textContent).not.toContain('from "./data"');
      expect(code.textContent?.split("\n").some((line) => line.length > 120)).toBe(false);
    });
  });

  test("publishes each Cascader prop as structured API metadata", () => {
    render(<CascaderDocsIsland />);

    expect(cascaderApi.map((item) => item.name)).toEqual([
      "options", "mode", "value", "defaultValue", "onChange", "fieldNames",
      "placeholder", "size", "status", "expandTrigger", "allowClear", "addBefore",
      "showSearch", "filterOption", "changeOnSelect", "loadMore", "renderFormat",
      "trigger", "checkedStrategy", "dragToSort", "open", "defaultOpen",
      "onOpenChange", "className", "style", "id", "name", "aria-label",
      "aria-labelledby",
    ]);
    expect(screen.getByRole("table", { name: "Cascader API" })).toBeInTheDocument();
    expect(cascaderApi.every((item) => item.description.length > 2)).toBe(true);
    expect(cascaderApi.every((item) => !item.name.includes("/"))).toBe(true);
  });

  test("keeps the legacy custom trigger and complete multiple-value compositions", () => {
    const source = Object.fromEntries(cascaderDemos.map((demo) => [demo.id, demo.source]));

    expect(source["级联选择-自定义选择框"]).toContain('className="cascader-custom-trigger-label">城市</span>');
    expect(source["级联选择-自定义选择框"]).toContain("上海，上海市，黄浦");
    expect(source["级联选择-拖拽排序"]).toContain('className="cascader-docs-wide"');
    expect(source["级联选择-拖拽排序"]).toContain('["beijing", "beijing-city", "chaoyang", "datunli"]');
    expect(source["级联选择-支持多选"]).toContain('["beijing", "beijing-city", "chaoyang", "datunli"]');
    expect(source["级联选择-受控模式"]).toContain('["beijing", "beijing-city", "chaoyang", "datunli"]');
  });
});
