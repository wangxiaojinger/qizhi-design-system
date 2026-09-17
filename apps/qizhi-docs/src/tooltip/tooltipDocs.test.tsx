import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TooltipDocsIsland } from "./TooltipDocsIsland";
import { tooltipApi } from "./tooltipApi";
import { tooltipDemos } from "./tooltipDocs.registry";

describe("Tooltip docs", () => {
  it("keeps the five confirmed legacy demos and descriptions in order", () => {
    expect(tooltipDemos.map(({ id, title, description }) => ({
      id,
      title,
      description,
    }))).toEqual([
      {
        id: "文字气泡-基础用法",
        title: "基础用法",
        description: "鼠标移入，气泡出现，鼠标移出，气泡消失。",
      },
      {
        id: "文字气泡-迷你尺寸",
        title: "迷你尺寸",
        description: "适用于小场景或数字气泡样式。",
      },
      {
        id: "文字气泡-位置",
        title: "位置",
        description: "Tooltip 支持 12 个不同的方位。分别为：上左 上 上右 下左 下 下右 左上 左 左下 右上 右 右下。",
      },
      {
        id: "文字气泡-受控模式",
        title: "受控模式",
        description: "可以通过 popupVisible 控制气泡显示状态。",
      },
      {
        id: "文字气泡-不同颜色",
        title: "不同颜色",
        description: "通过设置 color 可以展示不同背景色的提示内容。",
      },
    ]);
  });

  it("uses formatted Demo TSX as the display and copy source", () => {
    tooltipDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toContain("Demo.tsx");
      expect(demo.source).not.toContain("@arco-design");
      expect(Math.max(...demo.source.split("\n").map((line) => line.length)))
        .toBeLessThanOrEqual(80);
    });
  });

  it("keeps the original placement labels, content, and source order", () => {
    const source = tooltipDemos.find(({ title }) => title === "位置")?.source;

    expect(source).toContain('const content = "This is a Tooltip";');
    expect(source?.match(/\["[^\"]+", "[^\"]+"\]/g)).toEqual([
      '["topLeft", "TL"]',
      '["top", "Top"]',
      '["topRight", "TR"]',
      '["leftTop", "LT"]',
      '["left", "Left"]',
      '["leftBottom", "LB"]',
      '["rightTop", "RT"]',
      '["right", "Right"]',
      '["rightBottom", "RB"]',
      '["bottomLeft", "BL"]',
      '["bottom", "Bottom"]',
      '["bottomRight", "BR"]',
    ]);
  });

  it("documents only the confirmed Tooltip v1 API", () => {
    expect(tooltipApi.map((item) => item.name)).toEqual([
      "children",
      "content",
      "position",
      "trigger",
      "mini",
      "color",
      "popupVisible",
      "defaultPopupVisible",
      "onVisibleChange",
      "getPopupContainer",
    ]);
  });

  it("renders all five demos, their original copy, and the API table", () => {
    render(<TooltipDocsIsland />);
    expect(screen.getAllByRole("article")).toHaveLength(5);
    expect(screen.getByRole("table", { name: "Tooltip API" }))
      .toBeInTheDocument();
    expect(screen.getByText("鼠标移入展示多行文字气泡"))
      .toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "显示气泡" }))
      .toHaveAttribute("aria-checked", "true");
  });
});
