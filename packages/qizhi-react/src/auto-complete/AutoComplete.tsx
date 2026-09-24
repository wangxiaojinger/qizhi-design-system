import { Children, cloneElement, forwardRef, isValidElement, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent, KeyboardEvent, ReactElement } from "react";
import { Input } from "../input/Input";
import type { AutoCompleteComponent, AutoCompleteOption, AutoCompleteOptionProps, AutoCompleteProps } from "./AutoComplete.types";
import "./autoComplete.css";

type TriggerElement = HTMLInputElement | HTMLTextAreaElement;
type TriggerProps = {
  value?: string;
  role?: string;
  id?: string;
  disabled?: boolean;
  onChange?: (event: ChangeEvent<TriggerElement>) => void;
  onFocus?: (event: FocusEvent<TriggerElement>) => void;
  onBlur?: (event: FocusEvent<TriggerElement>) => void;
  onKeyDown?: (event: KeyboardEvent<TriggerElement>) => void;
  ref?: React.Ref<TriggerElement>;
  [key: `aria-${string}`]: unknown;
};

const joinClassNames = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(" ");
const optionText = (option: AutoCompleteOption) => {
  if (typeof option.label === "string" || typeof option.label === "number") return String(option.label);
  return option.value;
};
const normalizeOption = (option: string | AutoCompleteOption): AutoCompleteOption => typeof option === "string" ? { value: option, label: option } : option;

function Option(_props: AutoCompleteOptionProps) { return null; }

const AutoCompleteBase = forwardRef<TriggerElement, AutoCompleteProps>(function AutoComplete(
  {
    children,
    data = [],
    value,
    defaultValue = "",
    strict = false,
    filterOption,
    triggerElement,
    loading = false,
    emptyContent = "暂无匹配结果",
    error,
    onRetry,
    onChange,
    onSearch,
    onSelect,
    className,
    style,
    disabled,
    onFocus: onInputFocus,
    onBlur: onInputBlur,
    onKeyDown: onInputKeyDown,
    ...inputProps
  },
  forwardedRef,
) {
  const controlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(defaultValue);
  const currentValue = controlled ? value : innerValue;
  const [query, setQuery] = useState(currentValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const popupId = `qizhi-auto-complete-${useId().replace(/:/g, "")}`;

  const childOptions = useMemo(() => Children.toArray(children).flatMap((child) => {
    if (!isValidElement<AutoCompleteOptionProps>(child) || child.type !== Option) return [];
    return [{ value: child.props.value, label: child.props.children ?? child.props.label ?? child.props.value, group: child.props.group, disabled: child.props.disabled }];
  }), [children]);
  const options = useMemo(() => [...data.map(normalizeOption), ...childOptions], [data, childOptions]);
  const visibleOptions = useMemo(() => {
    if (!query.trim()) return [];
    if (filterOption === false) return options;
    if (typeof filterOption === "function") return options.filter((option) => filterOption(query, option));
    const needle = strict ? query : query.toLocaleLowerCase();
    return options.filter((option) => {
      const haystack = optionText(option);
      return (strict ? haystack : haystack.toLocaleLowerCase()).includes(needle);
    });
  }, [filterOption, options, query, strict]);
  const hasQuery = Boolean(query.trim());
  const panelState = !hasQuery ? "closed" : loading ? "loading" : error !== undefined ? "error" : visibleOptions.length ? "options" : "empty";
  const panelOpen = open && panelState !== "closed";

  useEffect(() => {
    if (controlled) setQuery(value);
  }, [controlled, value]);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) { setOpen(false); setActiveIndex(-1); } };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const syncRef = (node: TriggerElement | null) => {
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };
  const updateValue = (nextValue: string) => {
    setQuery(nextValue);
    if (!controlled) setInnerValue(nextValue);
    onChange?.(nextValue);
    onSearch?.(nextValue);
    setActiveIndex(-1);
    setOpen(!disabled && !!nextValue.trim());
  };
  const selectOption = (option: AutoCompleteOption) => {
    if (option.disabled) return;
    setQuery(option.value);
    if (!controlled) setInnerValue(option.value);
    onChange?.(option.value);
    onSelect?.(option.value, option);
    setOpen(false);
    setActiveIndex(-1);
  };
  const handleKeyDown = (event: KeyboardEvent<TriggerElement>) => {
    if (event.key === "Escape") { setOpen(false); setActiveIndex(-1); return; }
    if (panelState !== "options" || !visibleOptions.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => {
        let next = current;
        for (let count = 0; count < visibleOptions.length; count += 1) {
          next = (next + direction + visibleOptions.length) % visibleOptions.length;
          if (!visibleOptions[next].disabled) return next;
        }
        return -1;
      });
      return;
    }
    if (event.key === "Enter" && open) {
      const option = visibleOptions[activeIndex >= 0 ? activeIndex : 0];
      if (option && !option.disabled) { event.preventDefault(); selectOption(option); }
    }
  };

  const sharedProps: TriggerProps = {
    ref: syncRef,
    value: currentValue,
    role: "combobox",
    disabled,
    "aria-autocomplete": "list",
    "aria-expanded": panelOpen,
    "aria-controls": popupId,
    "aria-activedescendant": activeIndex >= 0 ? `${popupId}-option-${activeIndex}` : undefined,
    onChange: (event) => updateValue(event.currentTarget.value),
    onFocus: (event) => { setOpen(!disabled && hasQuery); onInputFocus?.(event as FocusEvent<HTMLInputElement>); },
    onBlur: (event) => onInputBlur?.(event as FocusEvent<HTMLInputElement>),
    onKeyDown: (event) => { handleKeyDown(event); onInputKeyDown?.(event as KeyboardEvent<HTMLInputElement>); },
  };

  let trigger: ReactElement;
  if (triggerElement) {
    const original = triggerElement.props as TriggerProps;
    trigger = cloneElement(triggerElement as ReactElement<TriggerProps>, {
      ...sharedProps,
      ...inputProps,
      onChange: (event) => { sharedProps.onChange?.(event); original.onChange?.(event); },
      onFocus: (event) => { sharedProps.onFocus?.(event); original.onFocus?.(event); },
      onBlur: (event) => { sharedProps.onBlur?.(event); original.onBlur?.(event); },
      onKeyDown: (event) => { sharedProps.onKeyDown?.(event); original.onKeyDown?.(event); },
    });
  } else {
    trigger = <Input {...inputProps} {...sharedProps as React.ComponentProps<typeof Input>} allowClear={false} />;
  }

  return (
    <span ref={rootRef} className={joinClassNames("qizhi-auto-complete", panelOpen && "qizhi-auto-complete--open", className)} style={style}>
      {trigger}
      {panelOpen ? (
        <ul id={popupId} className="qizhi-auto-complete__popup" role="listbox">
          {panelState === "loading" ? <li className="qizhi-auto-complete__state" role="status" aria-live="polite">正在加载</li> : null}
          {panelState === "error" ? <li className="qizhi-auto-complete__state qizhi-auto-complete__state--error" role="alert"><span>{error}</span>{onRetry ? <button className="qizhi-auto-complete__retry" type="button" onMouseDown={(event) => event.preventDefault()} onClick={onRetry}>重试</button> : null}</li> : null}
          {panelState === "empty" ? <li className="qizhi-auto-complete__state" role="status">{emptyContent}</li> : null}
          {panelState === "options" ? visibleOptions.map((option, index) => {
            const groupChanged = option.group != null && (index === 0 || option.group !== visibleOptions[index - 1].group);
            return <li key={`${option.value}-${index}`} className="qizhi-auto-complete__entry" role="presentation">{groupChanged ? <div className="qizhi-auto-complete__group">{option.group}</div> : null}<div id={`${popupId}-option-${index}`} className={joinClassNames("qizhi-auto-complete__option", index === activeIndex && "qizhi-auto-complete__option--active", option.disabled && "qizhi-auto-complete__option--disabled")} role="option" aria-selected={index === activeIndex} aria-disabled={option.disabled || undefined} onMouseDown={(event) => { event.preventDefault(); selectOption(option); }} onMouseEnter={() => { if (!option.disabled) setActiveIndex(index); }}>{option.label ?? option.value}</div></li>;
          }) : null}
        </ul>
      ) : null}
    </span>
  );
});

export const AutoComplete = Object.assign(AutoCompleteBase, { Option }) as AutoCompleteComponent;
