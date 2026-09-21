import {
  createContext,
  useContext,
  useId,
  useState,
} from "react";
import type { KeyboardEvent } from "react";
import type {
  ChoiceCardGroupProps,
  ChoiceCardProps,
  ChoiceCardSize,
  ChoiceCardValue,
} from "./ChoiceCard.types";
import "./choiceCard.css";

interface ChoiceCardContextValue {
  value: ChoiceCardValue | undefined;
  name: string;
  size: ChoiceCardSize;
  select: (value: ChoiceCardValue) => void;
}

const ChoiceCardContext = createContext<ChoiceCardContextValue | null>(null);
const names = (...values: Array<string | false | undefined>) => (
  values.filter(Boolean).join(" ")
);

export function ChoiceCardGroup({
  children,
  value,
  defaultValue,
  size = "default",
  columns = 3,
  onChange,
  className,
  onKeyDown,
  ...rest
}: ChoiceCardGroupProps) {
  const generatedName = useId().replace(/:/g, "");
  const controlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<ChoiceCardValue | undefined>(
    defaultValue,
  );
  const currentValue = controlled ? value : innerValue;
  const select = (nextValue: ChoiceCardValue) => {
    if (!controlled) setInnerValue(nextValue);
    onChange?.(nextValue);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || ![
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ].includes(event.key)) return;
    const inputs = [...event.currentTarget.querySelectorAll<HTMLInputElement>(
      'input[type="radio"]:not(:disabled)',
    )];
    if (!inputs.length) return;
    const activeIndex = Math.max(0, inputs.indexOf(event.target as HTMLInputElement));
    const direction = ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1;
    const target = inputs[(activeIndex + direction + inputs.length) % inputs.length];
    event.preventDefault();
    target.focus();
    target.click();
  };

  return (
    <ChoiceCardContext.Provider value={{
      value: currentValue,
      name: `qizhi-choice-card-${generatedName}`,
      size,
      select,
    }}>
      <div
        {...rest}
        className={names(
          "qizhi-choice-card-group",
          `qizhi-choice-card-group--${size}`,
          `qizhi-choice-card-group--columns-${columns}`,
          className,
        )}
        role="radiogroup"
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </ChoiceCardContext.Provider>
  );
}

export function ChoiceCard({
  value,
  title,
  description,
  icon,
  disabled = false,
  className,
}: ChoiceCardProps) {
  const group = useContext(ChoiceCardContext);
  if (!group) throw new Error("ChoiceCard must be used inside ChoiceCardGroup");
  const selected = group.value === value;
  return (
    <label
      className={names(
        "qizhi-choice-card",
        selected && "is-selected",
        disabled && "is-disabled",
        Boolean(icon) && "qizhi-choice-card--icon",
        className,
      )}
    >
      <input
        type="radio"
        name={group.name}
        value={value}
        checked={selected}
        disabled={disabled}
        onChange={(event) => {
          if (event.currentTarget.checked && !disabled) group.select(value);
        }}
      />
      {icon ? <span className="qizhi-choice-card__icon" aria-hidden="true">{icon}</span> : null}
      <span className="qizhi-choice-card__content">
        <span className="qizhi-choice-card__title">{title}</span>
        {description ? (
          <span className="qizhi-choice-card__description">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
