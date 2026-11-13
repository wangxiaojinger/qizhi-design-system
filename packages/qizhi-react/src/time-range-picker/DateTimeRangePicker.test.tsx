import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateTimeRangePicker } from "./DateTimeRangePicker";
import { parseRangeDateTime } from "./rangeDateTime";

const start = Date.UTC(2026, 10, 1);
const end = Date.UTC(2026, 10, 2);

describe("DateTimeRangePicker", () => {
  it("submits only valid drafts and restores focus after applying", async () => {
    const onChange = vi.fn();
    render(<DateTimeRangePicker value={{ start, end }} onChange={onChange}
      validate={range => range.end > end ? "超出查询范围" : undefined} />);
    const trigger = screen.getByRole("combobox", { name: "开始时间" });
    fireEvent.click(trigger);
    const input = await screen.findByLabelText("结束时间（不含）");
    fireEvent.change(input, { target: { value: "2026-11-03T00:00" } });
    fireEvent.click(screen.getByRole("button", { name: "确认" }));
    expect(screen.getByRole("alert")).toHaveTextContent("超出查询范围");
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "2026-11-01T12:00" } });
    fireEvent.click(screen.getByRole("button", { name: "确认" }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({ start, end: start + 43_200_000 });
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("resolves a shortcut once and emits its range", async () => {
    const resolve = vi.fn(() => ({ start, end }));
    const onChange = vi.fn();
    render(<DateTimeRangePicker value={{ start, end }} onChange={onChange}
      shortcuts={[{ key: "day", label: "最近一天", resolve }]} />);
    fireEvent.click(screen.getByRole("combobox", { name: "开始时间" }));
    fireEvent.click(await screen.findByRole("button", { name: "最近一天" }));
    expect(resolve).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({ start, end });
  });
});

it("distinguishes valid, ambiguous and nonexistent local times", () => {
  expect(parseRangeDateTime("2026-11-01T03:00", "America/New_York")).toBe(Date.UTC(2026, 10, 1, 8));
  expect(parseRangeDateTime("2026-11-01T01:30", "America/New_York")).toBeUndefined();
  expect(parseRangeDateTime("2026-03-08T02:30", "America/New_York")).toBeUndefined();
  expect(parseRangeDateTime("2026-02-30T00:00", "UTC")).toBeUndefined();
});


it("discards a draft when the picker is disabled or the time zone changes", async () => {
  const onChange = vi.fn();
  const value = { start, end };
  const { rerender } = render(<DateTimeRangePicker value={value} onChange={onChange} />);
  const trigger = screen.getByRole("combobox", { name: "开始时间" });
  fireEvent.click(trigger);
  fireEvent.change(await screen.findByLabelText("开始时间"), { target: { value: "2026-11-01T01:00" } });
  rerender(<DateTimeRangePicker value={value} onChange={onChange} disabled />);
  rerender(<DateTimeRangePicker value={value} onChange={onChange} />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  fireEvent.click(trigger);
  await screen.findByRole("dialog");
  rerender(<DateTimeRangePicker value={value} onChange={onChange} timeZone="Asia/Shanghai" />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

it("配置统计时区时按当地时间显示和提交，界面省略时区标记", async () => {
  const onChange = vi.fn();
  render(<DateTimeRangePicker value={{ start, end }} onChange={onChange} timeZone="Asia/Shanghai" />);
  const trigger = screen.getByRole("combobox", { name: "开始时间" });
  expect(trigger).toHaveValue("2026-11-01 08:00:00");
  expect(trigger).not.toHaveTextContent(/Asia\/Shanghai|UTC/);
  fireEvent.click(trigger);
  expect(await screen.findByRole("dialog")).not.toHaveTextContent(/Asia\/Shanghai|UTC/);
  fireEvent.change(screen.getByLabelText("结束时间（不含）"), { target: { value: "2026-11-01T10:00" } });
  fireEvent.click(screen.getByRole("button", { name: "确认" }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith({ start, end: start + 7_200_000 });
});

it("无效时区显示错误并禁止提交", () => {
  const onChange = vi.fn();
  render(<DateTimeRangePicker value={{ start, end }} onChange={onChange} timeZone="browser" />);
  expect(screen.getByRole("alert")).toHaveTextContent("时间范围或时区配置无效");
  expect(screen.queryByRole("combobox", { name: "开始时间" })).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});
