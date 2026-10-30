import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { controlContainerClassName } from "../control-container/controlContainer";
import { TimeIcon } from "../icon/generated/catalog/TimeIcon";
import {
  constrainFloatingCoordinates,
  getFloatingCoordinates,
} from "../overlay/floatingPosition";
import { TimePanel, type TimeParts } from "./TimePanel";
import { Button } from "../button/Button";
import { CloseIcon } from "../icon";
import type {
  TimePickerComponent,
  TimePickerFormat,
  TimePickerProps,
  TimeRangePickerProps,
} from "./TimePicker.types";
import "./timePicker.css";

const pad = (value: number) => String(value).padStart(2, "0");
const parseTime = (value: string | undefined): TimeParts => {
  const [hour = "0", minute = "0", second = "0"] = value?.split(":") ?? [];
  return {
    hour: Math.min(23, Math.max(0, Number(hour) || 0)),
    minute: Math.min(59, Math.max(0, Number(minute) || 0)),
    second: Math.min(59, Math.max(0, Number(second) || 0)),
  };
};
const formatTime = (value: TimeParts, format: TimePickerFormat) => (
  format === "HH:mm"
    ? `${pad(value.hour)}:${pad(value.minute)}`
    : `${pad(value.hour)}:${pad(value.minute)}:${pad(value.second)}`
);
const join = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(" ");

type InternalProps = (TimePickerProps | TimeRangePickerProps) & { range: boolean };

const TimePickerInternal = forwardRef<HTMLDivElement, InternalProps>(function TimePickerInternal(
  props,
  ref,
) {
  const {
    format = "HH:mm:ss",
    step,
    size = "default",
    status = "default",
    disabled = false,
    allowClear = true,
    needConfirm = false,
    disabledTime,
    hideDisabledOptions = false,
    className,
    style,
    range,
    "aria-label": ariaLabel,
  } = props;
  const controlled = props.value !== undefined;
  const [singleInner, setSingleInner] = useState(() => range
    ? ""
    : (props as TimePickerProps).defaultValue ?? "");
  const [rangeInner, setRangeInner] = useState<readonly string[]>(() => range
    ? (props as TimeRangePickerProps).defaultValue ?? []
    : []);
  const single = range
    ? ""
    : controlled
      ? String((props as TimePickerProps).value ?? "")
      : singleInner;
  const rangeValue = range
    ? controlled
      ? (props as TimeRangePickerProps).value ?? []
      : rangeInner
    : [];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<readonly string[]>([]);
  const displayValues = needConfirm && open ? draft : range ? rangeValue : [single];
  const [activeField, setActiveField] = useState<"start" | "end">("start");
  useEffect(() => { setDraft(range ? [...rangeValue] : [single]); }, [single, JSON.stringify(rangeValue), range]);
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLInputElement | null>(null);
  const popupId = `qizhi-time-picker-${useId().replace(/:/g, "")}`;
  const [popupStyle, setPopupStyle] = useState({ left: -10000, top: -10000, width: 194 });
  const currentFieldValue = range
    ? (activeField === "start" ? displayValues[0] : displayValues[1]) ?? ""
    : displayValues[0] ?? "";
  const value = parseTime(currentFieldValue);

  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };
  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  };
  const blurWithin = (event: React.FocusEvent<HTMLElement>) => {
    const inside = (target: EventTarget | null) => target instanceof Node && (!!rootRef.current?.contains(target) || !!popupRef.current?.contains(target));
    if (inside(event.relatedTarget)) return;
    if (event.relatedTarget) close();
    else queueMicrotask(() => { if (!inside(document.activeElement)) close(); });
  };
  const updatePopupPosition = useCallback(() => {
    if (!rootRef.current || !popupRef.current) return;
    const trigger = rootRef.current.getBoundingClientRect();
    const popup = popupRef.current.getBoundingClientRect();
    const gap = 4;
    const viewportMargin = 8;
    const spaceBelow = window.innerHeight - trigger.bottom - viewportMargin;
    const spaceAbove = trigger.top - viewportMargin;
    const position = spaceBelow >= popup.height + gap || spaceBelow >= spaceAbove
      ? "bottomLeft"
      : "topLeft";
    const coordinates = constrainFloatingCoordinates(
      getFloatingCoordinates(trigger, popup, position, gap),
      popup,
    );
    const next = { ...coordinates, width: trigger.width };
    setPopupStyle((current) => (
      current.left === next.left &&
      current.top === next.top &&
      current.width === next.width
        ? current
        : next
    ));
  }, []);
  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);
  useLayoutEffect(() => {
    if (!open) return;
    updatePopupPosition();
  }, [activeField, format, open, updatePopupPosition]);
  useEffect(() => {
    if (!open) return;
    const handleViewportChange = () => updatePopupPosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(handleViewportChange);
    if (rootRef.current) observer?.observe(rootRef.current);
    if (popupRef.current) observer?.observe(popupRef.current);
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      observer?.disconnect();
    };
  }, [open, updatePopupPosition]);

  const commitSingle = (next: string) => {
    if (!controlled) setSingleInner(next);
    (props as TimePickerProps).onChange?.(next);
  };
  const commitRange = (next: [string, string]) => {
    if ((props as TimeRangePickerProps).order !== false && next[0] && next[1]) next = [...next].sort() as [string, string];
    if (next[0] && next[1] && (!isAllowed(next[0], "start") || !isAllowed(next[1], "end"))) return;
    if (!controlled) setRangeInner(next);
    (props as TimeRangePickerProps).onChange?.(next);
  };
  const choose = (nextParts: TimeParts) => {
    const nextValue = formatTime(nextParts, format);
    if (!isAllowed(nextValue, range ? activeField : undefined)) return;
    if (needConfirm) {
      const next = [...displayValues];
      next[range && activeField === "end" ? 1 : 0] = nextValue;
      setDraft(next);
      return;
    }
    if (!range) {
      commitSingle(nextValue);
      return;
    }
    const next: [string, string] = [rangeValue[0] ?? "", rangeValue[1] ?? ""];
    next[activeField === "start" ? 0 : 1] = nextValue;
    commitRange(next);
  };
  const openField = (field: "start" | "end", input: HTMLInputElement) => {
    if (disabled) return;
    triggerRef.current = input;
    if (!open) setDraft(range ? [...rangeValue] : [single]);
    setActiveField(field);
    if (range) setOpen(true);
    else setOpen((current) => !current);
  };
  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    field: "start" | "end",
  ) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      triggerRef.current = event.currentTarget;
      if (!open) setDraft(range ? [...rangeValue] : [single]);
      setActiveField(field);
      setOpen(true);
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close(true);
    }
  };
  const inputProps = {
    readOnly: true,
    disabled,
    role: "combobox",
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    "aria-controls": popupId,
    "aria-invalid": status === "error" || undefined,
  } as const;
  const placeholders = range
    ? (props as TimeRangePickerProps).placeholders ?? ["开始时间", "结束时间"]
    : undefined;
  const label = ariaLabel ?? (range ? "选择时间范围" : "选择时间");
  const isAllowed = (candidate: string, field?: "start" | "end") => {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(candidate)) return false;
    const parts = parseTime(candidate);
    const limits = disabledTime?.(candidate, field);
    return !limits?.disabledHours?.includes(parts.hour) && !limits?.disabledMinutes?.includes(parts.minute) && (format === "HH:mm" || !limits?.disabledSeconds?.includes(parts.second));
  };
  const confirmationValues = range && (props as TimeRangePickerProps).order !== false ? [...draft].sort() : draft;
  const canConfirm = range ? isAllowed(confirmationValues[0] ?? "", "start") && isAllowed(confirmationValues[1] ?? "", "end") : isAllowed(draft[0] ?? "");

  const popup = open ? createPortal(
    <div
      ref={popupRef}
      id={popupId}
      role="dialog"
      aria-label={label}
      className="qizhi-time-picker__popup"
      onBlur={blurWithin}
      style={{ ...popupStyle, visibility: popupStyle.left < 0 ? "hidden" : "visible" }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); } }}
    >
      <TimePanel
        value={value}
        format={format}
        step={step}
        disabled={disabledTime?.(currentFieldValue, range ? activeField : undefined)}
        hideDisabled={hideDisabledOptions}
        onChange={choose}
      />
      {needConfirm ? <footer><Button type="primary" size="small" disabled={!canConfirm} onClick={() => { if (!canConfirm) return; if (range) commitRange([draft[0], draft[1]]); else commitSingle(draft[0]); close(true); }}>确认</Button></footer> : null}
    </div>,
    document.body,
  ) : null;

  return (
    <div
      ref={setRootRef}
      data-testid="qizhi-time-picker"
      onBlur={blurWithin}
      data-status={status}
      className={controlContainerClassName(
        "qizhi-time-picker",
        range && "qizhi-time-picker--range",
        `qizhi-time-picker--${size}`,
        status !== "default" && `qizhi-time-picker--${status}`,
        disabled && "qizhi-time-picker--disabled",
        open && "is-open",
        className,
      )}
      style={style}
    >
      {range ? (
        <>
          <span className={join("qizhi-time-picker__input-wrap", open && activeField === "start" && "is-active")}>
            <input
              {...inputProps}
              className="qizhi-time-picker__input"
              aria-label={placeholders?.[0]}
              placeholder={placeholders?.[0]}
              value={displayValues[0] ?? ""}
              onClick={(event) => openField("start", event.currentTarget)}
              onKeyDown={(event) => handleKeyDown(event, "start")}
            />
          </span>
          <span className="qizhi-time-picker__separator" aria-hidden="true">-</span>
          <span className={join("qizhi-time-picker__input-wrap", open && activeField === "end" && "is-active")}>
            <input
              {...inputProps}
              className="qizhi-time-picker__input"
              aria-label={placeholders?.[1]}
              placeholder={placeholders?.[1]}
              value={displayValues[1] ?? ""}
              onClick={(event) => openField("end", event.currentTarget)}
              onKeyDown={(event) => handleKeyDown(event, "end")}
            />
          </span>
        </>
      ) : (
        <span className="qizhi-time-picker__input-wrap">
          <input
            {...inputProps}
            className="qizhi-time-picker__input"
            aria-label={label}
            placeholder={(props as TimePickerProps).placeholder ?? "请选择时间"}
            value={displayValues[0] ?? ""}
            onClick={(event) => openField("start", event.currentTarget)}
            onKeyDown={(event) => handleKeyDown(event, "start")}
          />
        </span>
      )}
      <span className="qizhi-time-picker__suffix" aria-hidden="true"><TimeIcon /></span>
      {allowClear && !disabled && (range ? rangeValue.length > 0 : !!single) ? <button type="button" className="qizhi-time-picker__clear" aria-label="清空时间" onClick={(event) => { event.stopPropagation(); if (range) { if (!controlled) setRangeInner([]); (props as TimeRangePickerProps).onChange?.([]); } else commitSingle(""); setDraft([]); close(); }}><CloseIcon /></button> : null}
      {popup}
    </div>
  );
});

const TimePickerBase = forwardRef<HTMLDivElement, TimePickerProps>(function TimePickerBase(
  props,
  ref,
) {
  return <TimePickerInternal {...props} ref={ref} range={false} />;
});
const TimeRangePicker = forwardRef<HTMLDivElement, TimeRangePickerProps>(function TimeRangePicker(
  props,
  ref,
) {
  return <TimePickerInternal {...props} ref={ref} range />;
});

export const TimePicker = Object.assign(TimePickerBase, {
  RangePicker: TimeRangePicker,
}) as TimePickerComponent;
