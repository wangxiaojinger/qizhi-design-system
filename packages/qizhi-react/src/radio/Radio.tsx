import { createContext, forwardRef, useContext, useId, useState } from "react";
import type { ChangeEvent } from "react";
import type {
  RadioComponent,
  RadioGroupProps,
  RadioOption,
  RadioProps,
  RadioSize,
  RadioType,
  RadioValue,
} from "./Radio.types";

interface RadioGroupContextValue {
  value: RadioValue | undefined;
  disabled: boolean;
  type: RadioType;
  size: RadioSize;
  name: string;
  select: (value: RadioValue, event: ChangeEvent<HTMLInputElement>) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

const joinClassNames = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(" ");

const RadioBase = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    children,
    value,
    checked,
    defaultChecked = false,
    disabled = false,
    type = "radio",
    size = "default",
    onChange,
    className,
    style,
    name,
    ...inputProps
  },
  ref,
) {
  const group = useContext(RadioGroupContext);
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const resolvedType = group?.type ?? type;
  const resolvedSize = group?.size ?? size;
  const resolvedDisabled = group?.disabled || disabled;
  const resolvedChecked = group ? group.value === value : isControlled ? checked : internalChecked;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (resolvedDisabled) return;
    if (group && value !== undefined) group.select(value, event);
    if (!group && !isControlled) setInternalChecked(event.currentTarget.checked);
    onChange?.(event.currentTarget.checked, value, event);
  };

  const rootClassName = resolvedType === "button"
    ? joinClassNames(
      "qizhi-radio-button",
      `qizhi-radio-size-${resolvedSize}`,
      resolvedChecked && "qizhi-radio-checked",
      resolvedDisabled && "qizhi-radio-disabled",
      className,
    )
    : joinClassNames(
      "qizhi-radio",
      resolvedChecked && "qizhi-radio-checked",
      resolvedDisabled && "qizhi-radio-disabled",
      className,
    );

  return (
    <label className={rootClassName} style={style} aria-disabled={resolvedDisabled || undefined}>
      <input
        {...inputProps}
        ref={ref}
        type="radio"
        name={group?.name ?? name}
        value={value}
        checked={resolvedChecked}
        disabled={resolvedDisabled}
        onChange={handleChange}
      />
      {resolvedType === "radio" ? (
        <span className="qizhi-radio-mask-wrapper" aria-hidden="true"><span className="qizhi-radio-mask" /></span>
      ) : null}
      <span className={resolvedType === "button" ? "qizhi-radio-button-inner" : "qizhi-radio-text"}>{children}</span>
    </label>
  );
});

const normalizeOption = (option: RadioValue | RadioOption): RadioOption => (
  typeof option === "object" ? option : { label: String(option), value: option }
);

function RadioGroup({
  children,
  options,
  value,
  defaultValue,
  disabled = false,
  type = "radio",
  size = "default",
  name,
  onChange,
  className,
  ...rootProps
}: RadioGroupProps) {
  const generatedName = useId();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<RadioValue | undefined>(defaultValue);
  const currentValue = isControlled ? value : internalValue;

  const select = (nextValue: RadioValue, event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(nextValue);
    onChange?.(nextValue, event);
  };

  const context: RadioGroupContextValue = {
    value: currentValue,
    disabled,
    type,
    size,
    name: name ?? `qizhi-radio-${generatedName.replace(/:/g, "")}`,
    select,
  };

  const rootClassName = joinClassNames(
    "qizhi-radio-group",
    type === "radio" && "radio-demo-row",
    type === "button" && "qizhi-radio-group-type-button radio-button-demo",
    type === "button" && `qizhi-radio-size-${size}`,
    className,
  );

  const content = children ?? options?.map((rawOption) => {
    const option = normalizeOption(rawOption);
    return <RadioBase key={String(option.value)} value={option.value} disabled={option.disabled}>{option.label}</RadioBase>;
  });

  return (
    <RadioGroupContext.Provider value={context}>
      <div {...rootProps} className={rootClassName} role="radiogroup">{content}</div>
    </RadioGroupContext.Provider>
  );
}

export const Radio = Object.assign(RadioBase, { Group: RadioGroup }) as RadioComponent;
