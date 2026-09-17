import { createContext, forwardRef, useContext, useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type {
  CheckboxComponent,
  CheckboxGroupProps,
  CheckboxOption,
  CheckboxProps,
  CheckboxValue,
} from "./Checkbox.types";
import { CheckboxIndicator } from "./CheckboxIndicator";

interface CheckboxGroupContextValue {
  values: readonly CheckboxValue[];
  disabled: boolean;
  toggle: (value: CheckboxValue, checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);
const joinClassNames = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(" ");

const CheckboxBase = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    children,
    value,
    checked,
    defaultChecked = false,
    indeterminate = false,
    disabled = false,
    onChange,
    onFocus,
    onBlur,
    className,
    style,
    ...inputProps
  },
  forwardedRef,
) {
  const group = useContext(CheckboxGroupContext);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const resolvedDisabled = group?.disabled || disabled;
  const resolvedChecked = group && value !== undefined
    ? group.values.includes(value)
    : isControlled
      ? checked
      : internalChecked;

  useLayoutEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate, resolvedChecked]);

  const setRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (resolvedDisabled) return;
    const nextChecked = event.currentTarget.checked;
    if (group && value !== undefined) group.toggle(value, nextChecked, event);
    if (!group && !isControlled) setInternalChecked(nextChecked);
    onChange?.(nextChecked, event);
  };

  return (
    <label
      className={joinClassNames(
        "qizhi-checkbox",
        resolvedChecked && "qizhi-checkbox-checked",
        indeterminate && "qizhi-checkbox-indeterminate",
        resolvedDisabled && "qizhi-checkbox-disabled",
        className,
      )}
      style={style}
      aria-disabled={resolvedDisabled || undefined}
    >
      <input
        {...inputProps}
        ref={setRef}
        type="checkbox"
        value={value}
        checked={resolvedChecked}
        disabled={resolvedDisabled}
        aria-checked={indeterminate ? "mixed" : resolvedChecked}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <CheckboxIndicator checked={resolvedChecked} indeterminate={indeterminate} disabled={resolvedDisabled} />
      {children == null ? null : <span className="qizhi-checkbox-text">{children}</span>}
    </label>
  );
});

const normalizeOption = (option: CheckboxValue | CheckboxOption): CheckboxOption => (
  typeof option === "object" ? option : { label: String(option), value: option }
);

function CheckboxGroup({
  children,
  options,
  value,
  defaultValue = [],
  disabled = false,
  direction = "horizontal",
  onChange,
  className,
  ...rootProps
}: CheckboxGroupProps) {
  const isControlled = value !== undefined;
  const [internalValues, setInternalValues] = useState<CheckboxValue[]>([...defaultValue]);
  const currentValues = isControlled ? value : internalValues;

  const toggle = (nextValue: CheckboxValue, nextChecked: boolean, event: ChangeEvent<HTMLInputElement>) => {
    const nextValues = nextChecked
      ? currentValues.includes(nextValue) ? [...currentValues] : [...currentValues, nextValue]
      : currentValues.filter((item) => item !== nextValue);
    if (!isControlled) setInternalValues(nextValues);
    onChange?.(nextValues, event);
  };

  const content = children ?? options?.map((rawOption) => {
    const option = normalizeOption(rawOption);
    return <CheckboxBase key={String(option.value)} value={option.value} disabled={option.disabled}>{option.label}</CheckboxBase>;
  });

  return (
    <CheckboxGroupContext.Provider value={{ values: currentValues, disabled, toggle }}>
      <div
        {...rootProps}
        className={joinClassNames("qizhi-checkbox-group", `qizhi-checkbox-group--${direction}`, className)}
        role="group"
      >
        {content}
      </div>
    </CheckboxGroupContext.Provider>
  );
}

export const Checkbox = Object.assign(CheckboxBase, { Group: CheckboxGroup }) as CheckboxComponent;
