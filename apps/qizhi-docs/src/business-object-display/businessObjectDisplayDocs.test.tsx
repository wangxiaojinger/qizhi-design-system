import { fireEvent, render, screen } from "@testing-library/react";
import { BusinessObjectDisplayDocsIsland } from
  "./BusinessObjectDisplayDocsIsland";
import { businessObjectDemos } from "./businessObjectDisplay.registry";

describe("Business object display docs", () => {
  it("renders the confirmed business cards as independent demos", () => {
    render(<BusinessObjectDisplayDocsIsland />);
    expect(businessObjectDemos.map((demo) => demo.title)).toEqual([
      "任务卡",
      "模型卡片",
      "金融启智模型卡片",
      "Skill 服务卡",
      "项目卡",
      "资源规格确认",
      "计费规则费用预算卡片",
    ]);
    expect(screen.getByText("DeepSeek-V3DeepSeek V1"))
      .toBeInTheDocument();
    expect(screen.getByText("IPO Vetting Agent")).toBeInTheDocument();
    expect(screen.getByText("Skill股票分析")).toBeInTheDocument();
    expect(screen.getByText("NVIDIA A100（32GB）"))
      .toBeInTheDocument();
    expect(screen.queryByText("AI 资产与能力")).not.toBeInTheDocument();
    expect(screen.queryByText("资源对象卡")).not.toBeInTheDocument();
    expect(screen.queryByText(/集中展示可复用的模型资产/))
      .not.toBeInTheDocument();
  });

  it("preserves all four project groups and feedback paths", async () => {
    render(<BusinessObjectDisplayDocsIsland />);
    expect(screen.getAllByText("kevin-003")).toHaveLength(2);
    fireEvent.click(screen.getByRole("radio", { name: "资源风险" }));
    const budgetRisk = screen.getByText(/可用预算不足 15%/)
      .closest(".qizhi-alert");
    expect(budgetRisk).toHaveClass(
      "qizhi-alert--warning",
      "qizhi-alert--small",
      "qizhi-alert--inline",
    );
    expect(screen.getByText(/作业预算已耗尽/)).toBeInTheDocument();
    expect(screen.getByText(/空间资源即将到期/)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("link", {
      name: /进入项目/,
    })[0]);
    expect(await screen.findByText(/已进入项目“kevin/))
      .toBeInTheDocument();
  });

  it("renders the complete API section", () => {
    render(<BusinessObjectDisplayDocsIsland />);
    [
      "TaskCard API",
      "MarketplaceModelCard API",
      "FinancialModelCard API",
      "SkillServiceCard API",
      "ProjectCard API",
      "ResourceSpecificationCard API",
      "BillingBudgetCard API",
    ].forEach((name) => {
      expect(screen.getByRole("table", { name })).toBeInTheDocument();
    });
  });

  it("keeps Demo source public, reusable, and same-source", () => {
    businessObjectDemos.forEach(({ source }) => {
      expect(source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(source).not.toMatch(/<(button|input|select|textarea)\b/);
      expect(source).not.toContain("<svg");
      expect(source).not.toContain("style={{");
      expect(source).not.toMatch(/\.qizhi-[\w-]+__/);
      expect(Math.max(...source.split("\n").map((line) => line.length)))
        .toBeLessThanOrEqual(80);
    });
  });
});
