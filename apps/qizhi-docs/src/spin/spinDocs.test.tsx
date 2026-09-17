import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SpinDocsIsland } from "./SpinDocsIsland";
import { spinApi } from "./spinApi";
import { spinDemos } from "./spinDocs.registry";

const titles = [
  "基础用法",
  "在容器中",
  "自定义描述文案",
  "自定义指示符",
  "不同尺寸",
];

const descriptions = [
  "一个简单的加载中状态。",
  "可以给任意元素添加加载状态。容器默认采用行内块布局，需要撑满父级时可设置为块级布局。",
  "通过 tip 字段自定义加载时的文案。",
  "通过指定 icon 可以使用自定义图标作为加载指示符。",
  "设置 size 可以得到不同尺寸的加载图标。",
];

describe("Spin docs", () => {
  it("locks all five legacy demos in exact order and copy", () => {
    expect(spinDemos.map((demo) => demo.title)).toEqual(titles);
    expect(spinDemos.map((demo) => demo.description)).toEqual(descriptions);
  });

  it("preserves the original data, labels, sizes and loading interaction", () => {
    render(<SpinDocsIsland />);

    expect(screen.getByText("加载中 Spin")).toBeInTheDocument();
    expect(screen.getByText(
      "用于页面和区块的加载中状态。页面局部处于等待异步数据或正在渲染过程中时，合适的加载动效会有效缓解用户的焦虑。",
    )).toBeInTheDocument();
    for (const copy of [
      "数据同步",
      "内容更新",
      "区块加载",
      "延迟加载",
      "自定义加载",
      "这可能需要一段时间……",
    ]) expect(screen.getByText(copy)).toBeInTheDocument();

    const containerDemo = document.getElementById("Spin-容器中")!;
    const toggle = within(containerDemo).getByRole("button", {
      name: "加载中：是",
    });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(containerDemo.querySelectorAll(".qizhi-spin.is-loading"))
      .toHaveLength(3);
    expect(containerDemo.querySelectorAll(".qizhi-spin__children[inert]"))
      .toHaveLength(3);

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent("加载中：否");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(containerDemo.querySelectorAll(".qizhi-spin.is-loading"))
      .toHaveLength(0);
    expect(containerDemo.querySelectorAll(".qizhi-spin__children[inert]"))
      .toHaveLength(0);
  });

  it("keeps preview, displayed code and copied code on one TSX source", () => {
    for (const demo of spinDemos) {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toMatch(/<(button|input|select|textarea)\b/);
      expect(demo.source).not.toContain("<svg");
      expect(demo.source).not.toContain("style={{");
      expect(demo.source).not.toMatch(/qizhi-[\w-]+__/);
      expect(Math.max(...demo.source.split("\n").map((line) => line.length)))
        .toBeLessThanOrEqual(80);
    }

    render(<SpinDocsIsland />);
    expect(screen.getAllByRole("button", { name: "查看代码" }))
      .toHaveLength(5);
    expect(screen.getAllByRole("button", { name: "复制代码" }))
      .toHaveLength(5);
    expect(screen.queryByText("Demo.tsx")).not.toBeInTheDocument();
  });

  it("uses the shared React Demo shell for every Spin example", () => {
    render(<SpinDocsIsland />);

    const examples = document.querySelectorAll("article.codebox-wrapper");
    expect(examples).toHaveLength(5);
    for (const example of examples) {
      expect(example).toHaveClass("qizhi-react-demo-codebox");
    }
  });

  it("toggles loading through Enter and Space from the focused button", async () => {
    const user = userEvent.setup();
    render(<SpinDocsIsland />);

    const containerDemo = document.getElementById("Spin-容器中")!;
    const toggle = within(containerDemo).getByRole("button", {
      name: "加载中：是",
    });

    toggle.focus();
    await user.keyboard("{Enter}");
    expect(toggle).toHaveTextContent("加载中：否");
    expect(containerDemo.querySelectorAll(".qizhi-spin.is-loading"))
      .toHaveLength(0);

    await user.keyboard(" ");
    expect(toggle).toHaveTextContent("加载中：是");
    expect(containerDemo.querySelectorAll(".qizhi-spin.is-loading"))
      .toHaveLength(3);
  });

  it("publishes only the approved Spin v1 API", () => {
    expect(spinApi.map((item) => item.name)).toEqual([
      "loading",
      "size",
      "tip",
      "icon",
      "block",
      "children",
      "className",
      "style",
      "ref",
    ]);
    render(<SpinDocsIsland />);
    expect(screen.getByRole("table", { name: "Spin API" }))
      .toBeInTheDocument();
  });
});
