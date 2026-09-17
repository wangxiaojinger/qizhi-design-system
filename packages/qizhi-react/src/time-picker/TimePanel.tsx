import type { KeyboardEvent } from "react";
import type { DisabledTimeConfig } from "../date-picker/DatePicker.types";
import type { TimePickerFormat, TimePickerStep } from "./TimePicker.types";
import "./timePanel.css";

export interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}

interface TimePanelProps {
  value: TimeParts;
  format?: TimePickerFormat;
  step?: TimePickerStep;
  disabled?: DisabledTimeConfig;
  hideDisabled?: boolean;
  title?: string;
  onChange: (value: TimeParts) => void;
}

const pad = (value: number) => String(value).padStart(2, "0");
const safeStep = (value?: number) => Math.max(1, Math.floor(value ?? 1));

export function TimePanel({
  value,
  format = "HH:mm:ss",
  step = {},
  disabled = {},
  hideDisabled = false,
  title,
  onChange,
}: TimePanelProps) {
  const columns: Array<{
    key: keyof TimeParts;
    label: string;
    max: number;
    step: number;
    disabled?: readonly number[];
  }> = [
    { key: "hour", label: "时", max: 23, step: safeStep(step.hour), disabled: disabled.disabledHours },
    { key: "minute", label: "分", max: 59, step: safeStep(step.minute), disabled: disabled.disabledMinutes },
  ];
  if (format === "HH:mm:ss") {
    columns.push({
      key: "second",
      label: "秒",
      max: 59,
      step: safeStep(step.second),
      disabled: disabled.disabledSeconds,
    });
  }

  const choose = (key: keyof TimeParts, option: number) => onChange({ ...value, [key]: option });
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    options: readonly number[],
    index: number,
    key: keyof TimeParts,
  ) => {
    const nextIndex = event.key === "ArrowDown" || event.key === "ArrowRight"
      ? Math.min(options.length - 1, index + 1)
      : event.key === "ArrowUp" || event.key === "ArrowLeft"
        ? Math.max(0, index - 1)
        : null;
    if (nextIndex != null) {
      event.preventDefault();
      const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=option]");
      buttons?.[nextIndex]?.focus();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(key, options[index]);
    }
  };

  return (
    <section className="qizhi-time-panel">
      {title ? <h3>{title}</h3> : null}
      <div className="qizhi-time-panel__columns">
        {columns.map((column) => {
          const options = Array.from(
            { length: Math.floor(column.max / column.step) + 1 },
            (_, index) => index * column.step,
          );
          return (
            <div key={column.key} className="qizhi-time-panel__column">
              <span className="qizhi-time-panel__column-title">{column.label}</span>
              <div role="listbox" aria-label={column.label} className="qizhi-time-panel__options">
                {options.map((option, index) => {
                  const unavailable = column.disabled?.includes(option) ?? false;
                  if (hideDisabled && unavailable) return null;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="option"
                      aria-label={pad(option)}
                      aria-selected={value[column.key] === option}
                      disabled={unavailable}
                      onClick={() => choose(column.key, option)}
                      onKeyDown={(event) => handleKeyDown(event, options, index, column.key)}
                    >
                      {pad(option)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
