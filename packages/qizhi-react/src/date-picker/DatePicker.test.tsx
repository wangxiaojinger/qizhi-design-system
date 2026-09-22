import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./DatePicker";
import datePickerCss from "./datePicker.css?raw";

describe("DatePicker", () => {
  it("opens an accessible date dialog and commits a single date immediately", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker defaultPickerDate="2026-08-01" onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "选择日期" }));
    const dialog = screen.getByRole("dialog", { name: "选择日期" });
    expect(within(dialog).getByText("2026年 8月")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "2026年8月15日" }));

    expect(onChange).toHaveBeenLastCalledWith("2026-08-15");
    expect(screen.queryByRole("dialog", { name: "选择日期" })).not.toBeInTheDocument();
  });

  it("keeps a range dialog open until the second date and normalizes reversed values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker.RangePicker defaultPickerDate="2026-08-01" onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "选择日期范围" }));
    const dialog = screen.getByRole("dialog", { name: "选择日期范围" });
    await user.click(within(dialog).getByRole("button", { name: "2026年8月20日" }));
    expect(dialog).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "2026年8月10日" }));

    expect(onChange).toHaveBeenLastCalledWith(["2026-08-10", "2026-08-20"]);
    expect(screen.queryByRole("dialog", { name: "选择日期范围" })).not.toBeInTheDocument();
  });

  it("keeps the legacy control box structure and lets only hover reveal clear", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker defaultValue="2026-08-15" allowClear onChange={onChange} />);
    const picker = screen.getByTestId("qizhi-date-picker");
    expect(picker.tagName).toBe("DIV");
    expect([...picker.children].map((child) => child.className)).toEqual([
      "qizhi-date-picker__input-wrap",
      "qizhi-date-picker__clear",
      "qizhi-date-picker__suffix",
    ]);
    expect(picker.querySelector(".qizhi-input")).not.toBeInTheDocument();
    const clear = screen.getByRole("button", { name: "清空日期" });
    const suffix = picker.querySelector(".qizhi-date-picker__suffix");
    const beforeFocus = picker.innerHTML;
    fireEvent.focus(screen.getByRole("combobox", { name: "选择日期" }));
    expect(picker.innerHTML).toBe(beforeFocus);
    expect(picker.querySelector(".qizhi-date-picker__suffix")).toBe(suffix);
    await user.click(clear);
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(screen.getByRole("combobox", { name: "选择日期" })).toHaveValue("");
    expect(clear).toHaveAttribute("hidden");
  });

  it("uses the legacy direct-child order for a range control", () => {
    render(<DatePicker.RangePicker prefix={<span>前缀</span>} />);
    const picker = screen.getByTestId("qizhi-date-picker");
    expect([...picker.children].map((child) => child.className)).toEqual([
      "qizhi-date-picker__prefix",
      "qizhi-date-picker__input-wrap is-active",
      "qizhi-date-picker__separator",
      "qizhi-date-picker__input-wrap",
      "qizhi-date-picker__clear",
      "qizhi-date-picker__suffix",
    ]);
  });

  it("supports range placeholders and a fully disabled state", async () => {
    const user = userEvent.setup();
    render(<DatePicker.RangePicker showTime disabled placeholders={["开始时间", "结束时间"]} />);
    const start = screen.getByPlaceholderText("开始时间");
    const end = screen.getByPlaceholderText("结束时间");
    expect(start).toBeDisabled();
    expect(end).toBeDisabled();
    await user.click(start);
    expect(screen.queryByRole("dialog", { name: "选择日期时间范围" })).not.toBeInTheDocument();
  });

  it("does not use focus-within to reveal the clear control", () => {
    expect(datePickerCss).not.toMatch(/has-value:focus-within[^{]*qizhi-date-picker__clear/);
    expect(datePickerCss).not.toMatch(/has-value:focus-within[^{]*qizhi-date-picker__suffix/);
  });

  it("uses one continuous status boundary for a range picker", () => {
    render(<DatePicker.RangePicker status="warning" defaultValue={["2026-08-10", "2026-08-20"]} />);
    const picker = screen.getByTestId("qizhi-date-picker");
    expect(picker).toHaveClass("qizhi-date-picker--warning");
    expect(picker).toHaveAttribute("data-status", "warning");
  });

  it("requires confirmation when time selection is enabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker showTime defaultPickerDate="2026-08-01" onChange={onChange} />);
    await user.click(screen.getByRole("combobox", { name: "选择日期时间" }));
    const dialog = screen.getByRole("dialog", { name: "选择日期时间" });
    await user.click(within(dialog).getByRole("button", { name: "2026年8月15日" }));
    expect(dialog).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole("button", { name: "确认" }));
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-08-15 \d{2}:\d{2}:\d{2}$/));
  });

  it("respects disabled dates", async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultPickerDate="2026-08-01" disabledDate={(date) => date.getDate() < 10} />);
    await user.click(screen.getByRole("combobox", { name: "选择日期" }));
    expect(screen.getByRole("button", { name: "2026年8月5日" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "2026年8月10日" })).toBeEnabled();
  });

  it("portals the dialog outside clipping demo containers", async () => {
    const user = userEvent.setup();
    render(<div style={{ overflow: "hidden" }}><DatePicker defaultPickerDate="2026-08-01" /></div>);
    await user.click(screen.getByRole("combobox", { name: "选择日期" }));
    expect(screen.getByRole("dialog", { name: "选择日期" }).parentElement).toBe(document.body);
  });

  it("repositions the dialog when an ancestor scrolls", async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultPickerDate="2026-08-01" />);
    const picker = screen.getByTestId("qizhi-date-picker");
    let triggerTop = 120;
    vi.spyOn(picker, "getBoundingClientRect").mockImplementation(() => ({
      bottom: triggerTop + 32,
      height: 32,
      left: 40,
      right: 240,
      top: triggerTop,
      width: 200,
      x: 40,
      y: triggerTop,
      toJSON: () => ({}),
    }));

    await user.click(screen.getByRole("combobox", { name: "选择日期" }));
    const dialog = screen.getByRole("dialog", { name: "选择日期" });
    expect(dialog).toHaveStyle({ left: "40px", top: "156px" });

    triggerTop = 60;
    fireEvent.scroll(window);

    expect(dialog).toHaveStyle({ left: "40px", top: "96px" });
  });

  it("does not close a timed range before both endpoints are selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker.RangePicker showTime defaultPickerDate="2026-08-01" onChange={onChange} />);
    await user.click(screen.getByRole("combobox", { name: /^选择日期时间范围$/ }));
    const dialog = screen.getByRole("dialog", { name: "选择日期时间范围" });
    await user.click(within(dialog).getByRole("button", { name: "2026年8月15日" }));
    await user.click(within(dialog).getByRole("button", { name: "确认" }));
    expect(dialog).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
