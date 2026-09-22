import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { Button } from "../button/Button";
import { CalendarIcon, CloseIcon } from "../icon";
import { controlContainerClassName } from "../control-container/controlContainer";
import { ArrowLeftIcon, ArrowRightIcon } from "../icon/generated";
import type { DatePickerComponent, DatePickerMode, DatePickerProps, DateRangePickerProps, DisabledTimeConfig } from "./DatePicker.types";
import { TimePanel } from "../time-picker/TimePanel";
import "./datePicker.css";

const pad = (value: number) => String(value).padStart(2, "0");
const dateValue = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const monthValue = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
const yearValue = (date: Date) => String(date.getFullYear());
const quarterValue = (date: Date) => `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
const weekValue = (date: Date) => {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const first = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return `${target.getUTCFullYear()}-W${pad(Math.ceil((((target.getTime() - first.getTime()) / 86400000) + 1) / 7))}`;
};
const formatDate = (date: Date, mode: DatePickerMode) => mode === "month" ? monthValue(date) : mode === "year" ? yearValue(date) : mode === "quarter" ? quarterValue(date) : mode === "week" ? weekValue(date) : dateValue(date);
const parsePickerDate = (value?: string) => {
  const match = value?.match(/^(\d{4})-(\d{2})/);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
};
const addMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
const addYears = (date: Date, amount: number) => new Date(date.getFullYear() + amount, date.getMonth(), 1);
const sameDay = (left: Date, right: Date) => dateValue(left) === dateValue(right);
const join = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(" ");
const labelFor = (mode: DatePickerMode, showTime: boolean, range: boolean) => {
  if (range) return showTime ? "选择日期时间范围" : mode === "date" ? "选择日期范围" : `选择${mode === "week" ? "周" : mode === "month" ? "月份" : mode === "year" ? "年份" : "季度"}范围`;
  return showTime ? "选择日期时间" : mode === "date" ? "选择日期" : `选择${mode === "week" ? "周" : mode === "month" ? "月份" : mode === "year" ? "年份" : "季度"}`;
};
const defaultPlaceholder = (mode: DatePickerMode, showTime: boolean) => showTime ? "请选择日期和时间" : mode === "date" ? "请选择日期" : mode === "week" ? "请选择周" : mode === "month" ? "请选择月份" : mode === "year" ? "请选择年份" : "请选择季度";

function NavIcon({ double, direction }: { double?: boolean; direction: "left" | "right" }) {
  const Icon = direction === "left" ? ArrowLeftIcon : ArrowRightIcon;
  return <span className="qizhi-date-picker__nav-glyph" aria-hidden="true"><Icon />{double ? <Icon /> : null}</span>;
}

interface CalendarPanelProps {
  pickerDate: Date;
  mode: DatePickerMode;
  value?: string;
  range?: readonly string[];
  disabledDate?: (date: Date) => boolean;
  onNavigate: (date: Date) => void;
  onSelect: (date: Date) => void;
  side?: "left" | "right" | "single";
}

function CalendarPanel({ pickerDate, mode, value, range = [], disabledDate, onNavigate, onSelect, side = "single" }: CalendarPanelProps) {
  const year = pickerDate.getFullYear();
  const month = pickerDate.getMonth();
  const today = new Date();
  if (mode === "month" || mode === "quarter") {
    const count = mode === "month" ? 12 : 4;
    return <section className={`qizhi-date-picker__panel qizhi-date-picker__panel--${mode}`}><header><Button type="text" size="small" iconOnly aria-label="上一年" icon={<NavIcon direction="left" />} onClick={() => onNavigate(addYears(pickerDate, -1))} /><strong>{year}年</strong><Button type="text" size="small" iconOnly aria-label="下一年" icon={<NavIcon direction="right" />} onClick={() => onNavigate(addYears(pickerDate, 1))} /></header><div className="qizhi-date-picker__options">{Array.from({ length: count }, (_, index) => {
      const date = new Date(year, mode === "month" ? index : index * 3, 1);
      const formatted = formatDate(date, mode);
      return <button key={formatted} type="button" className={join(value === formatted && "is-selected", range.includes(formatted) && "is-selected")} onClick={() => onSelect(date)}>{mode === "month" ? `${index + 1}月` : `Q${index + 1}`}</button>;
    })}</div></section>;
  }
  if (mode === "year") {
    const start = Math.floor(year / 12) * 12;
    return <section className="qizhi-date-picker__panel qizhi-date-picker__panel--year"><header><Button type="text" size="small" iconOnly aria-label="前十二年" icon={<NavIcon direction="left" double />} onClick={() => onNavigate(addYears(pickerDate, -12))} /><strong>{start}–{start + 11}</strong><Button type="text" size="small" iconOnly aria-label="后十二年" icon={<NavIcon direction="right" double />} onClick={() => onNavigate(addYears(pickerDate, 12))} /></header><div className="qizhi-date-picker__options">{Array.from({ length: 12 }, (_, index) => {
      const date = new Date(start + index, 0, 1); const formatted = yearValue(date);
      return <button key={formatted} type="button" className={join(value === formatted && "is-selected", range.includes(formatted) && "is-selected")} onClick={() => onSelect(date)}>{formatted}</button>;
    })}</div></section>;
  }
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  return <section className="qizhi-date-picker__panel"><header>{side !== "right" ? <><Button type="text" size="small" iconOnly aria-label="上一年" icon={<NavIcon direction="left" double />} onClick={() => onNavigate(addYears(pickerDate, -1))} /><Button type="text" size="small" iconOnly aria-label="上个月" icon={<NavIcon direction="left" />} onClick={() => onNavigate(addMonths(pickerDate, -1))} /></> : <span />}<strong>{year}年 {month + 1}月</strong>{side !== "left" ? <><Button type="text" size="small" iconOnly aria-label="下个月" icon={<NavIcon direction="right" />} onClick={() => onNavigate(addMonths(pickerDate, 1))} /><Button type="text" size="small" iconOnly aria-label="下一年" icon={<NavIcon direction="right" double />} onClick={() => onNavigate(addYears(pickerDate, 1))} /></> : <span />}</header><div className="qizhi-date-picker__weekdays">{"一二三四五六日".split("").map((day) => <span key={day}>{day}</span>)}</div><div className="qizhi-date-picker__days">{Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} />)}{Array.from({ length: days }, (_, index) => {
    const date = new Date(year, month, index + 1); const formatted = formatDate(date, mode); const disabled = disabledDate?.(date) ?? false;
    return <button key={formatted} type="button" aria-label={`${year}年${month + 1}月${index + 1}日`} disabled={disabled} className={join(sameDay(date, today) && "is-today", value === formatted && "is-selected", range.includes(formatted) && "is-selected", range.length === 2 && formatted > range[0] && formatted < range[1] && "is-in-range")} onClick={() => onSelect(date)}>{index + 1}</button>;
  })}</div></section>;
}

type InternalProps = (DatePickerProps | DateRangePickerProps) & { range: boolean };
function DatePickerInternal(props: InternalProps) {
  const { mode = "date", showTime = false, status = "default", prefix, placeholder, allowClear = true, disabled = false, disabledDate, disabledTime, hideDisabledTimeOptions, defaultPickerDate, className, style, range } = props;
  const controlled = props.value !== undefined;
  const [singleInner, setSingleInner] = useState(() => range ? "" : (props as DatePickerProps).defaultValue ?? "");
  const [rangeInner, setRangeInner] = useState<readonly string[]>(() => range ? (props as DateRangePickerProps).defaultValue ?? [] : []);
  const single = range ? "" : controlled ? String((props as DatePickerProps).value ?? "") : singleInner;
  const rangeValue = range ? controlled ? (props as DateRangePickerProps).value ?? [] : rangeInner : [];
  const [draftRange, setDraftRange] = useState<readonly string[]>(rangeValue);
  const [open, setOpen] = useState(false);
  const [activeRangeField, setActiveRangeField] = useState<"start" | "end">("start");
  const [pickerDate, setPickerDate] = useState(() => parsePickerDate(defaultPickerDate ?? single ?? rangeValue[0]));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => single ? parsePickerDate(single) : undefined);
  const [time, setTime] = useState({ hour: 0, minute: 0, second: 0 });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [popupPosition, setPopupPosition] = useState({ left: -10000, top: -10000, ready: false });
  const popupId = `qizhi-date-picker-${useId().replace(/:/g, "")}`;
  const ariaLabel = labelFor(mode, showTime, range);
  const hasValue = range ? rangeValue.length > 0 : !!single;
  const panels = range && !showTime ? 2 : 1;
  const updatePopupPosition = useCallback(() => {
    if (!open || !rootRef.current || !popupRef.current) return;
    const trigger = rootRef.current.getBoundingClientRect();
    const popup = popupRef.current.getBoundingClientRect();
    if (window.innerWidth <= 640 && (range || showTime)) {
      setPopupPosition({ left: 12, top: showTime ? 72 : 80, ready: true });
      return;
    }
    const left = Math.min(Math.max(trigger.left, 8), Math.max(8, window.innerWidth - popup.width - 8));
    const below = trigger.bottom + 4;
    const top = below + popup.height <= window.innerHeight - 8 ? below : Math.max(8, trigger.top - popup.height - 4);
    setPopupPosition({ left, top, ready: true });
  }, [open, range, showTime]);
  useEffect(() => {
    if (!open) return;
    const close = (event: globalThis.MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  useLayoutEffect(() => {
    updatePopupPosition();
  }, [pickerDate, updatePopupPosition]);
  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", updatePopupPosition);
    window.addEventListener("scroll", updatePopupPosition, true);
    return () => {
      window.removeEventListener("resize", updatePopupPosition);
      window.removeEventListener("scroll", updatePopupPosition, true);
    };
  }, [open, updatePopupPosition]);
  const commitSingle = (next: string) => { if (!controlled) setSingleInner(next); (props as DatePickerProps).onChange?.(next); };
  const commitRange = (next: [string, string] | []) => { if (!controlled) setRangeInner(next); (props as DateRangePickerProps).onChange?.(next); };
  const select = (date: Date) => {
    const formatted = formatDate(date, mode);
    setSelectedDate(date);
    if (range) {
      if (draftRange.length !== 1) { setDraftRange([formatted]); setActiveRangeField("end"); return; }
      const normalized = [draftRange[0], formatted].sort() as [string, string];
      setDraftRange(normalized);
      setActiveRangeField("start");
      if (!showTime) { commitRange(normalized); setOpen(false); }
      return;
    }
    if (showTime) return;
    commitSingle(formatted); setOpen(false);
  };
  const confirm = () => {
    const suffix = ` ${[time.hour, time.minute, time.second].map(pad).join(":")}`;
    if (range) {
      if (draftRange.length !== 2) return;
      commitRange([`${draftRange[0]}${suffix}`, `${draftRange[1]}${suffix}`]);
    } else if (selectedDate) commitSingle(`${dateValue(selectedDate)}${suffix}`);
    else return;
    setOpen(false);
  };
  const clear = (event: ReactMouseEvent) => { event.stopPropagation(); if (range) { setDraftRange([]); setActiveRangeField("start"); commitRange([]); } else commitSingle(""); setOpen(false); };
  const openWithKeyboard = (event: KeyboardEvent<HTMLInputElement>) => { if (disabled) return; if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen(true); } if (event.key === "Escape") setOpen(false); };
  const handleControlClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const target = event.target as HTMLElement;
    if (target.closest(".qizhi-date-picker__popup")) return;
    if (target.closest(".qizhi-date-picker__clear")) return;
    const rangeInput = target.closest("[data-date-picker-start], [data-date-picker-end]");
    if (rangeInput?.hasAttribute("data-date-picker-end")) setActiveRangeField("end");
    if (rangeInput?.hasAttribute("data-date-picker-start")) setActiveRangeField("start");
    if (range && rangeInput) setOpen(true);
    else setOpen((current) => !current);
  };
  const inputCommon = { readOnly: true, disabled, role: "combobox", "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": popupId, "aria-invalid": status === "error" || undefined, onKeyDown: openWithKeyboard } as const;
  const popup = open ? createPortal(<div ref={popupRef} id={popupId} className={join("qizhi-date-picker__popup", range && "qizhi-date-picker__popup--range", showTime && "qizhi-date-picker__popup--time")} role="dialog" aria-label={ariaLabel} style={{ left: popupPosition.left, top: popupPosition.top, visibility: popupPosition.ready ? "visible" : "hidden" }} onMouseDown={(event) => event.stopPropagation()}><div className="qizhi-date-picker__main"><div className="qizhi-date-picker__panels">{Array.from({ length: panels }, (_, index) => <CalendarPanel key={index} pickerDate={addMonths(pickerDate, index)} mode={mode} value={single} range={draftRange} disabledDate={disabledDate} side={panels === 1 ? "single" : index === 0 ? "left" : "right"} onNavigate={(next) => setPickerDate(index === 0 ? next : addMonths(next, -1))} onSelect={select} />)}</div>{showTime ? <div className="qizhi-date-picker__time"><TimePanel title="选择时间" value={time} disabled={disabledTime?.(selectedDate, range ? draftRange.length === 1 ? "start" : "end" : undefined)} hideDisabled={hideDisabledTimeOptions} onChange={setTime} /></div> : null}</div>{showTime ? <footer><Button type="text" size="small" onClick={() => { const now = new Date(); setSelectedDate(now); setPickerDate(new Date(now.getFullYear(), now.getMonth(), 1)); setTime({ hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds() }); }}>此刻</Button><Button type="primary" size="small" onClick={confirm}>确认</Button></footer> : mode === "date" || mode === "week" ? <footer><Button type="text" size="small" onClick={() => select(new Date())}>今天</Button></footer> : null}</div>, document.body) : null;
  const rangePlaceholders = range ? (props as DateRangePickerProps).placeholders : undefined;
  return <div ref={rootRef} data-testid="qizhi-date-picker" data-status={status} aria-disabled={disabled || undefined} className={controlContainerClassName("qizhi-date-picker", range && "qizhi-date-picker--range", showTime && "qizhi-date-picker--time", status !== "default" && `qizhi-date-picker--${status}`, hasValue && "has-value", open && "is-open", disabled && "is-disabled", className)} style={style} onClick={handleControlClick}>
    {prefix != null ? <div className="qizhi-date-picker__prefix" aria-hidden="true">{prefix}</div> : null}
    {range ? <>
      <div className={join("qizhi-date-picker__input-wrap", activeRangeField === "start" && "is-active")} data-date-picker-input-wrap="start"><input {...inputCommon} className="qizhi-date-picker__input" data-date-picker-start aria-label={ariaLabel} value={rangeValue[0] ?? ""} placeholder={rangePlaceholders?.[0] ?? placeholder ?? "开始日期"} /></div>
      <span className="qizhi-date-picker__separator" aria-hidden="true">-</span>
      <div className={join("qizhi-date-picker__input-wrap", activeRangeField === "end" && "is-active")} data-date-picker-input-wrap="end"><input {...inputCommon} className="qizhi-date-picker__input" data-date-picker-end aria-label={`${ariaLabel}结束`} value={rangeValue[1] ?? ""} placeholder={rangePlaceholders?.[1] ?? "结束日期"} /></div>
    </> : <div className="qizhi-date-picker__input-wrap"><input {...inputCommon} className="qizhi-date-picker__input" aria-label={ariaLabel} value={single} placeholder={placeholder ?? defaultPlaceholder(mode, showTime)} /></div>}
    <button type="button" className="qizhi-date-picker__clear" aria-label={range ? "清空日期范围" : "清空日期"} disabled={disabled} hidden={!allowClear || !hasValue} onMouseDown={(event) => event.preventDefault()} onClick={clear}><CloseIcon /></button>
    <div className="qizhi-date-picker__suffix" aria-hidden="true"><CalendarIcon /></div>
    {popup}
  </div>;
}

function DatePickerBase(props: DatePickerProps) { return <DatePickerInternal {...props} range={false} />; }
function RangePicker(props: DateRangePickerProps) { return <DatePickerInternal {...props} range />; }
export const DatePicker = Object.assign(DatePickerBase, { RangePicker }) as DatePickerComponent;
