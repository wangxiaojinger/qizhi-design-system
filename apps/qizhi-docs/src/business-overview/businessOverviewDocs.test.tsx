import { fireEvent, render, screen } from "@testing-library/react";
import { BusinessOverviewDocsIsland } from "./BusinessOverviewDocsIsland";
import { businessOverviewDemos } from "./businessOverviewDocs.registry";
import {
  metricCardApi,
  metricItemApi,
  objectMetricsApi,
  resourceUsageCardApi,
} from "./businessOverviewApi";

describe("Business overview docs", () => {
  it("preserves all five legacy demos, copy, data, and order", () => {
    render(<BusinessOverviewDocsIsland />);
    expect(screen.getByRole("heading", { name: "概览与指标" }))
      .toBeInTheDocument();
    expect(businessOverviewDemos.map((demo) => demo.title)).toEqual([
      "指标卡",
      "资源用量卡",
      "指标项",
      "对象指标组",
      "组合应用",
    ]);
    expect(screen.getByText("189 / 224")).toBeInTheDocument();
    expect(screen.getByText("1,355 / 不限制")).toBeInTheDocument();
    expect(screen.getByText("七宝机房")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /模型评测/ }))
      .toBeDisabled();
  });

  it("runs type selection and expansion through the public components", () => {
    render(<BusinessOverviewDocsIsland />);
    fireEvent.click(screen.getByRole("button", { name: /分布式训练/ }));
    expect(screen.getByRole("button", { name: /分布式训练/ }))
      .toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("distributed-train-a100"))
      .toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "查看全部" }));
    expect(screen.getByRole("button", { name: "收起" }))
      .toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("tensor-parallel-job"))
      .toBeInTheDocument();
  });

  it("keeps every demo source reusable and synchronized", () => {
    businessOverviewDemos.forEach(({ source }) => {
      expect(source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(source).not.toMatch(/<(button|input|select|textarea)\b/);
      expect(source).not.toContain("<svg");
      expect(source).not.toContain("style={{");
      expect(source).not.toMatch(/\.qizhi-[\w-]+__/);
      expect(Math.max(...source.split("\n").map((line) => line.length)))
        .toBeLessThanOrEqual(80);
    });
  });

  it("documents every public business metrics component API", () => {
    render(<BusinessOverviewDocsIsland />);
    expect(document.getElementById("business-overview-API"))
      .toBeInTheDocument();
    [
      "MetricCard API",
      "ResourceUsageCard API",
      "MetricItem API",
      "ObjectMetrics API",
      "TaskOverview API",
    ].forEach((name) => {
      expect(screen.getByRole("table", { name })).toBeInTheDocument();
    });
    expect(metricCardApi.map((item) => item.name)).toEqual([
      "title", "info", "total", "label", "value", "unit", "selected",
      "disabled", "onClick", "className",
    ]);
    expect(resourceUsageCardApi.map((item) => item.name)).toEqual([
      "title", "value", "percent", "className",
    ]);
    expect(metricItemApi.map((item) => item.name)).toEqual([
      "label", "value", "info", "className",
    ]);
    expect(objectMetricsApi.map((item) => item.name)).toEqual([
      "title", "summaryLabel", "summaryValue", "children", "className",
    ]);
    expect(businessOverviewDemos.at(-1)?.source)
      .toContain("<TaskOverview");
  });
});
