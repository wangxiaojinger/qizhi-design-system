import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Message, useMessage } from "./Message";

function HookHarness() {
  const [message, holder] = useMessage();
  return <div data-testid="holder">{holder}<button onClick={() => message.success("Current user: PJY")}>Success</button></div>;
}

describe("Message", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Message.config({ duration: 3000, maxCount: undefined, getContainer: () => document.body });
    Message.clear();
  });

  afterEach(() => {
    act(() => {
      Message.clear();
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  test("shows the requested type without a close button by default and returns a closer", () => {
    const close = Message.info("This is an info message!");
    expect(screen.getByRole("status")).toHaveTextContent("This is an info message!");
    expect(screen.queryByRole("button", { name: "关闭全局提示" })).not.toBeInTheDocument();
    act(() => close());
    act(() => vi.advanceTimersByTime(180));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("updates one message by id and automatically closes with the latest duration", () => {
    Message.loading({ id: "need-update", content: "Will update after 2 seconds...", duration: 0 });
    expect(screen.getAllByRole("status")).toHaveLength(1);
    Message.success({ id: "need-update", content: "Update success!", duration: 3000 });
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("Update success!");
    act(() => vi.advanceTimersByTime(3180));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("supports closable error alerts, maxCount, clear, and onClose", () => {
    const onClose = vi.fn();
    act(() => {
      Message.config({ maxCount: 2, duration: 0 });
      Message.info("one");
      Message.success("two");
      Message.error({ content: "three", closable: true, onClose });
    });
    expect(screen.queryByText("one")).not.toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "关闭全局提示" }));
    act(() => vi.advanceTimersByTime(180));
    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => {
      Message.clear();
      vi.advanceTimersByTime(180);
    });
    expect(screen.queryByText("two")).not.toBeInTheDocument();
  });

  test("useMessage mounts messages inside its context holder", () => {
    render(<HookHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Success" }));
    const status = screen.getByText("Current user: PJY").closest<HTMLElement>("[role=status]")!;
    expect(screen.getByTestId("holder")).toContainElement(status);
    expect(status).toHaveTextContent("Current user: PJY");
  });
});
