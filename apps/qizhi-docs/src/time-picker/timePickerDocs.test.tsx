import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TimePickerDocsIsland } from "./TimePickerDocsIsland";
import { timePickerApi } from "./timePickerApi";
import { timePickerDemos } from "./timePickerDocs.registry";
import demoStyles from "./timePickerDemos.css?raw";

const titles = [
  "基础用法", "范围选择器", "不同状态", "受控组件",
  "不同尺寸", "禁用", "定制时分", "定制步长",
] as const;

const descriptions = [
  "时间输入器的基础用法。",
  "时间输入器的范围选择器。",
  "不同状态的时间输入器。",
  "value 和 onChange 需要配合使用。",
  "有四种尺寸可供选择。",
  "禁用状态下不可输入和选择。",
  "通过设置 format，可以定制需要显示的时、分、秒。",
  "通过设置 step，可以定制需要显示的时、分、秒的步长。",
] as const;

describe("TimePicker docs", () => {
  it("keeps all eight legacy demos, descriptions, and order", () => {
    expect(timePickerDemos.map((demo) => demo.title)).toEqual(titles);
    expect(timePickerDemos.map((demo) => demo.descriptions.flat().map((part) =>
      typeof part === "string" ? part : part.code).join(""))).toEqual(descriptions);
  });

  it("uses only public React components in same-source demos", () => {
    expect(timePickerDemos).toHaveLength(8);
    expect(timePickerDemos.every((demo) => demo.tsxSource.includes('from "@wangxiaojinger/qizhi-react"')))
      .toBe(true);
    expect(timePickerDemos.every((demo) => demo.tsxSource.includes("<TimePicker")))
      .toBe(true);
    expect(timePickerDemos.every((demo) => !demo.tsxSource.includes("<input")))
      .toBe(true);
    expect(timePickerDemos.every((demo) => !demo.tsxSource.includes("style={{")))
      .toBe(true);
    expect(demoStyles).not.toMatch(/\.qizhi-[\w-]+__[\w-]+/);
  });

  it("locks the approved initial values, format, and step source", () => {
    const disabled = timePickerDemos.find((demo) => demo.title === "禁用")?.tsxSource ?? "";
    const format = timePickerDemos.find((demo) => demo.title === "定制时分")?.tsxSource ?? "";
    const step = timePickerDemos.find((demo) => demo.title === "定制步长")?.tsxSource ?? "";
    expect(disabled).toContain('defaultValue="08:30:00"');
    expect(format).toContain('format="HH:mm"');
    expect(format).toContain('defaultValue="09:24"');
    expect(step).toContain('defaultValue="10:25:30"');
    expect(step).toContain("hour: 2, minute: 5, second: 10");
  });

  it("documents exactly the approved v1 API", () => {
    expect(timePickerApi.map((item) => item.name)).toEqual([
      "value", "defaultValue", "onChange", "format", "step", "size",
      "status", "disabled", "placeholder", "placeholders", "className",
      "style", "aria-label", "ref",
    ]);
  });

  it("renders shared actions, API, and shell-ready event", async () => {
    let ready = 0;
    const onReady = () => { ready += 1; };
    window.addEventListener("qizhi:react-island-ready", onReady);
    render(<TimePickerDocsIsland />);
    expect(screen.getByRole("heading", { name: "时间选择器 TimePicker" }))
      .toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(8);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(8);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(8);
    expect(screen.queryByRole("button", { name: "复制样式" })).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "TimePicker API" })).toBeInTheDocument();
    await waitFor(() => expect(ready).toBe(1));
    window.removeEventListener("qizhi:react-island-ready", onReady);
  });
});
