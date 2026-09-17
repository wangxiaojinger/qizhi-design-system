import type { KeyboardEvent, ReactNode } from "react";

type DemoSegmentedValue = string | number;

export interface DemoSegmentedOption<T extends DemoSegmentedValue> {
  label: ReactNode;
  value: T;
  disabled?: boolean;
}

export interface DemoSegmentedControlProps<T extends DemoSegmentedValue> {
  value: T;
  options: readonly (T | DemoSegmentedOption<T>)[];
  onChange: (value: T) => void;
  "aria-label": string;
  className?: string;
}

const normalizeOption = <T extends DemoSegmentedValue>(option: T | DemoSegmentedOption<T>): DemoSegmentedOption<T> => (
  typeof option === "object" ? option : { label: String(option), value: option }
);

export function DemoSegmentedControl<T extends DemoSegmentedValue>({
  value,
  options,
  onChange,
  "aria-label": ariaLabel,
  className,
}: DemoSegmentedControlProps<T>) {
  const normalizedOptions = options.map(normalizeOption<T>);

  const moveSelection = (event: KeyboardEvent<HTMLButtonElement>, index: number, direction: 1 | -1) => {
    event.preventDefault();
    let nextIndex = index;
    do {
      nextIndex = (nextIndex + direction + normalizedOptions.length) % normalizedOptions.length;
    } while (normalizedOptions[nextIndex]?.disabled && nextIndex !== index);
    const nextOption = normalizedOptions[nextIndex];
    if (!nextOption || nextOption.disabled) return;
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(".qizhi-segmented-item")[nextIndex]?.focus();
    onChange(nextOption.value);
  };

  return (
    <div className={["qizhi-segmented", className].filter(Boolean).join(" ")} role="radiogroup" aria-label={ariaLabel}>
      {normalizedOptions.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={active}
            className={`qizhi-segmented-item${active ? " is-active" : ""}`}
            disabled={option.disabled}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") moveSelection(event, index, 1);
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") moveSelection(event, index, -1);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
