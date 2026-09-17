import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline, TimelineItem } from "./Timeline";

describe("Timeline", () => {
  it("renders the default list contract and marks the final item", () => {
    render(
      <Timeline aria-label="项目进度">
        <TimelineItem label="2024-01-01">开始</TimelineItem>
        <TimelineItem label="2024-01-02">完成</TimelineItem>
      </Timeline>,
    );

    const timeline = screen.getByRole("list", { name: "项目进度" });
    expect(timeline).toHaveClass(
      "qizhi-timeline",
      "qizhi-timeline-direction-vertical",
      "qizhi-timeline-mode-left",
      "qizhi-timeline-label-same",
    );
    expect(screen.getAllByRole("listitem")[1]).toHaveClass(
      "qizhi-timeline-item-last",
    );
  });

  it("reverses item order without mutating the supplied children", () => {
    const items = [
      <TimelineItem key="first">第一项</TimelineItem>,
      <TimelineItem key="second">第二项</TimelineItem>,
      <TimelineItem key="third">第三项</TimelineItem>,
    ];
    const { rerender } = render(<Timeline reverse>{items}</Timeline>);
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "第三项",
      "第二项",
      "第一项",
    ]);

    rerender(<Timeline>{items}</Timeline>);
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "第一项",
      "第二项",
      "第三项",
    ]);
  });

  it("places a relative label before content and lets a custom dot win", () => {
    render(
      <Timeline labelPosition="relative">
        <TimelineItem
          label="2024-01-01"
          dot={<span aria-label="自定义节点">自定义</span>}
          dotColor="danger"
          dotType="solid"
        >
          里程碑
        </TimelineItem>
      </Timeline>,
    );

    const wrapper = screen.getByRole("listitem").querySelector(
      ".qizhi-timeline-item-content-wrapper",
    );
    expect(wrapper?.children[0]).toHaveClass("qizhi-timeline-item-label");
    expect(screen.getByLabelText("自定义节点")).toBeInTheDocument();
    expect(
      screen.getByRole("listitem").querySelector(".qizhi-timeline-item-dot-solid"),
    ).not.toBeInTheDocument();
  });

  it("appends a pending item with a custom pending dot", () => {
    render(
      <Timeline pending="Recording..." pendingDot={<span aria-label="记录中" />}>
        <TimelineItem>开始</TimelineItem>
      </Timeline>,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Recording...")).toBeInTheDocument();
    expect(screen.getByLabelText("记录中")).toBeInTheDocument();
  });

  it("marks the final item when items are grouped in a Fragment", () => {
    render(
      <Timeline>
        <>
          <TimelineItem>第一项</TimelineItem>
          <TimelineItem>第二项</TimelineItem>
        </>
      </Timeline>,
    );

    expect(screen.getAllByRole("listitem")[0]).not.toHaveClass(
      "qizhi-timeline-item-last",
    );
    expect(screen.getAllByRole("listitem")[1]).toHaveClass(
      "qizhi-timeline-item-last",
    );
  });
});
