import { fireEvent, render, screen } from "@testing-library/react";
import {
  MetricCard,
  MetricItem,
  ObjectMetrics,
  ResourceUsageCard,
} from "./BusinessMetrics";

describe("Business metrics", () => {
  it("supports selected, disabled, and interactive metric cards", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <MetricCard
        title="交互式建模"
        total={23}
        label="运行中"
        value={12}
        selected
        onClick={onClick}
      />,
    );
    const card = screen.getByRole("button", { name: /交互式建模/ });
    expect(card).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <MetricCard
        title="模型评测"
        total={0}
        label="进行中"
        value={0}
        disabled
        onClick={onClick}
      />,
    );
    expect(screen.getByRole("button", { name: /模型评测/ }))
      .toBeDisabled();
  });

  it("uses the same neutral React info trigger in cards and metric items", () => {
    const { container } = render(
      <>
        <MetricCard
          title="专属实例"
          total={1}
          label="服务中"
          value={1}
          info="统计自定义服务，专属实例数据"
          onClick={() => undefined}
        />
        <MetricItem
          label="异常节点数"
          value={20}
          info="包含离线和故障节点"
        />
      </>,
    );
    expect(container.querySelectorAll(".qizhi-metric-info"))
      .toHaveLength(2);
    expect(container.querySelector("button button")).toBeNull();
  });

  it("exposes resource usage meter semantics", () => {
    render(
      <ResourceUsageCard
        title="GPU（卡数）"
        value="189 / 224"
        percent={84.38}
      />,
    );
    expect(screen.getByRole("meter", { name: "GPU 分配率" }))
      .toHaveAttribute("aria-valuenow", "84.38");
  });

  it("composes metric items into object metrics", () => {
    render(
      <ObjectMetrics
        title="七宝机房"
        summaryLabel="剩余可分配节点数"
        summaryValue={80}
      >
        <MetricItem label="异常节点数" value={20} info="包含离线和故障节点" />
      </ObjectMetrics>,
    );
    expect(screen.getByRole("heading", { name: "七宝机房" }))
      .toBeInTheDocument();
    expect(screen.getByLabelText("查看异常节点数说明"))
      .toBeInTheDocument();
  });
});
