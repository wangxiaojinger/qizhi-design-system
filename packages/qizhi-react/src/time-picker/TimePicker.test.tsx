import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { TimePicker } from "./TimePicker";

test("discards unconfirmed edits on Escape and restores the committed value", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<TimePicker needConfirm defaultValue="08:00:00" onChange={onChange} />);
  const input = screen.getByRole("combobox");
  await user.click(input);
  await user.click(within(screen.getByRole("listbox", { name: "时" })).getByRole("option", { name: "09" }));
  await user.keyboard("{Escape}");
  expect(input).toHaveValue("08:00:00");
  expect(onChange).not.toHaveBeenCalled();
  await user.click(input);
  expect(within(screen.getByRole("listbox", { name: "时" })).getByRole("option", { name: "08" })).toHaveAttribute("aria-selected", "true");
});

test("confirms draft values and clears the result", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<TimePicker needConfirm defaultValue="08:30:00" onChange={onChange} />);
  await user.click(screen.getByRole("combobox"));
  await user.click(within(screen.getByRole("listbox", { name: "时" })).getByRole("option", { name: "09" }));
  expect(onChange).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "确认" }));
  expect(onChange).toHaveBeenLastCalledWith("09:30:00");
  await user.click(screen.getByRole("button", { name: "清空时间" }));
  expect(onChange).toHaveBeenLastCalledWith("");
});

test("skips disabled hours with keyboard and closes from a panel option", async () => {
  const user = userEvent.setup();
  render(<TimePicker disabledTime={() => ({ disabledHours: [1] })} />);
  await user.click(screen.getByRole("combobox"));
  const hours = screen.getByRole("listbox", { name: "时" });
  expect(within(hours).getByRole("option", { name: "01" })).toBeDisabled();
  const zero = within(hours).getByRole("option", { name: "00" });
  zero.focus();
  await user.keyboard("{ArrowDown}");
  expect(within(hours).getByRole("option", { name: "02" })).toHaveFocus();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("orders a completed range by default", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<TimePicker.RangePicker defaultValue={["18:00:00", "19:00:00"]} onChange={onChange} />);
  await user.click(screen.getByRole("combobox", { name: "结束时间" }));
  await user.click(within(screen.getByRole("listbox", { name: "时" })).getByRole("option", { name: "08" }));
  expect(onChange).toHaveBeenLastCalledWith(["08:00:00", "18:00:00"]);
});

test("selects an option into an uncontrolled single value", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<TimePicker defaultValue="10:25:30" onChange={onChange} />);
  const input = screen.getByRole("combobox", { name: "选择时间" });
  await user.click(input);
  await user.click(within(screen.getByRole("listbox", { name: "时" }))
    .getByRole("option", { name: "12" }));
  expect(input).toHaveValue("12:25:30");
  expect(onChange).toHaveBeenLastCalledWith("12:25:30");
  expect(screen.getByRole("dialog", { name: "选择时间" })).toBeVisible();
});

test("keeps controlled display bound to value while reporting changes", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<TimePicker value="08:30:00" onChange={onChange} />);
  const input = screen.getByRole("combobox", { name: "选择时间" });
  await user.click(input);
  await user.click(within(screen.getByRole("listbox", { name: "分" }))
    .getByRole("option", { name: "35" }));
  expect(onChange).toHaveBeenLastCalledWith("08:35:00");
  expect(input).toHaveValue("08:30:00");
});

test("edits each range field without sorting or closing the popup", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<TimePicker.RangePicker order={false} onChange={onChange} />);
  const start = screen.getByRole("combobox", { name: "开始时间" });
  const end = screen.getByRole("combobox", { name: "结束时间" });
  await user.click(start);
  await user.click(within(screen.getByRole("listbox", { name: "时" }))
    .getByRole("option", { name: "18" }));
  expect(start).toHaveValue("18:00:00");
  await user.click(end);
  await user.click(within(screen.getByRole("listbox", { name: "时" }))
    .getByRole("option", { name: "08" }));
  expect(onChange).toHaveBeenLastCalledWith(["18:00:00", "08:00:00"]);
  expect(screen.getByRole("dialog", { name: "选择时间范围" })).toBeVisible();
});

test("uses HH:mm columns and structured steps", async () => {
  const user = userEvent.setup();
  render(
    <TimePicker
      defaultValue="10:25"
      format="HH:mm"
      step={{ hour: 2, minute: 5, second: 10 }}
    />,
  );
  await user.click(screen.getByRole("combobox", { name: "选择时间" }));
  expect(screen.getAllByRole("listbox")).toHaveLength(2);
  expect(within(screen.getByRole("listbox", { name: "时" })).getAllByRole("option"))
    .toHaveLength(12);
  expect(within(screen.getByRole("listbox", { name: "分" })).getAllByRole("option"))
    .toHaveLength(12);
});

test("opens with keyboard and Escape closes then restores focus", () => {
  render(<TimePicker />);
  const input = screen.getByRole("combobox", { name: "选择时间" });
  input.focus();
  fireEvent.keyDown(input, { key: "Enter" });
  expect(screen.getByRole("dialog", { name: "选择时间" })).toBeVisible();
  fireEvent.keyDown(input, { key: "Escape" });
  expect(screen.queryByRole("dialog", { name: "选择时间" })).not.toBeInTheDocument();
  expect(input).toHaveFocus();
});

test("repeated trigger click and outside pointer close the popup", async () => {
  const user = userEvent.setup();
  render(<TimePicker />);
  const input = screen.getByRole("combobox", { name: "选择时间" });

  await user.click(input);
  expect(screen.getByRole("dialog", { name: "选择时间" })).toBeVisible();
  await user.click(input);
  expect(screen.queryByRole("dialog", { name: "选择时间" }))
    .not.toBeInTheDocument();

  await user.click(input);
  fireEvent.mouseDown(document.body);
  expect(screen.queryByRole("dialog", { name: "选择时间" }))
    .not.toBeInTheDocument();
});

test("disabled state cannot focus, open, or emit changes", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<TimePicker disabled defaultValue="08:30:00" onChange={onChange} />);
  const input = screen.getByRole("combobox", { name: "选择时间" });
  expect(input).toBeDisabled();
  await user.click(input);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

test("maps size and status to public root states", () => {
  const { rerender } = render(<TimePicker size="mini" status="error" />);
  expect(screen.getByTestId("qizhi-time-picker"))
    .toHaveClass("qizhi-time-picker--mini", "qizhi-time-picker--error");
  rerender(<TimePicker.RangePicker size="large" status="warning" />);
  expect(screen.getByTestId("qizhi-time-picker"))
    .toHaveClass("qizhi-time-picker--range", "qizhi-time-picker--large", "qizhi-time-picker--warning");
});
