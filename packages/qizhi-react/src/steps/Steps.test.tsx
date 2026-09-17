import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Steps } from "./Steps";

const items = [
  { title: "成功", description: "这是一段描述" },
  { title: "进行中", description: "这是一段描述" },
  { title: "待办", description: "这是一段描述" },
] as const;

describe("Steps", () => {
  it("derives finish, current, and wait states from a one-based current", () => {
    render(<Steps items={items} current={2} aria-label="任务步骤" />);
    const list = screen.getByRole("list", { name: "任务步骤" });
    const steps = within(list).getAllByRole("listitem");

    expect(steps[0]).toHaveClass("qizhi-steps__item--finish");
    expect(steps[0].querySelector("svg")).toBeInTheDocument();
    expect(steps[1]).toHaveClass("qizhi-steps__item--process");
    expect(steps[1]).toHaveAttribute("aria-current", "step");
    expect(steps[1].querySelector(".qizhi-steps__icon"))
      .toHaveTextContent("2");
    expect(steps[2]).toHaveClass("qizhi-steps__item--wait");
    expect(within(list).getAllByText("这是一段描述")).toHaveLength(3);
  });

  it("renders the current error and the preceding error connector", () => {
    render(
      <Steps
        items={items}
        current={2}
        status="error"
        aria-label="错误步骤"
      />,
    );
    const steps = within(
      screen.getByRole("list", { name: "错误步骤" }),
    ).getAllByRole("listitem");

    expect(steps[0]).toHaveClass("qizhi-steps__item--next-error");
    expect(steps[1]).toHaveClass("qizhi-steps__item--error");
    expect(steps[1].querySelector("svg")).toBeInTheDocument();
  });

  it("supports small size, native attributes, classes, and refs", () => {
    const ref = createRef<HTMLOListElement>();
    render(
      <Steps
        ref={ref}
        items={items}
        size="small"
        className="custom-steps"
        data-scope="compact"
        aria-label="小型步骤"
      />,
    );
    const list = screen.getByRole("list", { name: "小型步骤" });
    expect(ref.current).toBe(list);
    expect(list).toHaveClass(
      "qizhi-steps",
      "qizhi-steps--small",
      "custom-steps",
    );
    expect(list).toHaveAttribute("data-scope", "compact");
  });
});
