import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Tooltip } from "../tooltip/Tooltip";
import type { TooltipPosition } from "../tooltip/Tooltip.types";
import type { SliderProps } from "./Slider.types";
import "./slider.css";

const decimals = (value: number) => {
  const text = String(value);
  return text.includes(".") ? text.length - text.indexOf(".") - 1 : 0;
};

const normalizeNumber = (value: number, min: number, max: number, step: number) => {
  const safe = Number.isFinite(value) ? value : min;
  const stepped = min + Math.round((safe - min) / step) * step;
  return Number(Math.min(max, Math.max(min, stepped)).toFixed(decimals(step)));
};

type RuntimeValue = number | number[];

interface SliderRuntimeProps {
  value?: RuntimeValue;
  defaultValue?: RuntimeValue;
  onChange?: (value: RuntimeValue) => void;
  onChangeComplete?: (value: RuntimeValue) => void;
  min?: number;
  max?: number;
  step?: number;
  range?: boolean | { draggableBar?: boolean };
  multiple?: boolean;
  vertical?: boolean;
  disabled?: boolean;
  marks?: Record<number, React.ReactNode>;
  tooltipVisible?: boolean;
  tooltipPosition?: TooltipPosition;
  formatterTooltip?: (value: number) => React.ReactNode;
  getPopupContainer?: (trigger: HTMLElement) => Element;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

const normalizeValue = (
  value: RuntimeValue,
  min: number,
  max: number,
  step: number,
): RuntimeValue => Array.isArray(value)
  ? value.map((item) => normalizeNumber(item, min, max, step)).sort((a, b) => a - b)
  : normalizeNumber(value, min, max, step);

const asArray = (value: RuntimeValue) => Array.isArray(value) ? value : [value];

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(baseProps, ref) {
  const {
    value,
    defaultValue,
    onChange,
    onChangeComplete,
    min = 0,
    max = 100,
    step = 1,
    range = false,
    multiple = false,
    vertical = false,
    disabled = false,
    marks,
    tooltipVisible,
    tooltipPosition,
    formatterTooltip = (nextValue) => String(nextValue),
    getPopupContainer,
    className,
    style,
    "aria-label": ariaLabel = "滑动输入条",
  } = baseProps as SliderRuntimeProps;
  const controlled = value !== undefined;
  const modeDefault = range
    ? [min, min]
    : multiple
      ? [min, min, min]
      : min;
  const [innerValue, setInnerValue] = useState<RuntimeValue>(() =>
    normalizeValue(defaultValue ?? modeDefault, min, max, step));
  const currentValue = normalizeValue(
    controlled ? value : innerValue,
    min,
    max,
    step,
  );
  const values = asArray(currentValue);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const latestValueRef = useRef<RuntimeValue>(currentValue);
  latestValueRef.current = currentValue;
  const span = max - min;

  const commit = (nextValue: RuntimeValue) => {
    const normalized = normalizeValue(nextValue, min, max, step);
    latestValueRef.current = normalized;
    if (!controlled) setInnerValue(normalized);
    onChange?.(normalized);
    return normalized;
  };
  const complete = () => onChangeComplete?.(latestValueRef.current);

  const percent = (nextValue: number) => span === 0 ? 0 : ((nextValue - min) / span) * 100;
  const valueFromPointer = (clientX: number, clientY: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return min;
    const ratio = vertical
      ? (rect.height ? (rect.bottom - clientY) / rect.height : 0)
      : (rect.width ? (clientX - rect.left) / rect.width : 0);
    return normalizeNumber(min + Math.min(1, Math.max(0, ratio)) * span, min, max, step);
  };
  const closestIndex = (nextValue: number) => values.reduce((closest, item, index) =>
    Math.abs(item - nextValue) < Math.abs(values[closest] - nextValue) ? index : closest, 0);
  const setHandle = (index: number, nextValue: number) => {
    if (values.length === 1) commit(nextValue);
    else commit(values.map((item, currentIndex) => currentIndex === index ? nextValue : item));
  };
  const startHandleDrag = (index: number, event: ReactPointerEvent) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    const move = (moveEvent: PointerEvent) =>
      setHandle(index, valueFromPointer(moveEvent.clientX, moveEvent.clientY));
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      complete();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  };
  const handleTrackPointerDown = (event: ReactPointerEvent) => {
    if (disabled) return;
    const nextValue = valueFromPointer(event.clientX, event.clientY);
    const index = closestIndex(nextValue);
    setHandle(index, nextValue);
    startHandleDrag(index, event);
  };
  const draggable = typeof range === "object" && range.draggableBar && values.length === 2;
  const handleBarPointerDown = (event: ReactPointerEvent) => {
    if (!draggable || disabled) return;
    event.preventDefault();
    event.stopPropagation();
    const startPointer = vertical ? event.clientY : event.clientX;
    const start = [...values];
    const rangeSize = start[1] - start[0];
    const trackSize = vertical
      ? trackRef.current?.getBoundingClientRect().height
      : trackRef.current?.getBoundingClientRect().width;
    const move = (moveEvent: PointerEvent) => {
      if (!trackSize) return;
      const pointer = vertical ? moveEvent.clientY : moveEvent.clientX;
      const delta = (vertical ? startPointer - pointer : pointer - startPointer) / trackSize * span;
      const low = normalizeNumber(start[0] + delta, min, max - rangeSize, step);
      commit([low, low + rangeSize]);
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      complete();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  };
  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const current = values[index];
    const next = event.key === "ArrowRight" || event.key === "ArrowUp"
      ? current + step
      : event.key === "ArrowLeft" || event.key === "ArrowDown"
        ? current - step
        : event.key === "Home"
          ? min
          : event.key === "End"
            ? max
            : null;
    if (next === null) return;
    event.preventDefault();
    setHandle(index, next);
    complete();
  };
  const startPercent = values.length > 1 ? percent(values[0]) : 0;
  const endPercent = percent(values[values.length - 1]);
  const markEntries = useMemo(() => Object.entries(marks ?? {})
    .map(([mark, label]) => ({ value: Number(mark), label })), [marks]);
  const rootClassName = [
    "qizhi-slider",
    vertical && "qizhi-slider--vertical",
    disabled && "qizhi-slider--disabled",
    marks && "qizhi-slider--with-marks",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={rootClassName} style={style}>
      <div className="qizhi-slider__wrapper">
        <div
          ref={trackRef}
          className="qizhi-slider__track"
          data-testid="slider-track"
          onPointerDown={handleTrackPointerDown}
        >
          <div
            className={`qizhi-slider__bar${draggable ? " qizhi-slider__bar--draggable" : ""}`}
            data-testid="slider-bar"
            onPointerDown={handleBarPointerDown}
            style={vertical
              ? { bottom: `${startPercent}%`, top: `${100 - endPercent}%` }
              : { left: `${startPercent}%`, right: `${100 - endPercent}%` }}
          />
          {markEntries.map((mark) => (
            <span
              key={mark.value}
              className="qizhi-slider__mark"
              style={vertical
                ? { bottom: `${percent(mark.value)}%` }
                : { left: `${percent(mark.value)}%` }}
            >
              <span className={`qizhi-slider__dot${mark.value >= values[0] && mark.value <= values[values.length - 1] ? " is-active" : ""}`} />
              <span className="qizhi-slider__mark-label">{mark.label}</span>
            </span>
          ))}
          {values.map((item, index) => {
            const label = values.length > 1 ? `${ariaLabel} ${index + 1}` : ariaLabel;
            const button = (
              <button
                key={index}
                type="button"
                className="qizhi-slider__handle"
                role="slider"
                disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                aria-label={label}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={item}
                aria-valuetext={String(formatterTooltip(item))}
                aria-disabled={disabled}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPointerDown={(event) => startHandleDrag(index, event)}
                style={vertical
                  ? { bottom: `${percent(item)}%` }
                  : { left: `${percent(item)}%` }}
              />
            );
            return (
              <Tooltip
                key={index}
                content={formatterTooltip(item)}
                position={tooltipPosition ?? (vertical ? "right" : "top")}
                popupVisible={tooltipVisible}
                getPopupContainer={getPopupContainer}
              >
                {button}
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
});
