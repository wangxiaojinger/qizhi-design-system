import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatisticDocsIsland } from "./StatisticDocsIsland";
import { statisticApi } from "./statisticApi";
import { statisticDemos } from "./statisticDocs.registry";

describe("Statistic docs", () => {
  it("保留旧站 4 组 Demo 顺序和逐字说明", () => {
    expect(statisticDemos.map((demo) => demo.title)).toEqual([
      "基础用法",
      "前缀后缀/自定义样式",
      "时间格式",
      "加载中",
    ]);
    expect(statisticDemos.map((demo) => demo.description)).toEqual([
      "当需要突出某个或某组数字，或展示带描述的统计类数据时使用。",
      "添加前缀或后缀，并自定义数值显示的颜色和强调方式。",
      "将时间戳按指定格式展示为可读的日期和时间。",
      "通过 loading 控制是否显示加载中状态。",
    ]);
  });

  it("保留旧站实例数、数据、文案和初始状态", () => {
    render(<StatisticDocsIsland />);

    expect(document.querySelectorAll("#数值显示-基础用法 .qizhi-statistic"))
      .toHaveLength(2);
    expect(document.querySelectorAll(
      "#数值显示-前缀后缀-自定义样式 .qizhi-statistic",
    )).toHaveLength(3);
    expect(document.querySelectorAll("#数值显示-时间格式 .qizhi-statistic"))
      .toHaveLength(1);
    expect(document.querySelectorAll("#数值显示-加载中 .qizhi-statistic"))
      .toHaveLength(1);

    expect(screen.getByText("125,670")).toBeInTheDocument();
    expect(screen.getByText("40,509", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("192393")).toBeInTheDocument();
    expect(screen.getByText("934230")).toBeInTheDocument();
    expect(document.querySelector(
      "#数值显示-前缀后缀-自定义样式 "
      + ".qizhi-statistic:nth-child(3) .qizhi-statistic__value",
    )).toHaveTextContent("50.32%");
    expect(document.querySelectorAll(
      "#数值显示-前缀后缀-自定义样式 .ri-arrow-up-line",
    )).toHaveLength(2);
    expect(document.querySelectorAll(
      "#数值显示-前缀后缀-自定义样式 .ri-arrow-down-line",
    )).toHaveLength(1);
    expect(screen.getByText("2019/04/10 12:16:53")).toBeInTheDocument();

    const loadingDemo = document.getElementById("数值显示-加载中")!;
    const toggle = within(loadingDemo).getByRole("switch", {
      name: "切换数值加载状态",
    });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(within(loadingDemo).getByRole("status", {
      name: "数值加载中",
    })).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(within(loadingDemo).getByText("125,670")).toBeInTheDocument();
  });

  it("每个 Demo 从同一 TSX 读取预览、展示和复制源码", () => {
    statisticDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toContain("Demo.tsx");
      expect(demo.source).not.toContain("@arco-design");
      expect(Math.max(...demo.source.split("\n").map((line) => line.length)))
        .toBeLessThanOrEqual(80);
    });

    render(<StatisticDocsIsland />);
    expect(screen.getAllByRole("button", { name: "查看代码" }))
      .toHaveLength(4);
    expect(screen.getAllByRole("button", { name: "复制代码" }))
      .toHaveLength(4);
    expect(screen.queryByText("Demo.tsx")).not.toBeInTheDocument();
  });

  it("API 元数据只列出已审定的 Statistic v1 能力", () => {
    expect(statisticApi.map((item) => item.name)).toEqual([
      "value",
      "title",
      "prefix",
      "suffix",
      "extra",
      "precision",
      "format",
      "valueStyle",
      "loading",
      "className",
      "style",
      "ref",
    ]);
    render(<StatisticDocsIsland />);
    expect(screen.getByRole("table", { name: "Statistic API" }))
      .toBeInTheDocument();
  });
});
