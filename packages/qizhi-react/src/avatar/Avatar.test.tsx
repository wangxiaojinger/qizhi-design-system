import { createRef } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CameraIcon, EditIcon } from "../icon";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("uses the approved defaults and forwards root attributes and ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} data-testid="avatar" aria-label="林猫猫">林</Avatar>);
    const avatar = screen.getByTestId("avatar");

    expect(avatar).toHaveClass("qizhi-avatar", "qizhi-avatar-size-default", "qizhi-avatar-shape-circle");
    expect(avatar).toHaveAttribute("aria-label", "林猫猫");
    expect(screen.getByText("林")).toHaveClass("qizhi-avatar__content");
    expect(ref.current).toBe(avatar);
  });

  it.each([
    ["mini", "qizhi-avatar-size-mini"],
    ["small", "qizhi-avatar-size-small"],
    ["default", "qizhi-avatar-size-default"],
    ["large", "qizhi-avatar-size-large"],
  ] as const)("renders the %s size", (size, className) => {
    render(<Avatar size={size}>{size}</Avatar>);
    expect(screen.getByText(size).parentElement).toHaveClass(className);
  });

  it("renders the approved square shape", () => {
    render(<Avatar shape="square">方</Avatar>);
    expect(screen.getByText("方").parentElement).toHaveClass("qizhi-avatar-shape-square");
  });

  it("shrinks overflowing text to the measured inner width and restores short text", () => {
    let resize: ResizeObserverCallback = () => undefined;
    const disconnect = vi.fn();
    class TestResizeObserver {
      constructor(callback: ResizeObserverCallback) { resize = callback; }
      observe() {}
      unobserve() {}
      disconnect() { disconnect(); }
    }
    vi.stubGlobal("ResizeObserver", TestResizeObserver);

    const { unmount } = render(<Avatar data-testid="avatar">QIZHI</Avatar>);
    const avatar = screen.getByTestId("avatar");
    const content = screen.getByText("QIZHI");
    Object.defineProperty(avatar, "clientWidth", { configurable: true, value: 40 });
    Object.defineProperty(content, "scrollWidth", { configurable: true, value: 64 });

    act(() => resize([], {} as ResizeObserver));
    expect(avatar).toHaveStyle({ "--qizhi-avatar-content-scale": "0.5" });

    Object.defineProperty(content, "scrollWidth", { configurable: true, value: 20 });
    act(() => resize([], {} as ResizeObserver));
    expect(avatar).toHaveStyle({ "--qizhi-avatar-content-scale": "1" });

    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("renders a shared mini Button only when trigger icon and callback are both present", async () => {
    const onTriggerClick = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <Avatar triggerIcon={<EditIcon />} triggerType="button" onTriggerClick={onTriggerClick}>A</Avatar>,
    );
    const trigger = screen.getByRole("button", { name: "操作头像" });

    expect(trigger).toHaveClass("qizhi-btn", "qizhi-btn-size-mini", "qizhi-btn-icon-only", "qizhi-avatar-trigger-button");
    await user.click(trigger);
    expect(onTriggerClick).toHaveBeenCalledTimes(1);

    rerender(<Avatar triggerIcon={<EditIcon />}>A</Avatar>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(<Avatar onTriggerClick={onTriggerClick}>A</Avatar>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("supports an accessible mask trigger and native keyboard activation", async () => {
    const onTriggerClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Avatar triggerIcon={<CameraIcon />} triggerType="mask" triggerAriaLabel="拍摄头像" onTriggerClick={onTriggerClick}>A</Avatar>,
    );
    const trigger = screen.getByRole("button", { name: "拍摄头像" });

    expect(trigger).toHaveClass("qizhi-avatar-trigger-mask");
    trigger.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onTriggerClick).toHaveBeenCalledTimes(2);
  });

  it("lets Avatar.Group override child size while preserving ordinary children and refs", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Avatar.Group ref={ref} size="small" className="成员组" aria-label="服务维护者">
        <Avatar size="large">A</Avatar>
        <span data-testid="plain">普通内容</span>
      </Avatar.Group>,
    );

    expect(screen.getByText("A").parentElement).toHaveClass("qizhi-avatar-size-small");
    expect(screen.getByTestId("plain")).toBeInTheDocument();
    expect(ref.current).toHaveClass("qizhi-avatar-group", "qizhi-avatar-group-size-small", "成员组");
    expect(ref.current).toHaveAttribute("aria-label", "服务维护者");
  });
});
