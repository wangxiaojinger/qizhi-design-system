import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent } from "react";
import { CloseIcon } from "../icon";
import { Tag } from "../tag/Tag";
import { controlContainerClassName } from "../control-container/controlContainer";
import type {
  InputTagLabelValue,
  InputTagProps,
  InputTagValue,
} from "./InputTag.types";

const join = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const labelOf = (value: InputTagValue) => {
  if (typeof value === "string") return value;
  if ("label" in value) return String(value.label);
  if ("word" in value) return String(value.word);
  if ("value" in value) return String(value.value);
  return JSON.stringify(value);
};

const keyOf = (value: InputTagValue, index: number) => {
  if (typeof value === "string") return `${value}-${index}`;
  if ("value" in value) return `${String(value.value)}-${index}`;
  return `${labelOf(value)}-${index}`;
};

export const InputTag = forwardRef<HTMLInputElement, InputTagProps>(function InputTag(
  {
    value,
    defaultValue = [],
    onChange,
    labelInValue = false,
    size = "default",
    placeholder = "请输入标签",
    allowClear = true,
    onClear,
    validate,
    saveOnBlur = false,
    tokenSeparators = [","],
    maxTagCount,
    renderMore,
    className,
    style,
    inputStyle,
    onClick,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  },
  forwardedRef,
) {
  const controlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<InputTagValue[]>(defaultValue);
  const values = controlled ? value : innerValue;
  const [query, setQuery] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [responsiveCount, setResponsiveCount] = useState(values.length);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const tagRefs = useRef(new Map<string, HTMLElement>());
  const widthCache = useRef(new Map<string, number>());
  const moreMeasureRef = useRef<HTMLSpanElement | null>(null);

  const setInputRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const emit = useCallback((next: InputTagValue[]) => {
    if (!controlled) setInnerValue(next);
    onChange?.(next);
  }, [controlled, onChange]);

  const commit = useCallback((raw: string) => {
    const input = raw.trim();
    if (!input) return false;
    const result = validate?.(input, values) ?? true;
    if (result === false) {
      setInvalid(true);
      return false;
    }
    setInvalid(false);
    let nextValue: InputTagValue;
    if (result !== true) nextValue = result;
    else if (labelInValue) nextValue = { label: input, value: input } satisfies InputTagLabelValue;
    else nextValue = input;
    emit([...values, nextValue]);
    setQuery("");
    return true;
  }, [emit, labelInValue, validate, values]);

  const removeAt = (index: number) => {
    emit(values.filter((_, itemIndex) => itemIndex !== index));
    queueMicrotask(() => inputRef.current?.focus());
  };

  const clear = () => {
    emit([]);
    setQuery("");
    setInvalid(false);
    onClear?.();
    queueMicrotask(() => inputRef.current?.focus());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || tokenSeparators.includes(event.key)) {
      event.preventDefault();
      commit(query);
      return;
    }
    if (event.key === "Backspace" && !query && values.length) {
      event.preventDefault();
      emit(values.slice(0, -1));
    }
  };

  const measureResponsive = useCallback(() => {
    if (maxTagCount !== "responsive") return;
    const available = innerRef.current?.clientWidth ?? 0;
    if (!available || !values.length) return;
    tagRefs.current.forEach((node, key) => {
      const width = node.getBoundingClientRect().width;
      if (width) widthCache.current.set(key, width);
    });
    let visible = values.length;
    while (visible > 0) {
      const hidden = values.length - visible;
      const summary = moreMeasureRef.current;
      if (summary) summary.textContent = hidden ? String(renderMore?.(hidden) ?? `+${hidden}`) : "";
      const tagWidth = values.slice(0, visible).reduce((total, item, index) =>
        total + (widthCache.current.get(keyOf(item, index)) ?? 0), 0);
      const summaryWidth = hidden ? (summary?.getBoundingClientRect().width ?? 0) : 0;
      const count = visible + (hidden ? 1 : 0);
      if (tagWidth + summaryWidth + Math.max(0, count - 1) * 4 <= available) break;
      visible -= 1;
    }
    setResponsiveCount(visible);
  }, [maxTagCount, renderMore, values]);

  useLayoutEffect(() => {
    setResponsiveCount(values.length);
    measureResponsive();
  }, [measureResponsive, values.length]);

  useEffect(() => {
    if (maxTagCount !== "responsive" || typeof ResizeObserver === "undefined" || !innerRef.current) return;
    const observer = new ResizeObserver(measureResponsive);
    observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, [maxTagCount, measureResponsive]);

  const visibleCount = maxTagCount === "responsive"
    ? responsiveCount
    : typeof maxTagCount === "number"
      ? Math.max(0, maxTagCount)
      : values.length;
  const shown = values.slice(0, visibleCount);
  const hiddenCount = Math.max(values.length - shown.length, 0);
  const collapsed = maxTagCount !== undefined;

  return (
    <div
      {...rest}
      className={controlContainerClassName(
        "qizhi-input-tag",
        `qizhi-input-tag--${size}`,
        invalid && "qizhi-input-tag--error",
        collapsed && "qizhi-input-tag--collapsed",
        maxTagCount === "responsive" && "qizhi-input-tag--responsive",
        className,
      )}
      style={style}
      onClick={(event) => {
        if (event.target === event.currentTarget) inputRef.current?.focus();
        onClick?.(event);
      }}
    >
      <div ref={innerRef} className="qizhi-input-tag__inner">
        {shown.map((item, index) => {
          const label = labelOf(item);
          const key = keyOf(item, index);
          return (
            <Tag
              key={key}
              ref={(node) => { if (node) tagRefs.current.set(key, node); else tagRefs.current.delete(key); }}
              closable
              closeAriaLabel={`删除 ${label}`}
              className="qizhi-input-tag__tag"
              title={label}
              onClose={() => removeAt(index)}
            >
              {label}
            </Tag>
          );
        })}
        {hiddenCount > 0 ? (
          <Tag className="qizhi-input-tag__more">
            {renderMore?.(hiddenCount) ?? `+${hiddenCount}`}
          </Tag>
        ) : null}
        <input
          ref={setInputRef}
          className={join(
            "qizhi-input-tag__input",
            collapsed && "qizhi-input-tag__input--collapsed",
          )}
          style={inputStyle}
          autoComplete="off"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-invalid={invalid || undefined}
          placeholder={values.length ? "" : placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (saveOnBlur) commit(query); }}
        />
      </div>
      {allowClear && (values.length > 0 || query) ? (
        <button
          type="button"
          className="qizhi-input-tag__clear"
          aria-label="清空"
          onMouseDown={(event) => event.preventDefault()}
          onClick={clear}
        >
          <CloseIcon />
        </button>
      ) : null}
      <span ref={moreMeasureRef} className="qizhi-input-tag__measure" aria-hidden="true" />
    </div>
  );
});
