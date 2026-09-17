import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Statistic } from "./Statistic";

describe("Statistic", () => {
  it("格式化数字的千分位和精度", () => {
    const { container } = render(
      <Statistic value={40509} precision={2} />,
    );

    expect(container.querySelector(".qizhi-statistic__value"))
      .toHaveTextContent("40,509.00");
    expect(container.querySelector(".qizhi-statistic__decimal"))
      .toHaveTextContent(".00");
  });

  it("渲染标题、前后缀、下方说明和数值样式", () => {
    const { container } = render(
      <Statistic
        title="用户增长率"
        value={50.32}
        prefix={<span data-testid="prefix">↑</span>}
        suffix="%"
        extra="评论"
        valueStyle={{ color: "rgb(255, 77, 79)" }}
      />,
    );

    expect(screen.getByText("用户增长率")).toBeInTheDocument();
    expect(screen.getByTestId("prefix")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
    expect(screen.getByText("评论")).toBeInTheDocument();
    expect(container.querySelector(".qizhi-statistic__value"))
      .toHaveStyle({ color: "rgb(255, 77, 79)" });
  });

  it("按本地时区渲染时间格式和 time 语义", () => {
    const { container } = render(
      <Statistic
        title="创建时间"
        value={new Date(2019, 3, 10, 12, 16, 53).getTime()}
        format="YYYY/MM/DD HH:mm:ss"
      />,
    );

    const time = container.querySelector("time");
    expect(time).toHaveTextContent("2019/04/10 12:16:53");
    expect(time).toHaveAttribute("datetime", "2019-04-10T12:16:53");
  });

  it("加载时隐藏数值并暴露状态提示", () => {
    const { container } = render(
      <Statistic title="下载" value={125670} loading />,
    );

    expect(screen.getByRole("status", { name: "数值加载中" }))
      .toHaveClass("qizhi-skeleton", "qizhi-statistic__skeleton");
    expect(container.querySelectorAll(".qizhi-skeleton__row"))
      .toHaveLength(1);
    expect(container.querySelector(".qizhi-statistic__value"))
      .not.toBeInTheDocument();
  });

  it("透传根元素属性和 ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Statistic
        ref={ref}
        value="125,670"
        className="custom-statistic"
        data-testid="statistic"
      />,
    );

    expect(screen.getByTestId("statistic")).toHaveClass(
      "qizhi-statistic",
      "custom-statistic",
    );
    expect(ref.current).toBe(screen.getByTestId("statistic"));
  });
});
