import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  BillingBudgetCard,
  ConfirmationSummary,
  FinancialModelCard,
  SkillServiceCard,
  MarketplaceModelCard,
  ModelCard,
  ProjectCard,
  ResourceSpecificationCard,
  TaskCard,
} from "./BusinessObjects";

describe("Business objects", () => {
  it("renders a reusable task card", () => {
    render(
      <TaskCard
        name="maomao创建的交互式建模任务"
        space="具身智能"
        resource="2 × NVIDIA A100（32GB）"
        duration="19小时2分钟45秒"
        status="运行中"
      />,
    );
    expect(screen.getByText("maomao创建的交互式建模任务"))
      .toBeInTheDocument();
  });

  it("supports model actions and financial hover content", () => {
    const onUse = vi.fn();
    render(
      <ModelCard
        variant="financial"
        name="IPO Vetting Agent"
        description="自动化 IPO 招股书审查"
        tags={["风险评分"]}
        primaryAction={{ label: "去使用", onClick: onUse }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "去使用" }));
    expect(onUse).toHaveBeenCalledTimes(1);
  });

  it("renders every marketplace model action in the supplied order", () => {
    render(
      <ModelCard
        name="DeepSeek-V3"
        description="模型描述"
        actions={[
          { label: "查看详情" },
          { label: "快速体验" },
          { label: "在线推理" },
        ]}
      />,
    );

    expect(screen.getAllByRole("button").map((button) => button.textContent))
      .toEqual(["查看详情", "快速体验", "在线推理"]);
  });

  it("renders Skill service summary and project interactions", () => {
    const onOpen = vi.fn();
    const { container } = render(
      <>
        <SkillServiceCard
          name="Skill股票分析"
          version="v1"
          updatedAt="2026-03-28"
          project="所属项目xxxx"
          summary="这是一个股票分析 Skill 服务"
        />
        <ProjectCard
          name="kevin-003"
          englishName="pvc-test"
          status="立项审批中"
          tone="primary"
          rows={[["项目描述", "XXXX"]]}
          members={["K"]}
          onOpen={onOpen}
        />
      </>,
    );
    fireEvent.click(screen.getByRole("link", { name: /进入项目/ }));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/这是一个股票分析 Skill 服务/))
      .toBeInTheDocument();
    const skillIcon = container.querySelector(
      ".qizhi-skill-service-card__icon > svg",
    );
    expect(skillIcon).toBeInTheDocument();
    expect(skillIcon).toHaveAttribute("viewBox", "0 0 41 39");
    expect(skillIcon?.parentElement).toHaveClass(
      "qizhi-skill-service-card__icon",
    );
  });

  it("previews the first three Markdown lines and reveals the full file on hover", async () => {
    const user = userEvent.setup();
    const markdown = "第一行\n第二行\n第三行\n第四行";
    const { container } = render(
      <SkillServiceCard
        name="Markdown Skill"
        version="V1"
        updatedAt="2026-09-09"
        project="基础-启智"
        summary={markdown}
      />,
    );

    const preview = container.querySelector(".qizhi-skill-service-card__summary");
    expect(Array.from(preview?.querySelectorAll("p > span") ?? []).map((line) => line.textContent))
      .toEqual(["第一行", "第二行", "第三行…"]);
    expect(preview).not.toHaveTextContent("第四行");

    await user.hover(preview!);
    expect((await screen.findByRole("tooltip")).querySelector("pre")?.textContent)
      .toBe(markdown);
  });

  it("reveals the full Skill summary on keyboard focus", async () => {
    const markdown = "第一行\n第二行\n第三行\n第四行";
    const { container } = render(
      <SkillServiceCard
        name="Markdown Skill"
        version="V1"
        updatedAt="2026-09-09"
        project="基础-启智"
        summary={markdown}
      />,
    );

    const preview = container.querySelector<HTMLElement>(".qizhi-skill-service-card__summary")!;
    fireEvent.focus(preview);
    expect((await screen.findByRole("tooltip")).querySelector("pre")?.textContent)
      .toBe(markdown);
  });

  it("renders all confirmation summary variants", () => {
    render(
      <>
        <ConfirmationSummary
          title="资源规格确认"
          rows={[["资源型号", "NVIDIA A100（32GB）"]]}
        />
        <ConfirmationSummary
          title="费用与预算确认"
          price="10.00"
          priceUnit="点券/小时"
          budget="10,000 点券"
        />
      </>,
    );
    expect(screen.getByText("NVIDIA A100（32GB）"))
      .toBeInTheDocument();
    expect(screen.getByText("10.00")).toBeInTheDocument();
  });

  it("keeps marketplace model actions fixed and routes each callback", () => {
    const onViewDetails = vi.fn();
    const onQuickExperience = vi.fn();
    const onOnlineInference = vi.fn();
    render(
      <MarketplaceModelCard
        name="DeepSeek-V3"
        description="模型描述"
        tags={["自然语言处理", "文本生成"]}
        onViewDetails={onViewDetails}
        onQuickExperience={onQuickExperience}
        onOnlineInference={onOnlineInference}
      />,
    );

    const actions = screen.getAllByRole("button");
    expect(actions.map((button) => button.textContent?.trim())).toEqual([
      "查看详情",
      "快速体验",
      "在线推理",
    ]);
    actions.forEach((button) => fireEvent.click(button));
    expect(onViewDetails).toHaveBeenCalledTimes(1);
    expect(onQuickExperience).toHaveBeenCalledTimes(1);
    expect(onOnlineInference).toHaveBeenCalledTimes(1);
  });

  it("keeps financial model actions fixed and routes each callback", () => {
    const onViewDetails = vi.fn();
    const onUse = vi.fn();
    render(
      <FinancialModelCard
        name="IPO Vetting Agent"
        description="自动化 IPO 招股书审查"
        tags={["风险评分"]}
        onViewDetails={onViewDetails}
        onUse={onUse}
      />,
    );

    const actions = screen.getAllByRole("button");
    expect(actions.map((button) => button.textContent)).toEqual([
      "查看详情",
      "去使用",
    ]);
    actions.forEach((button) => fireEvent.click(button));
    expect(onViewDetails).toHaveBeenCalledTimes(1);
    expect(onUse).toHaveBeenCalledTimes(1);
  });

  it("keeps resource specification labels and metric order fixed", () => {
    render(
      <ResourceSpecificationCard
        resourceModel="NVIDIA A100（32GB）"
        cpu={{ value: 24, total: 64 }}
        memory={{ value: "1957.00", total: "1965.00" }}
        gpu={{ value: 16, total: 32 }}
      />,
    );

    expect(screen.queryByRole("heading", { name: "资源规格确认" }))
      .not.toBeInTheDocument();
    expect(screen.getAllByText(/CPU（核数）|内存（GB）|GPU（卡数）/)
      .map((node) => node.textContent)).toEqual([
      "CPU（核数）",
      "内存（GB）",
      "GPU（卡数）",
    ]);
  });

  it("keeps billing rules and budget in one business card", () => {
    render(
      <BillingBudgetCard
        model="Moonshot-v1-128k"
        instanceCount={1}
        settlementMethod="后付费（按小时）"
        settlementCycle="小时"
        price="10.00"
        priceUnit="点券/小时"
        formula="*计费公式 = 实例数 × 资源单价"
        budget="10,000 点券"
      />,
    );

    const card = screen.getByRole("article", {
      name: "计费规则与费用预算确认",
    });
    expect(card).toHaveTextContent("计费规则确认");
    expect(card).toHaveTextContent("费用与预算确认");
    expect(card).toHaveTextContent("Moonshot-v1-128k");
    expect(card).toHaveTextContent("10,000 点券");
  });
});
