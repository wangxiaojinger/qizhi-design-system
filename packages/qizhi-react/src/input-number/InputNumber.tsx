import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { controlContainerClassName } from "../control-container/controlContainer";
import { AddIcon } from "../icon/AddIcon";
import { ArrowDownIcon } from "../icon/generated/ArrowDownIcon";
import { ArrowUpIcon } from "../icon/generated/ArrowUpIcon";
import { MinusIcon } from "../icon/generated/catalog/MinusIcon";
import type { InputNumberProps, InputNumberValue } from "./InputNumber.types";
import "./inputNumber.css";

const decimalPlaces = (value: InputNumberValue | undefined) => {
  if (value == null) return 0;
  const text = String(value).toLowerCase();
  if (text.includes("e-")) return Number(text.split("e-")[1]) || 0;
  return text.includes(".") ? text.split(".")[1].length : 0;
};

const cleanNumericText = (value: InputNumberValue | undefined) =>
  value == null ? "" : String(value).replaceAll(",", "").trim();

const toScaled = (value: InputNumberValue, scale: number) => {
  const text = cleanNumericText(value);
  const negative = text.startsWith("-");
  const unsigned = negative || text.startsWith("+") ? text.slice(1) : text;
  const [whole = "0", fraction = ""] = unsigned.split(".");
  const digits = `${whole || "0"}${fraction.padEnd(scale, "0").slice(0, scale)}`;
  const integer = BigInt(digits || "0");
  return negative ? -integer : integer;
};

const fromScaled = (value: bigint, scale: number) => {
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString().padStart(scale + 1, "0");
  const text = scale > 0
    ? `${digits.slice(0, -scale)}.${digits.slice(-scale)}`
    : digits;
  return negative ? `-${text}` : text;
};

const isNumeric = (value: string) => /^[-+]?\d*(?:\.\d*)?$/.test(value) && /\d/.test(value);

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(function InputNumber(
  {
    value,
    defaultValue,
    onChange,
    min,
    max,
    step = 1,
    precision,
    mode = "embed",
    controls = "hover",
    size = "default",
    disabled = false,
    readOnly = false,
    placeholder,
    prefix,
    suffix,
    formatter,
    parser,
    strictMode = false,
    className,
    style,
    onBlur,
    onFocus,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const controlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<InputNumberValue | undefined>(defaultValue);
  const currentValue = controlled ? value : innerValue;
  const [typingText, setTypingText] = useState<string | null>(null);
  const scale = useMemo(
    () => Math.max(precision ?? 0, decimalPlaces(step)),
    [precision, step],
  );
  const format = (next: InputNumberValue | undefined, userTyping: boolean, input: string) =>
    formatter ? formatter(next, { userTyping, input }) : input;
  const normalizedText = currentValue == null ? "" : fromScaled(toScaled(currentValue, scale), scale);
  const liveParsed = typingText == null
    ? undefined
    : cleanNumericText(parser ? parser(typingText) : typingText);
  const liveValue = liveParsed && isNumeric(liveParsed)
    ? (strictMode ? liveParsed : Number(liveParsed))
    : undefined;
  const displayValue = typingText == null
    ? format(currentValue, false, normalizedText)
    : format(liveValue, true, typingText);

  useEffect(() => {
    if (controlled) setTypingText(null);
  }, [controlled, value]);

  const report = (next: InputNumberValue | undefined) => {
    if (!controlled) setInnerValue(next);
    onChange?.(next);
  };
  const parseDisplay = (text: string) => {
    if (text.trim() === "") return undefined;
    const parsed = parser ? parser(text) : text;
    const clean = cleanNumericText(parsed);
    return isNumeric(clean) ? clean : undefined;
  };
  const coerceOutput = (text: string): InputNumberValue => strictMode ? text : Number(text);
  const clamp = (next: bigint) => {
    let result = next;
    if (min !== undefined) result = result < toScaled(min, scale) ? toScaled(min, scale) : result;
    if (max !== undefined) result = result > toScaled(max, scale) ? toScaled(max, scale) : result;
    return result;
  };
  const commitText = (text: string) => {
    const parsed = parseDisplay(text);
    if (parsed === undefined) {
      setTypingText(null);
      report(undefined);
      return;
    }
    const nextText = fromScaled(clamp(toScaled(parsed, scale)), scale);
    setTypingText(null);
    report(coerceOutput(nextText));
  };
  const stepValue = (direction: 1 | -1) => {
    if (disabled || readOnly) return;
    const source = parseDisplay(typingText ?? cleanNumericText(currentValue)) ?? "0";
    const next = clamp(toScaled(source, scale) + BigInt(direction) * toScaled(step, scale));
    const nextText = fromScaled(next, scale);
    setTypingText(null);
    report(coerceOutput(nextText));
  };
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;
    const text = event.target.value;
    setTypingText(text);
    const parsed = parseDisplay(text);
    report(parsed === undefined ? undefined : coerceOutput(parsed));
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      stepValue(event.key === "ArrowUp" ? 1 : -1);
    }
    onKeyDown?.(event);
  };
  const stepButton = (direction: 1 | -1, icon: React.ReactNode, extraClass = "") => (
    <button
      className={`qizhi-input-number__step ${extraClass}`.trim()}
      type="button"
      aria-label={direction > 0 ? "增加" : "减少"}
      disabled={disabled}
      tabIndex={-1}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => stepValue(direction)}
    >
      {icon}
    </button>
  );
  const field = (
    <span className="qizhi-input-number__field-wrap">
      {prefix != null ? <span className="qizhi-input-number__prefix">{prefix}</span> : null}
      <input
        {...rest}
        ref={ref}
        className="qizhi-input-number__field"
        type="text"
        role="spinbutton"
        inputMode="decimal"
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        aria-valuemin={min == null ? undefined : Number(min)}
        aria-valuemax={max == null ? undefined : Number(max)}
        aria-valuenow={currentValue == null || strictMode ? undefined : Number(currentValue)}
        aria-valuetext={strictMode && currentValue != null ? String(currentValue) : undefined}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={(event) => { commitText(event.currentTarget.value); onBlur?.(event); }}
        onKeyDown={handleKeyDown}
      />
      {suffix != null ? <span className="qizhi-input-number__suffix">{suffix}</span> : null}
    </span>
  );

  return (
    <span
      className={controlContainerClassName(
        "qizhi-input-number",
        `qizhi-input-number--${mode}`,
        mode === "embed" && `qizhi-input-number--controls-${controls}`,
        `qizhi-input-number--size-${size}`,
        disabled && "qizhi-input-number--disabled",
        readOnly && "qizhi-input-number--readonly",
        className,
      )}
      style={style}
    >
      {mode === "button" ? stepButton(-1, <MinusIcon />, "qizhi-input-number__step--addon") : null}
      {field}
      {mode === "button" ? stepButton(1, <AddIcon />, "qizhi-input-number__step--addon") : controls !== "hidden" ? (
        <span className="qizhi-input-number__steps">
          {stepButton(1, <ArrowUpIcon />)}
          {stepButton(-1, <ArrowDownIcon />)}
        </span>
      ) : null}
    </span>
  );
});
