import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("将百分比限制在 0 到 100 并暴露 progressbar 语义", () => {
    const { rerender } = render(<Progress percent={130} aria-label="上传进度" />);
    expect(screen.getByRole("progressbar", { name: "上传进度" }))
      .toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByText("100%")).toBeInTheDocument();

    rerender(<Progress percent={-20} aria-label="上传进度" />);
    expect(screen.getByRole("progressbar", { name: "上传进度" }))
      .toHaveAttribute("aria-valuenow", "0");
  });

  it("支持环形、状态、自定义轨道和粗细", () => {
    render(
      <Progress
        percent={40}
        type="circle"
        size="mini"
        status="warning"
        trailColor="#eef3ff"
        strokeWidth={4}
        aria-label="环形进度"
      />,
    );
    const progress = screen.getByRole("progressbar", { name: "环形进度" });
    expect(progress).toHaveClass("qizhi-progress--circle", "qizhi-progress--mini");
    expect(progress).toHaveClass("qizhi-progress--warning");
    expect(progress).toHaveStyle({ "--qizhi-progress-trail": "#eef3ff" });
    expect(progress.querySelector("svg")).toBeInTheDocument();
  });

  it("按百分比激活步骤段", () => {
    render(<Progress percent={50} steps={5} aria-label="步骤进度" />);
    const progress = screen.getByRole("progressbar", { name: "步骤进度" });
    expect(progress.querySelectorAll(".qizhi-progress__step")).toHaveLength(5);
    expect(progress.querySelectorAll(".qizhi-progress__step--active"))
      .toHaveLength(3);
  });

  it("自定义颜色优先于状态色并支持渐变对象", () => {
    const { rerender } = render(
      <Progress percent={30} status="danger" color="#999" aria-label="颜色进度" />,
    );
    expect(screen.getByRole("progressbar", { name: "颜色进度" }))
      .toHaveStyle({ "--qizhi-progress-color": "#999" });

    rerender(
      <Progress
        percent={80}
        color={{ 0: "#3366ff", 100: "#00b42a" }}
        aria-label="颜色进度"
      />,
    );
    expect(screen.getByRole("progressbar", { name: "颜色进度" }))
      .toHaveStyle({
        "--qizhi-progress-fill":
          "linear-gradient(90deg, #3366ff 0%, #00b42a 100%)",
      });
  });

  it("在环形模式中将渐变对象转为 SVG 渐变描边", () => {
    render(
      <Progress
        percent={80}
        type="circle"
        color={{ 0: "#3366ff", 100: "#00b42a" }}
        aria-label="环形渐变进度"
      />,
    );
    const progress = screen.getByRole("progressbar", {
      name: "环形渐变进度",
    });
    expect(progress.querySelectorAll("linearGradient stop")).toHaveLength(2);
    expect(progress.querySelector(".qizhi-progress__circle-fill")
      ?.getAttribute("style"))
      .toContain("qizhi-progress-gradient-");
  });

  it("按线形和环形分别渲染状态图标", () => {
    const { rerender } = render(
      <Progress percent={30} status="danger" aria-label="线形错误" />,
    );
    expect(screen.getByRole("progressbar", { name: "线形错误" })
      .querySelector(".qizhi-progress__status-icon--circle-close-filled"))
      .toBeInTheDocument();

    rerender(
      <Progress
        percent={30}
        type="circle"
        status="danger"
        aria-label="环形错误"
      />,
    );
    expect(screen.getByRole("progressbar", { name: "环形错误" })
      .querySelector(".qizhi-progress__status-icon--close"))
      .toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "环形错误" })
      .querySelector(".qizhi-progress__status-icon--circle-close-filled"))
      .not.toBeInTheDocument();
  });

  it("支持紧凑步骤的段宽和独立描边粗细", () => {
    render(
      <Progress
        percent={50}
        steps={5}
        stepWidth={16}
        strokeWidth={8}
        aria-label="紧凑步骤"
      />,
    );
    const progress = screen.getByRole("progressbar", { name: "紧凑步骤" });
    expect(progress).toHaveClass("qizhi-progress--fixed-steps");
    expect(progress).toHaveStyle({
      "--qizhi-progress-step-width": "16px",
      "--qizhi-progress-stroke": "8px",
    });
  });

  it("将线形的 mini 输入安全降级为 default", () => {
    render(
      <Progress
        percent={30}
        type="line"
        size={"mini" as never}
        aria-label="非法 mini 线形"
      />,
    );
    const progress = screen.getByRole("progressbar", {
      name: "非法 mini 线形",
    });
    expect(progress).toHaveClass("qizhi-progress--default");
    expect(progress).not.toHaveClass("qizhi-progress--mini");
  });
});
