import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CheckCircleIcon, StarIcon } from "../icon";
import { Tag } from "./Tag";

describe("Tag", () => {
  it("renders the QIZHI default structure and forwards its ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Tag ref={ref}>默认标签</Tag>);

    expect(screen.getByText("默认标签")).toHaveClass("qizhi-tag-content");
    expect(ref.current).toHaveClass("qizhi-tag", "qizhi-tag-size-default");
  });

  it.each([
    ["small", "qizhi-tag-size-small"],
    ["default", "qizhi-tag-size-default"],
    ["medium", "qizhi-tag-size-medium"],
    ["large", "qizhi-tag-size-large"],
  ] as const)("renders the %s size", (size, className) => {
    render(<Tag size={size}>{size}</Tag>);
    expect(screen.getByText(size).parentElement).toHaveClass(className);
  });

  it("supports preset and custom colors without changing global tokens", () => {
    const { rerender } = render(<Tag color="red">红色</Tag>);
    expect(screen.getByText("红色").parentElement).toHaveClass("qizhi-tag-red");

    rerender(<Tag color="#123456">自定义</Tag>);
    expect(screen.getByText("自定义").parentElement).toHaveStyle({ "--qizhi-tag-custom-color": "#123456" });
  });

  it("renders bordered and QIZHI icon content", () => {
    const { rerender } = render(<Tag bordered icon={<CheckCircleIcon />}>完成</Tag>);
    expect(screen.getByText("完成").parentElement).toHaveClass("qizhi-tag-bordered");
    expect(screen.getByText("完成").previousElementSibling).toHaveClass("qizhi-tag-icon");

    rerender(<Tag icon={<StarIcon />}>收藏</Tag>);
    expect(screen.getByText("收藏").previousElementSibling?.querySelector("svg")).toBeInTheDocument();
  });

  it("closes an uncontrolled closable tag and reports the event", () => {
    const onClose = vi.fn();
    render(<Tag closable onClose={onClose}>可关闭</Tag>);

    fireEvent.click(screen.getByRole("button", { name: "关闭标签" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("可关闭")).not.toBeInTheDocument();
  });

  it("keeps controlled visibility until its owner changes visible", () => {
    const onClose = vi.fn();
    const { rerender } = render(<Tag closable visible onClose={onClose}>受控标签</Tag>);
    fireEvent.click(screen.getByRole("button", { name: "关闭标签" }));
    expect(screen.getByText("受控标签")).toBeInTheDocument();
    rerender(<Tag closable visible={false} onClose={onClose}>受控标签</Tag>);
    expect(screen.queryByText("受控标签")).not.toBeInTheDocument();
  });

  it("toggles an uncontrolled checkable tag by click, Enter and Space", () => {
    const onChange = vi.fn();
    render(<Tag checkable onChange={onChange}>可选</Tag>);
    const tag = screen.getByRole("checkbox", { name: "可选" });

    expect(tag).toHaveAttribute("aria-checked", "false");
    fireEvent.click(tag);
    expect(tag).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(tag, { key: "Enter" });
    expect(tag).toHaveAttribute("aria-checked", "false");
    fireEvent.keyDown(tag, { key: " " });
    expect(tag).toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("reports a controlled checked change without mutating aria-checked", () => {
    const onChange = vi.fn();
    render(<Tag checkable checked onChange={onChange}>受控选中</Tag>);
    const tag = screen.getByRole("checkbox", { name: "受控选中" });
    fireEvent.click(tag);
    expect(onChange).toHaveBeenCalledWith(false, expect.anything());
    expect(tag).toHaveAttribute("aria-checked", "true");
  });
});
