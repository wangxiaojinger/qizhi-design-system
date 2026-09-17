import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, KeyboardEvent } from "react";
import type {
  InputComponent,
  InputGroupProps,
  InputLengthLimit,
  InputPasswordProps,
  InputProps,
  InputSearchProps,
  InputTextAreaProps,
} from "./Input.types";
import {
  EyeHiddenIcon,
  EyeVisibleIcon,
  LoadingIcon,
  MultiplyIcon,
  SearchIcon,
} from "../icon";
import { controlContainerClassName } from "../control-container/controlContainer";

const joinClassName = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const stringValue = (value: unknown) => value == null ? "" : String(value);
const getLengthLimit = (limit?: number | InputLengthLimit) => typeof limit === "number" ? { length: limit, errorOnly: false } : limit;
const getGroupedInputStyle = (style?: CSSProperties) => {
  if (style?.height == null) return style;
  const height = typeof style.height === "number" ? `${style.height}px` : style.height;
  return { ...style, "--qizhi-input-height": height } as CSSProperties;
};

const notifyInputChange = (
  input: HTMLInputElement,
  onChange: InputProps["onChange"],
) => onChange?.({ target: input, currentTarget: input } as ChangeEvent<HTMLInputElement>);

type InputBaseProps = InputProps & { addonAfterClassName?: string };

const InputBase = forwardRef<HTMLInputElement, InputBaseProps>(function Input(
  {
    size = "default",
    status = "default",
    allowClear = true,
    prefix,
    suffix,
    addBefore,
    addAfter,
    maxLength,
    showWordLimit = false,
    normalize,
    normalizeTrigger = "blur",
    autoWidth = false,
    onClear,
    className,
    disabled,
    readOnly,
    value,
    defaultValue,
    onChange,
    onBlur,
    onKeyDown,
    style,
    addonAfterClassName,
    ...rest
  },
  forwardedRef,
) {
  const localRef = useRef<HTMLInputElement | null>(null);
  const mirrorRef = useRef<HTMLSpanElement | null>(null);
  const controlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(() => stringValue(defaultValue));
  const currentValue = controlled ? stringValue(value) : innerValue;
  const limit = getLengthLimit(maxLength);
  const overLimit = !!limit?.errorOnly && currentValue.length > limit.length;
  const clearable = allowClear && !showWordLimit;
  const hasClearButton = clearable && !!currentValue && !disabled && !readOnly;
  const autoWidthOptions = typeof autoWidth === "object" ? autoWidth : {};
  const setRefs = (node: HTMLInputElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  useLayoutEffect(() => {
    if (!autoWidth || !localRef.current || !mirrorRef.current) return;
    const input = localRef.current;
    const mirror = mirrorRef.current;
    const computed = window.getComputedStyle(input);
    mirror.style.font = computed.font;
    mirror.style.letterSpacing = computed.letterSpacing;
    mirror.textContent = currentValue || input.placeholder || "";
    const minWidth = autoWidthOptions.minWidth ?? 0;
    const maxWidth = autoWidthOptions.maxWidth ?? 500;
    const measured = Math.ceil(mirror.scrollWidth + 26);
    input.parentElement?.style.setProperty("width", `${Math.min(Math.max(measured, minWidth), maxWidth)}px`);
  }, [autoWidth, autoWidthOptions.maxWidth, autoWidthOptions.minWidth, currentValue]);

  const updateValue = (nextValue: string, report = true) => {
    const input = localRef.current;
    if (!controlled) setInnerValue(nextValue);
    if (input) {
      input.value = nextValue;
      if (report) notifyInputChange(input, onChange);
    }
  };
  const normalizeValue = () => {
    if (!normalize) return;
    const nextValue = normalize(currentValue);
    if (nextValue !== currentValue) updateValue(nextValue);
  };
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!controlled) setInnerValue(event.target.value);
    onChange?.(event);
  };
  const handleClear = () => {
    updateValue("");
    onClear?.();
    localRef.current?.focus();
  };

  const field = <span
    className={controlContainerClassName(
      "qizhi-input",
      `qizhi-input--size-${size}`,
      status !== "default" && `qizhi-input--${status}`,
      disabled && "qizhi-input--disabled",
      readOnly && "qizhi-input--readonly",
      prefix != null && "qizhi-input--with-prefix",
      (suffix != null || (clearable && currentValue)) && "qizhi-input--with-suffix",
      showWordLimit && "qizhi-input--with-word-limit",
      hasClearButton && "qizhi-input--has-clear",
      overLimit && "qizhi-input--error",
      autoWidth && "qizhi-input--auto-width",
      className,
    )}
    style={style}
  >
    {prefix != null ? <span className="qizhi-input__prefix">{prefix}</span> : null}
    <input
      {...rest}
      ref={setRefs}
      className="qizhi-input__field"
      disabled={disabled}
      readOnly={readOnly}
      value={currentValue}
      maxLength={limit && !limit.errorOnly ? limit.length : undefined}
      aria-invalid={overLimit || status === "error" || rest["aria-invalid"] || undefined}
      onChange={handleChange}
      onBlur={(event) => { if (normalizeTrigger === "blur") normalizeValue(); onBlur?.(event); }}
      onKeyDown={(event) => { if (normalizeTrigger === "enter" && event.key === "Enter") normalizeValue(); onKeyDown?.(event); }}
    />
    {showWordLimit && limit ? <span className={joinClassName("qizhi-input__word-limit", overLimit && "qizhi-input__word-limit--error")}>{currentValue.length}/{limit.length}</span> : null}
    {hasClearButton ? <button className="qizhi-input__clear" type="button" aria-label="清空输入内容" onMouseDown={(event) => event.preventDefault()} onClick={handleClear}><MultiplyIcon /></button> : null}
    {suffix != null ? <span className="qizhi-input__suffix">{suffix}</span> : null}
    {autoWidth ? <span ref={mirrorRef} className="qizhi-input__mirror" aria-hidden="true" /> : null}
  </span>;

  if (addBefore == null && addAfter == null) return field;
  return <span className={`qizhi-input__group qizhi-input__group--size-${size}`} style={getGroupedInputStyle(style)}>{addBefore != null ? <span className="qizhi-input__addon qizhi-input__addon--before">{addBefore}</span> : null}{field}{addAfter != null ? <span className={joinClassName("qizhi-input__addon", "qizhi-input__addon--after", addonAfterClassName)}>{addAfter}</span> : null}</span>;
});

const InputSearch = forwardRef<HTMLInputElement, InputSearchProps>(function InputSearch(
  { searchButton = false, loading = false, onSearch, onKeyDown, suffix, className, ...props },
  ref,
) {
  const localRef = useRef<HTMLInputElement | null>(null);
  const setRefs = (node: HTMLInputElement | null) => {
    localRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };
  const submit = () => { if (!loading) onSearch?.(localRef.current?.value ?? ""); };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") submit();
    onKeyDown?.(event);
  };
  const buttonLabel = loading ? "搜索中" : "搜索";
  return <InputBase
    {...props}
    ref={setRefs}
    className={joinClassName("qizhi-input-search", className)}
    allowClear={false}
    addonAfterClassName={searchButton ? "qizhi-input__addon--search" : undefined}
    onKeyDown={handleKeyDown}
    suffix={searchButton ? suffix : (loading ? <LoadingIcon className="qizhi-input-search__spinner" /> : (suffix ?? <SearchIcon />))}
    addAfter={searchButton ? <button className="qizhi-input-search__button" type="button" aria-label={buttonLabel} disabled={loading} onClick={submit}>{loading ? <LoadingIcon className="qizhi-input-search__spinner" /> : searchButton === true ? <SearchIcon /> : searchButton}</button> : props.addAfter}
  />;
});

const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(function InputPassword(
  { defaultVisibility = false, visibility, onVisibilityChange, ...props },
  ref,
) {
  const [innerVisible, setInnerVisible] = useState(defaultVisibility);
  const controlled = visibility !== undefined;
  const visible = controlled ? visibility : innerVisible;
  const localRef = useRef<HTMLInputElement | null>(null);
  const setRefs = (node: HTMLInputElement | null) => {
    localRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };
  const toggle = () => {
    const next = !visible;
    if (!controlled) setInnerVisible(next);
    onVisibilityChange?.(next);
    window.setTimeout(() => localRef.current?.focus(), 0);
  };
  return <InputBase {...props} ref={setRefs} type={visible ? "text" : "password"} allowClear={false} suffix={<button className="qizhi-input-password__toggle" type="button" aria-label={visible ? "隐藏密码" : "显示密码"} onMouseDown={(event) => event.preventDefault()} onClick={toggle}>{visible ? <EyeVisibleIcon /> : <EyeHiddenIcon />}</button>} />;
});

const InputTextArea = forwardRef<HTMLTextAreaElement, InputTextAreaProps>(function InputTextArea(
  { status = "default", maxLength, showWordLimit = false, wordLimitPlacement = "inside", autoSize = false, className, disabled, readOnly, value, defaultValue, onChange, rows, ...rest },
  ref,
) {
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const controlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(() => stringValue(defaultValue));
  const currentValue = controlled ? stringValue(value) : innerValue;
  const limit = getLengthLimit(maxLength);
  const overLimit = !!limit?.errorOnly && currentValue.length > limit.length;
  const bounds = typeof autoSize === "object" ? autoSize : {};
  const minRows = bounds.minRows ?? (autoSize ? 1 : rows);
  const setRefs = (node: HTMLTextAreaElement | null) => {
    localRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };
  useLayoutEffect(() => {
    const node = localRef.current;
    if (!node || !autoSize) return;
    const syncHeight = () => {
      node.style.height = "auto";
      const computed = window.getComputedStyle(node);
      const lineHeight = Number.parseFloat(computed.lineHeight) || 22;
      const paddingY = Number.parseFloat(computed.paddingTop) + Number.parseFloat(computed.paddingBottom);
      const borderY = Number.parseFloat(computed.borderTopWidth) + Number.parseFloat(computed.borderBottomWidth);
      const minHeight = bounds.minRows ? Math.ceil(bounds.minRows * lineHeight + paddingY + borderY) : 32;
      const maxHeight = bounds.maxRows ? Math.ceil(bounds.maxRows * lineHeight + paddingY + borderY) : Number.POSITIVE_INFINITY;
      const scrollHeight = node.scrollHeight;
      node.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
      node.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    };
    syncHeight();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(syncHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [autoSize, bounds.maxRows, bounds.minRows, currentValue]);
  const counter = showWordLimit && limit ? <span className={joinClassName("qizhi-input__word-limit", overLimit && "qizhi-input__word-limit--error")}>{currentValue.length}/{limit.length}</span> : null;
  const field = <span className={controlContainerClassName("qizhi-textarea__control")}><textarea {...rest} ref={setRefs} className="qizhi-textarea__field" disabled={disabled} readOnly={readOnly} value={currentValue} rows={minRows} maxLength={limit && !limit.errorOnly ? limit.length : undefined} aria-invalid={overLimit || status === "error" || rest["aria-invalid"] || undefined} onChange={(event) => { if (!controlled) setInnerValue(event.target.value); onChange?.(event); }} />{wordLimitPlacement === "inside" ? counter : null}</span>;
  return <span className={joinClassName("qizhi-textarea", autoSize && "qizhi-textarea--auto-size", disabled && "qizhi-textarea--disabled", readOnly && "qizhi-textarea--readonly", status !== "default" && `qizhi-textarea--${status}`, overLimit && "qizhi-textarea--error", wordLimitPlacement === "outside" && "qizhi-textarea--word-limit-outside", className)}>{field}{wordLimitPlacement === "outside" ? counter : null}</span>;
});

function InputGroup({ className, children, role = "group", ...rest }: InputGroupProps) {
  return <div {...rest} role={role} className={joinClassName("qizhi-input-group", className)}>{children}</div>;
}

export const Input = Object.assign(InputBase, {
  Search: InputSearch,
  Password: InputPassword,
  TextArea: InputTextArea,
  Group: InputGroup,
}) as InputComponent;
