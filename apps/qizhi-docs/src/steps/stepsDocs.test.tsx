import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import modalStepsSource from "../modal/demos/StepsDemo.tsx?raw";
import { StepsDocsIsland } from "./StepsDocsIsland";
import { stepsApi } from "./stepsApi";
import { stepsDemos } from "./stepsDocs.registry";

const titles = [
  "基础用法",
  "小型步骤条",
  "展示描述信息",
  "步骤错误",
  "步骤切换",
];
const descriptions = [
  "这是步骤条组件的基础用法。",
  "小型步骤条适合信息密度较高或空间有限的场景。",
  "步骤内容需要补充说明时，可在标题下展示描述信息。",
  "通过错误状态标识当前未能完成的步骤。",
  "通过改变当前步骤，可以在任务流程中前进或后退。",
];

describe("Steps docs", () => {
  it("locks all five legacy demos in exact order and copy", () => {
    expect(stepsDemos.map((demo) => demo.title)).toEqual(titles);
    expect(stepsDemos.map((demo) => demo.description))
      .toEqual(descriptions);
  });

  it("preserves all static states, labels, descriptions, and sizes", () => {
    render(<StepsDocsIsland />);
    expect(screen.getByRole("heading", { name: "步骤条 Steps" }))
      .toBeInTheDocument();
    expect(screen.getAllByRole("list")).toHaveLength(5);

    const basic = screen.getByRole("list", { name: "基础步骤条" });
    expect(within(basic).getAllByRole("listitem")[1])
      .toHaveAttribute("aria-current", "step");
    expect(screen.getByText("步骤 2 内容")).toBeInTheDocument();

    expect(screen.getByRole("list", { name: "小型步骤条" }))
      .toHaveClass("qizhi-steps--small");
    expect(screen.getAllByText("这是一段描述")).toHaveLength(6);
    expect(screen.getByRole("list", { name: "带错误状态的步骤条" })
      .querySelector(".qizhi-steps__item--error")).toBeInTheDocument();
  });

  it("walks the switch demo through both boundaries and back", async () => {
    const user = userEvent.setup();
    render(<StepsDocsIsland />);
    const previous = screen.getByRole("button", { name: "后退" });
    const next = screen.getByRole("button", { name: "下一个" });
    const content = screen.getByText("步骤 1 内容");

    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();
    await user.click(next);
    expect(content).toHaveTextContent("步骤 2 内容");
    expect(previous).toBeEnabled();
    await user.click(next);
    expect(content).toHaveTextContent("步骤 3 内容");
    expect(next).toBeDisabled();
    await user.click(previous);
    await user.click(previous);
    expect(content).toHaveTextContent("步骤 1 内容");
    expect(previous).toBeDisabled();
  });

  it("keeps every preview, display, and copy on formatted Demo TSX", () => {
    for (const demo of stepsDemos) {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toMatch(/<(button|input|select|textarea)\b/);
      expect(demo.source).not.toContain("<svg");
      expect(demo.source).not.toContain("style={{");
      expect(demo.source).not.toMatch(/qizhi-steps__/);
      expect(Math.max(...demo.source.split("\n").map((line) => line.length)))
        .toBeLessThanOrEqual(80);
    }
    expect(modalStepsSource).toContain("Steps");
    expect(modalStepsSource).not.toContain("qizhi-modal-step");
  });

  it("publishes only the approved v1 API", () => {
    expect(stepsApi.map((item) => item.name)).toEqual([
      "items",
      "current",
      "size",
      "status",
      "className",
      "style",
      "ref",
    ]);
  });
});
