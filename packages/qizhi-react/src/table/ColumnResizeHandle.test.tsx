import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ColumnResizeHandle } from "./ColumnResizeHandle";
import type { ColumnResizeHandleProps } from "./ColumnResizeHandle";

const createProps = () => ({
  label: "调整名称列宽度",
  width: 120,
  minWidth: 80,
  maxWidth: 200,
  gestureKey: "name",
  onPreview: vi.fn(),
  onCommit: vi.fn(),
  onCancel: vi.fn(),
});

const renderHandle = (overrides: Partial<Omit<ColumnResizeHandleProps, "onPreview" | "onCommit" | "onCancel">> = {}) => {
  const props = { ...createProps(), ...overrides };
  const result = render(<ColumnResizeHandle {...props} />);
  return { ...result, props, handle: screen.getByRole("separator", { name: props.label }) };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ColumnResizeHandle", () => {
  it("unsubscribes lostpointercapture from the actual element after committing", () => {
    const { handle } = renderHandle();
    const added = vi.spyOn(handle, "addEventListener");
    const removed = vi.spyOn(handle, "removeEventListener");
    fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 100 });
    const listener = added.mock.calls.find(([name]) => name === "lostpointercapture")?.[1];
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 120 });
    expect(removed).toHaveBeenCalledWith("lostpointercapture", listener);
  });
  it("allows an unbounded maximum without emitting Infinity through keyboard or ARIA", () => {
    const { handle, props } = renderHandle({ maxWidth: Infinity });
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(props.onCommit).toHaveBeenCalledWith(128);
    expect(handle).not.toHaveAttribute("aria-valuemax");
    props.onCommit.mockClear();
    fireEvent.keyDown(handle, { key: "End" });
    expect(props.onCommit).not.toHaveBeenCalled();
  });
  it("exposes an accessible vertical separator with finite range values", () => {
    const { handle } = renderHandle();

    expect(handle).toHaveClass("qizhi-table__resize-handle");
    expect(handle).toHaveAttribute("aria-orientation", "vertical");
    expect(handle).toHaveAttribute("aria-valuenow", "120");
    expect(handle).toHaveAttribute("aria-valuemin", "80");
    expect(handle).toHaveAttribute("aria-valuemax", "200");
    expect(handle).toHaveAttribute("tabindex", "0");
  });

  it("starts only on the primary pointer, previews the clamped width, and commits once on window release", () => {
    const { handle, props } = renderHandle();
    const hostPointerDown = vi.fn();
    document.addEventListener("pointerdown", hostPointerDown);
    try {
      fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 3 });
      fireEvent.pointerMove(window, { clientX: 260, pointerId: 3 });
      fireEvent.pointerUp(window, { clientX: 260, pointerId: 3 });

      expect(hostPointerDown).not.toHaveBeenCalled();
      expect(props.onPreview).toHaveBeenNthCalledWith(1, 200);
      expect(props.onPreview).toHaveBeenLastCalledWith(null);
      expect(props.onCommit).toHaveBeenCalledTimes(1);
      expect(props.onCommit).toHaveBeenCalledWith(200);
      expect(props.onCancel).not.toHaveBeenCalled();
      expect(handle).not.toHaveAttribute("data-resizing");
    } finally {
      document.removeEventListener("pointerdown", hostPointerDown);
    }
  });

  it("ignores non-primary pointer input and does not commit an unchanged drag", () => {
    const { handle, props } = renderHandle();

    fireEvent.pointerDown(handle, { button: 1, clientX: 100, pointerId: 4 });
    fireEvent.pointerMove(window, { clientX: 150, pointerId: 4 });
    fireEvent.pointerUp(window, { clientX: 150, pointerId: 4 });
    expect(props.onPreview).not.toHaveBeenCalled();
    expect(props.onCommit).not.toHaveBeenCalled();

    fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 5 });
    fireEvent.pointerUp(window, { clientX: 100, pointerId: 5 });
    expect(props.onPreview).toHaveBeenCalledTimes(1);
    expect(props.onPreview).toHaveBeenLastCalledWith(null);
    expect(props.onCommit).not.toHaveBeenCalled();
  });

  it("cancels on pointer cancellation, escape, lost capture, and unmount without a commit", () => {
    const { handle, props, unmount } = renderHandle();

    fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 6 });
    fireEvent.pointerMove(window, { clientX: 150, pointerId: 6 });
    fireEvent.pointerCancel(window, { pointerId: 6 });
    expect(props.onCancel).toHaveBeenCalledTimes(1);
    expect(props.onCommit).not.toHaveBeenCalled();

    fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 7 });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(props.onCancel).toHaveBeenCalledTimes(2);

    fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 8 });
    fireEvent(handle, new Event("lostpointercapture", { bubbles: true }));
    expect(props.onCancel).toHaveBeenCalledTimes(3);

    fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 9 });
    unmount();
    expect(props.onCancel).toHaveBeenCalledTimes(4);
    expect(props.onPreview).toHaveBeenLastCalledWith(null);
    expect(props.onCommit).not.toHaveBeenCalled();
  });

  it("retains an active gesture for an equivalent rerender and cancels when its semantic key changes", () => {
    const props = createProps();
    const { rerender } = render(<ColumnResizeHandle {...props} />);
    const handle = screen.getByRole("separator", { name: props.label });

    fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 10 });
    rerender(<ColumnResizeHandle {...props} width={130} />);
    fireEvent.pointerUp(window, { clientX: 120, pointerId: 10 });
    expect(props.onCommit).toHaveBeenCalledWith(140);

    fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 11 });
    rerender(<ColumnResizeHandle {...props} gestureKey="status" />);
    expect(props.onCancel).toHaveBeenCalledTimes(1);
    expect(props.onCommit).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard range control without bubbling into header sorting or row dragging", () => {
    const { handle, props } = renderHandle();
    const hostKeyDown = vi.fn();
    document.addEventListener("keydown", hostKeyDown);
    try {
      fireEvent.keyDown(handle, { key: "ArrowRight" });
      fireEvent.keyDown(handle, { key: "ArrowLeft", shiftKey: true });
      fireEvent.keyDown(handle, { key: "Home" });
      fireEvent.keyDown(handle, { key: "End" });

      expect(props.onCommit.mock.calls.map(([width]) => width)).toEqual([128, 119, 80, 200]);
      expect(hostKeyDown).not.toHaveBeenCalled();
      expect(props.onPreview).toHaveBeenLastCalledWith(null);
    } finally {
      document.removeEventListener("keydown", hostKeyDown);
    }
  });

  it("does not expose invalid aria values or accept interaction when disabled", () => {
    const { handle, props } = renderHandle({
      disabled: true,
      width: Number.NaN,
      minWidth: Number.NEGATIVE_INFINITY,
      maxWidth: Number.POSITIVE_INFINITY,
    });

    expect(handle).toHaveAttribute("aria-disabled", "true");
    expect(handle).toHaveAttribute("tabindex", "-1");
    expect(handle).not.toHaveAttribute("aria-valuenow");
    expect(handle).not.toHaveAttribute("aria-valuemin");
    expect(handle).not.toHaveAttribute("aria-valuemax");
    fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 12 });
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(props.onPreview).not.toHaveBeenCalled();
    expect(props.onCommit).not.toHaveBeenCalled();
  });
});
