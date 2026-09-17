import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SliderDocsIsland } from "./SliderDocsIsland";
import { sliderApi } from "./sliderApi";
import { sliderDemos } from "./sliderDocs.registry";
import sliderDemoStyles from "./sliderDemos.css?raw";

const titles = [
  "基本用法", "基础状态", "范围选择", "多点选择", "显示输入框",
  "竖直滑动条", "控制 tooltip 的展示", "自定义提示", "范围刻度可拖拽",
] as const;

const descriptions = [
  ["基本用法展示。"],
  ["默认态、禁用态。"],
  ["开启范围选择时，当前值为数组。"],
  ["范围内多个点选择。"],
  ["滑动输入条可与数字输入框组合，支持单值和范围值同步输入。"],
  ["设置 vertical 为 true，将会显示竖直的滑动条。"],
  [],
  ["使用 formatterTooltip 可以格式化 Tooltip 的内容。"],
  ["通过设置 range.draggableBar 为 true，让范围刻度可以拖拽。"],
] as const;

describe("Slider docs", () => {
  it("keeps all nine legacy demos and exact descriptions in order", () => {
    expect(sliderDemos.map((demo) => demo.title)).toEqual(titles);
    expect(sliderDemos.map((demo) => demo.descriptions.map((description) =>
      description.map((part) => typeof part === "string" ? part : part.code).join(""),
    ))).toEqual(descriptions);
  });

  it("uses the public Slider in every same-source demo", () => {
    expect(sliderDemos).toHaveLength(9);
    expect(sliderDemos.every((demo) => demo.tsxSource.includes('from "@wangxiaojinger/qizhi-react"')))
      .toBe(true);
    expect(sliderDemos.every((demo) => demo.tsxSource.includes("<Slider"))).toBe(true);
  });

  it("keeps the input composition on embedded InputNumber controls", () => {
    const source = sliderDemos.find((demo) => demo.title === "显示输入框")?.tsxSource ?? "";
    expect(source).not.toContain('mode="button"');
    expect(source).not.toContain('mode={mode}');
    expect(source).toContain('controls={showSteps ? "always" : "hidden"}');
    expect(source).not.toContain("qizhi-input-number__steps");
    expect(source).not.toContain("style={{");
  });

  it("keeps all demo layout out of inline styles", () => {
    expect(sliderDemos.every((demo) => !demo.tsxSource.includes("style={{"))).toBe(true);
    expect(sliderDemoStyles).not.toMatch(/\.qizhi-[\w-]+__[\w-]+/);
  });

  it("uses explicit multiple mode in the same-source multi-point demo", () => {
    const source = sliderDemos.find((demo) => demo.title === "多点选择")?.tsxSource ?? "";
    expect(source).toContain("<Slider multiple");
  });

  it("documents only the approved public API", () => {
    expect(sliderApi.map((item) => item.name)).toEqual([
      "value", "defaultValue", "onChange", "min", "max", "step", "range",
      "multiple", "vertical", "disabled", "marks", "tooltipVisible",
      "tooltipPosition", "formatterTooltip", "getPopupContainer", "onChangeComplete",
      "className", "style", "ref",
    ]);
    expect(sliderApi.find((item) => item.name === "tooltipVisible")?.description)
      .toContain("undefined");
  });

  it("renders the shared actions and rebuilds the shell toc", async () => {
    let ready = 0;
    const onReady = () => { ready += 1; };
    window.addEventListener("qizhi:react-island-ready", onReady);
    render(<SliderDocsIsland />);
    expect(screen.getByRole("heading", { name: "滑动输入条 Slider" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(9);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(9);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(9);
    expect(Array.from(document.querySelectorAll(".component-example-actions")).every((actions) =>
      actions.querySelectorAll(".qizhi-code-action").length === 2)).toBe(true);
    expect(screen.queryByRole("button", { name: "复制样式" })).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Slider API" })).toBeInTheDocument();
    expect(document.querySelector("#滑动输入条-控制-tooltip-的展示 p")).toBeNull();
    await waitFor(() => expect(ready).toBe(1));
    window.removeEventListener("qizhi:react-island-ready", onReady);
  });
});
