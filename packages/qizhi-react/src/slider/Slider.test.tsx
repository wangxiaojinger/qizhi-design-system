import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("normalizes the default value and supports the complete keyboard path", () => {
    const onChange = vi.fn();
    const onChangeComplete = vi.fn();
    render(
      <Slider
        defaultValue={11}
        min={0}
        max={20}
        step={5}
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />,
    );
    const handle = screen.getByRole("slider");
    expect(handle).toHaveAttribute("aria-valuenow", "10");
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(handle).toHaveAttribute("aria-valuenow", "15");
    fireEvent.keyDown(handle, { key: "Home" });
    expect(handle).toHaveAttribute("aria-valuenow", "0");
    fireEvent.keyDown(handle, { key: "End" });
    expect(handle).toHaveAttribute("aria-valuenow", "20");
    expect(onChange).toHaveBeenLastCalledWith(20);
    expect(onChangeComplete.mock.calls).toEqual([[15], [0], [20]]);
  });

  it("keeps controlled values controlled and reports the requested change", () => {
    const onChange = vi.fn();
    render(<Slider value={30} onChange={onChange} aria-label="阈值" />);
    const handle = screen.getByRole("slider", { name: "阈值" });
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(31);
    expect(handle).toHaveAttribute("aria-valuenow", "30");
  });

  it("renders sorted multiple handles, marks, and formatted tooltips", () => {
    render(
      <Slider
        range
        defaultValue={[10, 5]}
        max={20}
        vertical
        marks={{ 5: "5km", 10: "10km" }}
        tooltipVisible
        formatterTooltip={(value) => `${value}%`}
        aria-label="距离"
      />,
    );
    const handles = screen.getAllByRole("slider");
    expect(handles.map((handle) => handle.getAttribute("aria-valuenow")))
      .toEqual(["5", "10"]);
    expect(handles[0]).toHaveAccessibleName("距离 1");
    expect(handles[1]).toHaveAccessibleName("距离 2");
    expect(screen.getByText("5km")).toBeInTheDocument();
    expect(screen.getByText("10km")).toBeInTheDocument();
    expect(screen.getByRole("tooltip", { name: "5%" })).toBeInTheDocument();
  });

  it("does not focus or emit changes while disabled", () => {
    const onChange = vi.fn();
    render(<Slider defaultValue={30} disabled onChange={onChange} />);
    const handle = screen.getByRole("slider");
    expect(handle).toBeDisabled();
    expect(handle).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("moves a two-value draggable bar without changing its span", () => {
    const onChange = vi.fn();
    const onChangeComplete = vi.fn();
    render(
      <Slider
        defaultValue={[3, 6]}
        max={10}
        range={{ draggableBar: true }}
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />,
    );
    const track = screen.getByTestId("slider-track");
    track.getBoundingClientRect = () => ({
      x: 0, y: 0, left: 0, top: 0, right: 200, bottom: 2,
      width: 200, height: 2, toJSON: () => ({}),
    });
    const bar = screen.getByTestId("slider-bar");
    fireEvent.pointerDown(bar, { clientX: 80, pointerId: 1 });
    fireEvent.pointerMove(window, { clientX: 120, pointerId: 1 });
    fireEvent.pointerUp(window, { clientX: 120, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith([5, 8]);
    expect(onChangeComplete).toHaveBeenCalledTimes(1);
    expect(onChangeComplete).toHaveBeenLastCalledWith([5, 8]);
  });

  it("completes a track interaction once on pointer release", () => {
    const onChange = vi.fn();
    const onChangeComplete = vi.fn();
    render(<Slider onChange={onChange} onChangeComplete={onChangeComplete} />);
    const track = screen.getByTestId("slider-track");
    track.getBoundingClientRect = () => ({
      x: 0, y: 0, left: 0, top: 0, right: 100, bottom: 2,
      width: 100, height: 2, toJSON: () => ({}),
    });
    fireEvent.pointerDown(track, { clientX: 40, pointerId: 1 });
    fireEvent.pointerMove(window, { clientX: 60, pointerId: 1 });
    fireEvent.pointerUp(window, { clientX: 60, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith(60);
    expect(onChangeComplete).toHaveBeenCalledTimes(1);
    expect(onChangeComplete).toHaveBeenLastCalledWith(60);
  });

  it("forwards Tooltip position and popup container through the public API", () => {
    const popupContainer = document.createElement("div");
    document.body.append(popupContainer);
    render(
      <Slider
        defaultValue={40}
        tooltipVisible
        tooltipPosition="bottomRight"
        getPopupContainer={() => popupContainer}
      />,
    );
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveAttribute("data-tooltip-position", "bottomRight");
    expect(tooltip.parentElement).toBe(popupContainer);
    popupContainer.remove();
  });

  it("forwards its root ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Slider ref={ref} />);
    expect(ref.current).toHaveClass("qizhi-slider");
  });

  it("defaults range mode to two handles at the minimum", () => {
    render(<Slider range min={10} />);
    expect(screen.getAllByRole("slider").map((handle) =>
      handle.getAttribute("aria-valuenow"))).toEqual(["10", "10"]);
  });

  it("renders multiple mode from an explicit array value", () => {
    render(<Slider multiple defaultValue={[0, 20, 50]} />);
    expect(screen.getAllByRole("slider").map((handle) =>
      handle.getAttribute("aria-valuenow"))).toEqual(["0", "20", "50"]);
  });
});
