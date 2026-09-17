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
  const [activeField, setActiveField] = useState<"start" | "end">("start");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLInputElement | null>(null);
  const popupId = `qizhi-time-picker-${useId().replace(/:/g, "")}`;
  const [popupStyle, setPopupStyle] = useState({ left: -10000, top: -10000, width: 194 });
  const currentFieldValue = range
    ? (activeField === "start" ? rangeValue[0] : rangeValue[1]) ?? ""
    : single;
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
    if (!controlled) setRangeInner(next);
    (props as TimeRangePickerProps).onChange?.(next);
  };
  const choose = (nextParts: TimeParts) => {
    const nextValue = formatTime(nextParts, format);
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

  const popup = open ? createPortal(
    <div
      ref={popupRef}
      id={popupId}
      role="dialog"
      aria-label={label}
      className="qizhi-time-picker__popup"
      style={{ ...popupStyle, visibility: popupStyle.left < 0 ? "hidden" : "visible" }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <TimePanel
        value={value}
        format={format}
        step={step}
        onChange={choose}
      />
    </div>,
    document.body,
  ) : null;

  return (
    <div
      ref={setRootRef}
      data-testid="qizhi-time-picker"
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
              value={rangeValue[0] ?? ""}
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
              value={rangeValue[1] ?? ""}
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
            value={single}
            onClick={(event) => openField("start", event.currentTarget)}
            onKeyDown={(event) => handleKeyDown(event, "start")}
          />
        </span>
      )}
      <span className="qizhi-time-picker__suffix" aria-hidden="true"><TimeIcon /></span>
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
