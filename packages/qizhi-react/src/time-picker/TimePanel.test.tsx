import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { TimePanel } from "./TimePanel";

test("renders format-specific columns and literal step options", () => {
  const { rerender } = render(
    <TimePanel
      value={{ hour: 10, minute: 25, second: 30 }}
      step={{ hour: 2, minute: 5, second: 10 }}
      onChange={() => undefined}
    />,
  );
  expect(screen.getAllByRole("listbox")).toHaveLength(3);
  expect(within(screen.getByRole("listbox", { name: "时" })).getAllByRole("option"))
    .toHaveLength(12);
  expect(within(screen.getByRole("listbox", { name: "分" })).getAllByRole("option"))
    .toHaveLength(12);
  expect(within(screen.getByRole("listbox", { name: "秒" })).getAllByRole("option"))
    .toHaveLength(6);

  rerender(
    <TimePanel
      format="HH:mm"
      value={{ hour: 9, minute: 24, second: 0 }}
      onChange={() => undefined}
    />,
  );
  expect(screen.getAllByRole("listbox")).toHaveLength(2);
  expect(screen.queryByRole("listbox", { name: "秒" })).not.toBeInTheDocument();
});

test("moves through options with arrows and selects with Space", () => {
  const onChange = vi.fn();
  render(
    <TimePanel
      value={{ hour: 2, minute: 0, second: 0 }}
      step={{ hour: 2 }}
      onChange={onChange}
    />,
  );
  const hour = screen.getByRole("listbox", { name: "时" });
  const option02 = within(hour).getByRole("option", { name: "02" });
  const option04 = within(hour).getByRole("option", { name: "04" });
  option02.focus();
  fireEvent.keyDown(option02, { key: "ArrowDown" });
  expect(option04).toHaveFocus();
  fireEvent.keyDown(option04, { key: " " });
  expect(onChange).toHaveBeenLastCalledWith({ hour: 4, minute: 0, second: 0 });
});
