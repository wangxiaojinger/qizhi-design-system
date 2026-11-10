import { useEffect, useId, useRef, useState } from "react";
import { Alert } from "../alert/Alert";
import { Button } from "../button/Button";
import type { ButtonHandle } from "../button/Button.types";
import { Input } from "../input/Input";
import { Popover } from "../popover/Popover";
import { formatRangeDateTime, parseRangeDateTime } from "./rangeDateTime";
import type { TimeRange, DateTimeRangePickerProps } from "./DateTimeRangePicker.types";
import "./timeRangePicker.css";

export function DateTimeRangePicker({
  value, onChange, shortcuts = [], timeZone = "UTC", validate, disabled, className,
}: DateTimeRangePickerProps) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState({ start: "", end: "" });
  const [error, setError] = useState<string>();
  const trigger = useRef<ButtonHandle>(null);
  const panel = useRef<HTMLDivElement>(null);
  const errorId = useId();
  const format = (time: number) => formatRangeDateTime(time, timeZone);
  const start = format(value.start);
  const end = format(value.end);

  useEffect(() => {
    const popup = panel.current;
    if (!disabled && popup?.contains(popup.ownerDocument.activeElement)) trigger.current?.focus();
    setVisible(false);
    setError(undefined);
  }, [disabled, timeZone, value.start, value.end]);

  if (start === undefined || end === undefined) {
    return <Alert type="error" content="时间范围或时区配置无效。" />;
  }

  const onVisibleChange = (next: boolean) => {
    if (next) setDraft({ start, end });
    setError(undefined);
    setVisible(next);
  };

  const close = () => {
    onVisibleChange(false);
    trigger.current?.focus();
  };

  const commit = (range: TimeRange) => {
    const { start, end } = range;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
      setError("请输入有效的起止时间，结束时间须晚于开始时间。重复或不存在的当地时间可改用 UTC 后重试。");
      return;
    }
    const validationError = validate?.(range);
    if (validationError) {
      setError(validationError);
      return;
    }
    close();
    onChange(range);
  };

  const inputRange = (field: keyof TimeRange) => {
    const text = draft[field];
    const original = field === "start" ? start : end;
    if ((text.length === 16 ? text + ":00" : text) === original) return value[field];
    return parseRangeDateTime(text, timeZone) ?? NaN;
  };

  const editField = (field: keyof TimeRange, text: string) => {
    setDraft(current => ({ ...current, [field]: text }));
    setError(undefined);
  };

  return <Popover position="bottomLeft" trigger="click" ariaLabel="选择时间范围" arrow={false}
    popupVisible={visible && !disabled} onVisibleChange={onVisibleChange}
    classNames={{ root: "qizhi-time-range-picker__popup" }}
    content={<div ref={panel} className="qizhi-time-range-picker__panel">
      {shortcuts.length ? <div className="qizhi-time-range-picker__shortcuts" role="group" aria-label="快捷时间范围">
        {shortcuts.map(shortcut => <Button key={shortcut.key} size="small" onClick={() => commit(shortcut.resolve(Date.now()))}>{shortcut.label}</Button>)}
      </div> : null}
      <form onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        commit({ start: inputRange("start"), end: inputRange("end") });
      }}>
        <label>开始时间
          <Input type="datetime-local" step={1} value={draft.start} onChange={event => editField("start", event.target.value)}
            aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
        </label>
        <label>结束时间（不含）
          <Input type="datetime-local" step={1} value={draft.end} onChange={event => editField("end", event.target.value)}
            aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
        </label>
        {error && <p role="alert" id={errorId}>{error}</p>}
        <div className="qizhi-time-range-picker__actions">
          <Button onClick={close}>取消</Button>
          <Button type="primary" htmlType="submit">应用</Button>
        </div>
      </form>
    </div>}>
    <Button ref={trigger} disabled={disabled} className={["qizhi-time-range-picker", className ?? ""]}>
      时间范围 · {start.replace("T", " ")} – {end.replace("T", " ")}
    </Button>
  </Popover>;
}
