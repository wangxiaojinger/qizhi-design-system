import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DemoSegmentedControl } from "./DemoSegmentedControl";

describe("DemoSegmentedControl", () => {
  it("acts as a documentation-only accessible single-choice control", () => {
    const onChange = vi.fn();
    render(<DemoSegmentedControl<number> value={2} options={[2, 3, { label: "四", value: 4, disabled: true }]} onChange={onChange} aria-label="数量" />);

    expect(screen.getByRole("radiogroup", { name: "数量" })).toHaveClass("qizhi-segmented");
    expect(screen.getByRole("radio", { name: "2" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: "3" }));
    expect(onChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole("radio", { name: "四" })).toBeDisabled();
    screen.getByRole("radio", { name: "2" }).focus();
    fireEvent.keyDown(screen.getByRole("radio", { name: "2" }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(screen.getByRole("radio", { name: "3" })).toHaveFocus();
  });
});
