import { useId, useState } from "react";
import type { SegmentedProps, SegmentedValue } from "./Segmented.types";

export function Segmented({
  options,
  value,
  defaultValue,
  name,
  disabled = false,
  onChange,
  className,
  ...rest
}: SegmentedProps) {
  const generated = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value === undefined ? internal : value;
  const select = (next: SegmentedValue) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };
  return (
    <div
      {...rest}
      className={["qizhi-segmented", className].filter(Boolean).join(" ")}
      role="radiogroup"
    >
      {options.map((option) => (
        <label
          key={String(option.value)}
          className={[
            "qizhi-segmented-item",
            current === option.value && "is-active",
            (disabled || option.disabled) && "is-disabled",
          ].filter(Boolean).join(" ")}
        >
          <input
            type="radio"
            name={name ?? `qizhi-segmented-${generated}`}
            value={option.value}
            checked={current === option.value}
            disabled={disabled || option.disabled}
            onChange={() => select(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
