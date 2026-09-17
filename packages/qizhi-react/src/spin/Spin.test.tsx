import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Spin } from "./Spin";

describe("Spin", () => {
  it("renders the approved standalone default with public loading semantics", () => {
    render(<Spin data-testid="spin" />);

    const spin = screen.getByRole("status", { name: "正在加载" });
    expect(spin).toBe(screen.getByTestId("spin"));
    expect(spin).toHaveClass("qizhi-spin", "qizhi-spin--size-20", "is-loading");
    expect(spin.querySelector('[data-icon="icon-加载中"]')).toBeInTheDocument();
  });

  it("uses the approved numeric sizes and applies them to custom indicators", () => {
    const { rerender } = render(<Spin size={30} icon={<span data-testid="custom" />} />);
    expect(screen.getByRole("status")).toHaveClass("qizhi-spin--size-30");
    expect(screen.getByTestId("custom").parentElement).toHaveClass(
      "qizhi-spin__indicator",
    );

    rerender(<Spin size={40} />);
    expect(screen.getByRole("status")).toHaveClass("qizhi-spin--size-40");
  });

  it("blocks child interaction only while the container is loading", () => {
    const { rerender } = render(
      <Spin loading aria-label="数据同步中">
        <button type="button">查看详情</button>
      </Spin>,
    );

    const overlay = screen.getByRole("status", { name: "数据同步中" });
    const root = overlay.parentElement!;
    const children = root.querySelector(".qizhi-spin__children")!;
    expect(root).toHaveClass("qizhi-spin--container", "is-loading");
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(children).toHaveAttribute("inert");
    expect(overlay).toHaveClass("qizhi-spin__overlay");

    rerender(
      <Spin loading={false} aria-label="数据同步中">
        <button type="button">查看详情</button>
      </Spin>,
    );
    expect(root).not.toHaveClass("is-loading");
    expect(root).toHaveAttribute("aria-busy", "false");
    expect(children).not.toHaveAttribute("inert");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders tip, block layout, native attributes and a forwarded ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Spin ref={ref} block tip="这可能需要一段时间……" title="延迟加载">
        <article>内容</article>
      </Spin>,
    );

    expect(ref.current).toHaveClass("qizhi-spin--block");
    expect(ref.current).toHaveAttribute("title", "延迟加载");
    expect(screen.getByText("这可能需要一段时间……"))
      .toHaveClass("qizhi-spin__tip");
  });
});
