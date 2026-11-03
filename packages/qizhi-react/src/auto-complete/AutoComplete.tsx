import { Children, cloneElement, forwardRef, isValidElement, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, CompositionEvent, CSSProperties, FocusEvent, KeyboardEvent, ReactElement } from "react";
import { createPortal } from "react-dom";
import { Input } from "../input/Input";
import { getFittedFloatingPlacement } from "../overlay/floatingPosition";
import type { AutoCompleteComponent, AutoCompleteOption, AutoCompleteOptionProps, AutoCompleteProps } from "./AutoComplete.types";
import "./autoComplete.css";

type TriggerElement = HTMLInputElement | HTMLTextAreaElement;
type TriggerProps = {
  value?: string;
  role?: string;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (event: ChangeEvent<TriggerElement>) => void;
  onCompositionStart?: (event: CompositionEvent<TriggerElement>) => void;
  onCompositionEnd?: (event: CompositionEvent<TriggerElement>) => void;
  onFocus?: (event: FocusEvent<TriggerElement>) => void;
  onBlur?: (event: FocusEvent<TriggerElement>) => void;
  onKeyDown?: (event: KeyboardEvent<TriggerElement>) => void;
  ref?: React.Ref<TriggerElement>;
  [key: `aria-${string}`]: unknown;
};

const joinClassNames = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(" ");
const popupThemeVariables = [
  "--color-bg-2",
  "--color-border-2",
  "--color-fill-2",
  "--color-text-1",
  "--color-text-3",
  "--color-text-4",
  "--danger-6",
  "--primary-6",
] as const;
const assignRef = (ref: React.Ref<TriggerElement> | undefined, node: TriggerElement | null) => {
  if (typeof ref === "function") ref(node);
  else if (ref && typeof ref === "object" && "current" in ref) ref.current = node;
};
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
    readOnly,
    onFocus: onInputFocus,
    onBlur: onInputBlur,
    onKeyDown: onInputKeyDown,
    onCompositionStart: onInputCompositionStart,
    onCompositionEnd: onInputCompositionEnd,
    ...inputProps
  },
  forwardedRef,
) {
  const originalTriggerProps = triggerElement?.props as TriggerProps | undefined;
  const mergedDisabled = disabled ?? originalTriggerProps?.disabled;
  const mergedReadOnly = readOnly ?? originalTriggerProps?.readOnly;
  const triggerRef = (originalTriggerProps as { ref?: React.Ref<TriggerElement> } | undefined)?.ref;
  const controlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(defaultValue);
  const currentValue = controlled ? value : innerValue;
  const [innerQuery, setInnerQuery] = useState(currentValue);
  const query = controlled ? value : innerQuery;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const popupRef = useRef<HTMLUListElement | null>(null);
  const composingRef = useRef(false);
  const compositionEndValueRef = useRef<string | null>(null);
  const currentTriggerNodeRef = useRef<TriggerElement | null>(null);
  const pendingNullRef = useRef(0);
  const forwardedRefRef = useRef(forwardedRef);
  const triggerRefRef = useRef(triggerRef);
  const previousForwardedRefRef = useRef(forwardedRef);
  const previousTriggerRefRef = useRef(triggerRef);
  const popupId = `qizhi-auto-complete-${useId().replace(/:/g, "")}`;
  const [popupPosition, setPopupPosition] = useState<"bottomLeft" | "topLeft">("bottomLeft");
  const [popupStyle, setPopupStyle] = useState<CSSProperties>({ position: "fixed", left: 0, top: 0, visibility: "hidden" });

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

  const updatePosition = useCallback(() => {
    const trigger = rootRef.current;
    const popup = popupRef.current;
    if (!trigger || !popup) return;
    const triggerRect = trigger.getBoundingClientRect();
    const popupWidth = Math.min(triggerRect.width, Math.max(0, window.innerWidth - 16));
    popup.style.width = `${popupWidth}px`;
    const popupRect = popup.getBoundingClientRect();
    const spaceAbove = triggerRect.top - 12;
    const spaceBelow = window.innerHeight - triggerRect.bottom - 12;
    const preferredPosition = popupRect.height > spaceAbove && popupRect.height > spaceBelow && spaceAbove > spaceBelow
      ? "topLeft"
      : "bottomLeft";
    const next = getFittedFloatingPlacement(triggerRect, popupRect, preferredPosition, undefined, 4);
    const availableHeight = next.position.startsWith("top")
      ? triggerRect.top - 12
      : window.innerHeight - triggerRect.bottom - 12;
    const computedStyle = window.getComputedStyle(trigger);
    const themeStyle = Object.fromEntries(popupThemeVariables.flatMap((property) => {
      const propertyValue = computedStyle.getPropertyValue(property).trim();
      return propertyValue ? [[property, propertyValue]] : [];
    })) as CSSProperties;
    setPopupPosition(next.position as "bottomLeft" | "topLeft");
    setPopupStyle({
      ...themeStyle,
      position: "fixed",
      left: next.left,
      top: next.top,
      width: popupWidth,
      maxHeight: Math.max(32, Math.min(240, availableHeight)),
      overflowY: "auto",
      visibility: "visible",
      zIndex: 1000,
    });
  }, []);

  useEffect(() => { setActiveIndex(-1); }, [visibleOptions]);
  useEffect(() => {
    if (!mergedDisabled && !mergedReadOnly) return;
    setOpen(false);
    setActiveIndex(-1);
  }, [mergedDisabled, mergedReadOnly]);
  useLayoutEffect(() => {
    if (!panelOpen) return;
    updatePosition();
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !popupRef.current?.contains(target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", close);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updatePosition);
    if (rootRef.current) observer?.observe(rootRef.current);
    if (popupRef.current) observer?.observe(popupRef.current);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", close);
      observer?.disconnect();
    };
  }, [panelOpen, updatePosition]);

  forwardedRefRef.current = forwardedRef;
  triggerRefRef.current = triggerRef;
  const syncRef = useCallback((node: TriggerElement | null) => {
    const assignCurrentRefs = (nextNode: TriggerElement | null) => {
      assignRef(forwardedRefRef.current, nextNode);
      if (triggerRefRef.current !== forwardedRefRef.current) assignRef(triggerRefRef.current, nextNode);
    };
    if (node) {
      pendingNullRef.current += 1;
      if (currentTriggerNodeRef.current !== node) {
        currentTriggerNodeRef.current = node;
        assignCurrentRefs(node);
      }
      return;
    }
    const pendingNull = ++pendingNullRef.current;
    queueMicrotask(() => {
      if (pendingNullRef.current !== pendingNull || !currentTriggerNodeRef.current) return;
      currentTriggerNodeRef.current = null;
      assignCurrentRefs(null);
    });
  }, []);
  useLayoutEffect(() => {
    const previousForwardedRef = previousForwardedRefRef.current;
    const previousTriggerRef = previousTriggerRefRef.current;
    const node = currentTriggerNodeRef.current;
    if (previousForwardedRef !== forwardedRef && previousForwardedRef !== triggerRef) assignRef(previousForwardedRef, null);
    if (previousTriggerRef !== triggerRef && previousTriggerRef !== forwardedRef) assignRef(previousTriggerRef, null);
    if (node && previousForwardedRef !== forwardedRef) assignRef(forwardedRef, node);
    if (node && previousTriggerRef !== triggerRef && triggerRef !== forwardedRef) assignRef(triggerRef, node);
    previousForwardedRefRef.current = forwardedRef;
    previousTriggerRefRef.current = triggerRef;
  }, [forwardedRef, triggerRef]);
  useLayoutEffect(() => () => {
    pendingNullRef.current += 1;
    if (!currentTriggerNodeRef.current) return;
    currentTriggerNodeRef.current = null;
    assignRef(forwardedRefRef.current, null);
    if (triggerRefRef.current !== forwardedRefRef.current) assignRef(triggerRefRef.current, null);
  }, []);

  const isFocusWithin = (target: EventTarget | null) => target instanceof Node
    && (!!rootRef.current?.contains(target) || !!popupRef.current?.contains(target));
  const updateValue = (nextValue: string) => {
    if (!controlled) {
      setInnerQuery(nextValue);
      setInnerValue(nextValue);
    }
    onChange?.(nextValue);
    if (composingRef.current) compositionEndValueRef.current = null;
    else if (compositionEndValueRef.current === nextValue) compositionEndValueRef.current = null;
    else onSearch?.(nextValue);
    setActiveIndex(-1);
    setOpen(!mergedDisabled && !mergedReadOnly && !!nextValue.trim());
  };
  const selectOption = (option: AutoCompleteOption) => {
    if (mergedDisabled || mergedReadOnly || option.disabled) return;
    if (!controlled) {
      setInnerQuery(option.value);
      setInnerValue(option.value);
    }
    onChange?.(option.value);
    onSelect?.(option.value, option);
    setOpen(false);
    setActiveIndex(-1);
  };
  const handleKeyDown = (event: KeyboardEvent<TriggerElement>) => {
    if (event.key === "Enter" && (composingRef.current || event.nativeEvent.isComposing)) return;
    if (event.key === "Escape") { setOpen(false); setActiveIndex(-1); return; }
    if (mergedDisabled || mergedReadOnly) return;
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
    disabled: mergedDisabled,
    readOnly: mergedReadOnly,
    "aria-autocomplete": "list",
    "aria-expanded": panelOpen,
    "aria-controls": popupId,
    "aria-activedescendant": activeIndex >= 0 ? `${popupId}-option-${activeIndex}` : undefined,
    onChange: (event) => updateValue(event.currentTarget.value),
    onFocus: (event) => { setOpen(!mergedDisabled && !mergedReadOnly && hasQuery); onInputFocus?.(event as FocusEvent<HTMLInputElement>); },
    onBlur: (event) => {
      if (isFocusWithin(event.relatedTarget)) return;
      const closeAfterBlur = () => {
        setOpen(false);
        setActiveIndex(-1);
        onInputBlur?.(event as FocusEvent<HTMLInputElement>);
      };
      if (event.relatedTarget) closeAfterBlur();
      else queueMicrotask(() => { if (!isFocusWithin(document.activeElement)) closeAfterBlur(); });
    },
    onKeyDown: (event) => { handleKeyDown(event); onInputKeyDown?.(event as KeyboardEvent<HTMLInputElement>); },
    onCompositionStart: (event) => {
      composingRef.current = true;
      compositionEndValueRef.current = null;
      onInputCompositionStart?.(event as CompositionEvent<HTMLInputElement>);
    },
    onCompositionEnd: (event) => {
      composingRef.current = false;
      const nextValue = event.currentTarget.value;
      compositionEndValueRef.current = nextValue;
      onSearch?.(nextValue);
      onInputCompositionEnd?.(event as CompositionEvent<HTMLInputElement>);
    },
  };

  let trigger: ReactElement;
  if (triggerElement) {
    const original = originalTriggerProps!;
    trigger = cloneElement(triggerElement as ReactElement<TriggerProps>, {
      ...sharedProps,
      ...inputProps,
      onChange: (event) => { sharedProps.onChange?.(event); original.onChange?.(event); },
      onFocus: (event) => { sharedProps.onFocus?.(event); original.onFocus?.(event); },
      onBlur: (event) => { sharedProps.onBlur?.(event); original.onBlur?.(event); },
      onKeyDown: (event) => { sharedProps.onKeyDown?.(event); original.onKeyDown?.(event); },
      onCompositionStart: (event) => { sharedProps.onCompositionStart?.(event); original.onCompositionStart?.(event); },
      onCompositionEnd: (event) => { sharedProps.onCompositionEnd?.(event); original.onCompositionEnd?.(event); },
    });
  } else {
    trigger = <Input {...inputProps} {...sharedProps as React.ComponentProps<typeof Input>} allowClear={false} />;
  }

  const popup = panelOpen ? createPortal(
    <ul
      ref={popupRef}
      id={popupId}
      className="qizhi-auto-complete__popup"
      role="listbox"
      data-auto-complete-position={popupPosition}
      style={popupStyle}
    >
      {panelState === "loading" ? <li className="qizhi-auto-complete__state" role="status" aria-live="polite">正在加载</li> : null}
      {panelState === "error" ? <li className="qizhi-auto-complete__state qizhi-auto-complete__state--error" role="alert"><span>{error}</span>{onRetry ? <button className="qizhi-auto-complete__retry" type="button" onMouseDown={(event) => event.preventDefault()} onClick={onRetry}>重试</button> : null}</li> : null}
      {panelState === "empty" ? <li className="qizhi-auto-complete__state" role="status">{emptyContent}</li> : null}
      {panelState === "options" ? visibleOptions.map((option, index) => {
        const groupChanged = option.group != null && (index === 0 || option.group !== visibleOptions[index - 1].group);
        return <li key={`${option.value}-${index}`} className="qizhi-auto-complete__entry" role="presentation">{groupChanged ? <div className="qizhi-auto-complete__group">{option.group}</div> : null}<div id={`${popupId}-option-${index}`} className={joinClassNames("qizhi-auto-complete__option", index === activeIndex && "qizhi-auto-complete__option--active", option.disabled && "qizhi-auto-complete__option--disabled")} role="option" aria-selected={index === activeIndex} aria-disabled={option.disabled || undefined} onMouseDown={(event) => { event.preventDefault(); selectOption(option); }} onMouseEnter={() => { if (!option.disabled) setActiveIndex(index); }}>{option.label ?? option.value}</div></li>;
      }) : null}
    </ul>,
    document.body,
  ) : null;

  return (
    <span ref={rootRef} className={joinClassNames("qizhi-auto-complete", panelOpen && "qizhi-auto-complete--open", className)} style={style}>
      {trigger}
      {popup}
    </span>
  );
});

export const AutoComplete = Object.assign(AutoCompleteBase, { Option }) as AutoCompleteComponent;
