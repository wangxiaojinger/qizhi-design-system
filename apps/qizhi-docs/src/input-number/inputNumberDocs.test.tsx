import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InputNumberDocsIsland } from "./InputNumberDocsIsland";
import { inputNumberApi } from "./inputNumberApi";
import { inputNumberDemos } from "./inputNumberDocs.registry";

const titles = [
  "基础用法",
  "按钮模式",
  "三种尺寸",
  "精度和步长",
  "格式化展示值",
  "前缀及后缀",
  "高精度",
] as const;

const descriptions = [
  ["通过鼠标或者键盘输入范围内的标准数值。"],
  ["指定 mode 为 button 来使用带按钮的数字输入框。"],
  ["设置 size 可以使用三种尺寸（small、default、large）的数字输入框，高度分别对应 28px、32px、36px。"],
  ["通过 precision 设置数字精度。当 precision 小于 step 的小数位时，精度取 step 的小数个数。"],
  [
    "通过 formatter、parser 配合使用可以定义输入框展示值。",
    "通过 formatter 中的 userTyping 参数，判断是否正在输入，可以延迟显示 formatter 后的值。",
  ],
  ["可以添加前缀和后缀。"],
  ["通过 strictMode 开启严格模式以支持更高精度，onChange 此时将会返回字符串。"],
] as const;

describe("InputNumber docs", () => {
  it("keeps the seven legacy demos in original order with exact copy", () => {
    expect(inputNumberDemos.map((demo) => demo.title)).toEqual(titles);
    expect(inputNumberDemos.map((demo) => demo.descriptions.map((description) =>
      description.map((part) => typeof part === "string" ? part : part.code).join(""),
    ))).toEqual(descriptions);
  });

  it("uses the public component in every same-source demo", () => {
    expect(inputNumberDemos.every((demo) => demo.tsxSource.includes('from "@wangxiaojinger/qizhi-react"')))
      .toBe(true);
    expect(inputNumberDemos.every((demo) => demo.tsxSource.includes("<InputNumber")))
      .toBe(true);
  });

  it("documents only the confirmed v1 API", () => {
    expect(inputNumberApi.map((item) => item.name)).toEqual([
      "value", "defaultValue", "onChange", "min", "max", "step", "precision",
      "mode", "controls", "size", "disabled", "readOnly", "placeholder", "prefix", "suffix",
      "formatter", "parser", "strictMode", "className", "style", "ref",
    ]);
  });

  it("renders only the authorized code actions and rebuilds the shell toc", async () => {
    let ready = 0;
    const handleReady = () => { ready += 1; };
    window.addEventListener("qizhi:react-island-ready", handleReady);
    render(<InputNumberDocsIsland />);
    expect(screen.getByRole("heading", { name: "数字输入框 InputNumber" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(7);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(7);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(7);
    expect(screen.queryByRole("button", { name: "复制样式" })).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "InputNumber API" })).toBeInTheDocument();
    expect(document.querySelectorAll(".code-preview code")).toHaveLength(20);
    expect(screen.queryByText("只列出 QIZHI InputNumber v1 已实现能力。"))
      .not.toBeInTheDocument();
    await waitFor(() => expect(ready).toBe(1));
    window.removeEventListener("qizhi:react-island-ready", handleReady);
  });
});
