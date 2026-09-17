import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TimelineDocsIsland } from "./TimelineDocsIsland";
import { timelineApi, timelineItemApi } from "./timelineApi";
import { timelineDemos } from "./timelineDocs.registry";

describe("Timeline docs", () => {
  it("keeps the confirmed nine legacy demos and descriptions in order", () => {
    expect(timelineDemos.map(({ title, description }) => ({ title, description }))).toEqual([
      { title: "基础用法", description: "基本用法" },
      { title: "自定义节点内容", description: "自定义节点内容" },
      {
        title: "自定义节点",
        description:
          "可以通过属性 dotColor, dotType 设置节点的颜色以及节点类型。同时可通过 dot 直接传入 ReactNode 自定义节点样式。优先级高于 dotColor 和 dotType",
      },
      { title: "自定义轴线样式", description: "自定义轴线的示例。" },
      {
        title: "幽灵节点",
        description:
          "当任务状态正在发生，还在记录过程中，可用幽灵节点来表示当前的时间节点，通过 pendingDot 定制其轴点。",
      },
      {
        title: "时间轴展示类型",
        description:
          "设置 mode=alternate 时将会交替展示内容。同时可以通过设置 TimelineItem 的 position 属性控制时间轴节点的位置。",
      },
      { title: "纵向时间轴", description: "竖直方向的时间轴。" },
      {
        title: "横向时间轴",
        description: "可以通过 direction 设置展示横向时间轴",
      },
      {
        title: "标签文本位置",
        description: "通过 labelPosition 可以设置标签文本的位置。",
      },
    ]);
  });

  it("uses the rendered TSX as the only display and copy source", () => {
    timelineDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toContain("Demo.tsx");
      expect(demo.source).not.toContain("@arco-design");
    });
  });

  it("documents only the confirmed Timeline and TimelineItem APIs", () => {
    expect(timelineApi.map((item) => item.name)).toEqual([
      "children",
      "direction",
      "mode",
      "reverse",
      "labelPosition",
      "pending",
      "pendingDot",
      "className",
      "style",
    ]);
    expect(timelineItemApi.map((item) => item.name)).toEqual([
      "children",
      "label",
      "description",
      "dot",
      "dotColor",
      "dotType",
      "lineType",
      "position",
      "className",
      "style",
    ]);
  });

  it("renders every legacy demo and both API tables", () => {
    render(<TimelineDocsIsland />);
    expect(screen.getAllByRole("article")).toHaveLength(9);
    expect(screen.getByRole("table", { name: "Timeline API" })).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "TimelineItem API" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "倒序展示" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(screen.getByText("倒序")).toBeInTheDocument();
    expect(screen.getAllByText("第一个里程碑").length).toBeGreaterThan(1);
    expect(screen.getByText("记录中...")).toBeInTheDocument();
    expect(screen.getByText("开始")).toBeInTheDocument();
    expect(screen.getByText("处理中")).toBeInTheDocument();
    expect(screen.getByText("完成")).toBeInTheDocument();
    expect(screen.queryByText("Reverse")).not.toBeInTheDocument();
    expect(screen.queryByText("The first milestone")).not.toBeInTheDocument();
    expect(screen.queryByText("Recording...")).not.toBeInTheDocument();
  });
});
