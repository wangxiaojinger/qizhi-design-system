import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "../time-picker/TimePicker";
import { Input } from "../input/Input";

describe("输入、日期、时间统一边界矩阵", () => {
  it.each(["date", "time"])("%s 打开期间接收外部值并在动态禁用时关闭", async (kind) => {
    const user = userEvent.setup();
    const renderPicker = (value: string, disabled = false) => kind === "date" ? <DatePicker showTime value={value} disabled={disabled} /> : <TimePicker needConfirm value={value} disabled={disabled} />;
    const first = kind === "date" ? "2026-08-15 09:00:00" : "09:00:00";
    const second = kind === "date" ? "2026-08-16 18:00:00" : "18:00:00";
    const { rerender } = render(renderPicker(first));
    await user.click(screen.getByRole("combobox"));
    rerender(renderPicker(second));
    expect(screen.getByRole("combobox")).toHaveValue(second);
    expect(within(screen.getByRole("listbox", { name: "时" })).getByRole("option", { name: "18" })).toHaveAttribute("aria-selected", "true");
    rerender(renderPicker(second, true));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("排序后起止禁用角色不兼容时禁止确认", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimePicker.RangePicker needConfirm defaultValue={["18:00:00", "08:00:00"]} disabledTime={(_, field) => ({ disabledHours: field === "start" ? [8] : [] })} onChange={onChange} />);
    await user.click(screen.getByRole("combobox", { name: "开始时间" }));
    expect(screen.getByRole("button", { name: "确认" })).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each(["2024-02-29 09:00:00", "2026-02-29 09:00:00"])("闰年边界 %s 校验准确", async (value) => {
    const user = userEvent.setup();
    render(<DatePicker showTime value={value} />);
    await user.click(screen.getByRole("combobox"));
    if (value.startsWith("2024")) expect(screen.getByRole("button", { name: "确认" })).toBeEnabled();
    else expect(screen.getByRole("button", { name: "确认" })).toBeDisabled();
  });
  it.each(["month", "quarter", "year"] as const)("%s 周期只要有可选日就不整体禁用", async (mode) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker mode={mode} defaultPickerDate="2026-08-01" disabledDate={(date) => date < new Date(2026, 7, 15)} onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    const name = mode === "month" ? "8月" : mode === "quarter" ? "Q3" : "2026";
    const option = screen.getByRole("button", { name });
    expect(option).toBeEnabled();
    await user.click(option);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("切换单个日期后禁用回调收到面板所显示的时间", async () => {
    const user = userEvent.setup();
    const disabledTime = vi.fn((_date?: Date) => ({}));
    render(<DatePicker showTime defaultValue="2026-08-15 09:12:30" disabledTime={disabledTime} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("button", { name: "2026年8月16日" }));
    const last = disabledTime.mock.calls.at(-1)?.[0] as Date | undefined;
    expect(last?.getHours()).toBe(9);
    expect(last?.getMinutes()).toBe(12);
  });

  it("从结束日期打开后 Escape 回到结束输入框", async () => {
    const user = userEvent.setup();
    render(<DatePicker.RangePicker showTime />);
    const end = screen.getByRole("combobox", { name: "选择日期时间范围结束" });
    await user.click(end);
    await user.click(within(screen.getByRole("listbox", { name: "时" })).getByRole("option", { name: "09" }));
    await user.keyboard("{Escape}");
    expect(end).toHaveFocus();
  });

  it.each(["date", "time"])("%s 焦点离开组件时关闭并丢弃草稿", async (kind) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<>{kind === "date" ? <DatePicker showTime onChange={onChange} /> : <TimePicker needConfirm onChange={onChange} />}<button>外部操作</button></>);
    await user.click(screen.getByRole("combobox"));
    fireEvent.focus(screen.getByRole("button", { name: "外部操作" }));
    fireEvent.blur(screen.getByRole("combobox"), { relatedTarget: screen.getByRole("button", { name: "外部操作" }) });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("方向键跨月移动并跳过禁用日期", async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultPickerDate="2026-08-01" disabledDate={(date) => date.getDate() === 1} />);
    await user.click(screen.getByRole("combobox"));
    const day = screen.getByRole("button", { name: "2026年8月31日" });
    day.focus();
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("button", { name: "2026年9月2日" })).toHaveFocus();
  });

  it("受控输入父层拒绝清空时保持原值，回调仍携带空值", async () => {
    const user = userEvent.setup();
    const values: string[] = [];
    render(<Input value="原值" onChange={(event) => values.push(event.target.value)} />);
    await user.click(screen.getByRole("button", { name: "清空输入内容" }));
    expect(values).toEqual([""]);
    expect(screen.getByRole("textbox")).toHaveValue("原值");
  });
});
