import { useEffect, useState } from "react";
import { Alert } from "../alert/Alert";
import { DatePicker } from "../date-picker/DatePicker";
import { formatRangeDateTime, parseRangeDateTime } from "./rangeDateTime";
import type { TimeRange, DateTimeRangePickerProps } from "./DateTimeRangePicker.types";

const invalidRange = "请输入有效的起止时间，结束时间须晚于开始时间。重复或不存在的当地时间可改用 UTC 后重试。";

export function DateTimeRangePicker({
  value, onChange, onShortcutSelect, shortcuts = [], timeZone = "UTC", validate, disableFuture, disabled, className,
}: DateTimeRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [, setClockSecond] = useState(0);
  useEffect(() => {
    if (!open || !disableFuture) return;
    const tick = () => setClockSecond(Math.floor(Date.now() / 1000));
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [open, disableFuture]);

  const start = formatRangeDateTime(value.start, timeZone);
  const end = formatRangeDateTime(value.end, timeZone);
  if (start === undefined || end === undefined) {
    return <Alert type="error" content="时间范围或时区配置无效。" />;
  }

  const formatted = [start.replace("T", " "), end.replace("T", " ")] as const;
  const toRange = ([from, to]: [string, string]): TimeRange => ({
    start: from === formatted[0] ? value.start : parseRangeDateTime(from.replace(" ", "T"), timeZone) ?? NaN,
    end: to === formatted[1] ? value.end : parseRangeDateTime(to.replace(" ", "T"), timeZone) ?? NaN,
  });
  let clockSecond: number | undefined;
  let clockText = "";
  const latest = () => {
    const second = Math.floor(Date.now() / 1000);
    if (clockSecond !== second) {
      clockSecond = second;
      clockText = formatRangeDateTime(second * 1000, timeZone)!;
    }
    return clockText;
  };
  const dateKey = (date: Date) => [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, "0")).join("-");
  const after = (value: number, limit: number) =>
    Array.from({ length: limit - value - 1 }, (_, index) => value + index + 1);
  const disabledTime = (date?: Date) => {
    const now = latest();
    if (!date) return {};
    const day = dateKey(date);
    if (day > now.slice(0, 10)) return { disabledHours: after(-1, 24), disabledMinutes: after(-1, 60), disabledSeconds: after(-1, 60) };
    if (day < now.slice(0, 10)) return {};
    const [hour, minute, second] = now.slice(11).split(":").map(Number);
    return {
      disabledHours: after(hour, 24),
      disabledMinutes: date.getHours() === hour ? after(minute, 60) : undefined,
      disabledSeconds: date.getHours() === hour && date.getMinutes() === minute ? after(second, 60) : undefined,
    };
  };
  const validateValue = (range: TimeRange) =>
    !Number.isFinite(range.start) || !Number.isFinite(range.end) || range.start >= range.end
      ? invalidRange : disableFuture && range.end > Date.now() ? "结束时间不能晚于当前时间。" : validate?.(range);

  return <DatePicker.RangePicker showTime editable closeOnValueChange allowClear={false}
    onOpenChange={setOpen} separator="～" disabledDate={disableFuture ? date => dateKey(date) > latest().slice(0, 10) : undefined}
    disabledTime={disableFuture ? disabledTime : undefined}
    inputLabels={["开始时间", "结束时间（不含）"]} className={["qizhi-date-time-range-picker", className].filter(Boolean).join(" ")}
    value={formatted} disabled={disabled}
    validateRange={draft => validateValue(toRange(draft))}
    onChange={draft => { if (draft.length) onChange(toRange(draft)); }}
    shortcuts={shortcuts.map(shortcut => ({
      key: shortcut.key,
      label: shortcut.label,
      onSelect: () => {
        const range = shortcut.resolve(Date.now());
        const error = validateValue(range);
        if (!error) {
          onChange(range);
          onShortcutSelect?.(shortcut.key, range);
        }
        return error;
      },
    }))} />;
}
