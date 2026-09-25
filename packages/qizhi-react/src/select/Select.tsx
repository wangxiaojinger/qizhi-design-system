import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { CSSProperties, DragEvent, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Dropdown } from "../dropdown/Dropdown";
import { Popover } from "../popover/Popover";
import { CheckboxIndicator } from "../checkbox/CheckboxIndicator";
import { ArrowDownIcon, CloseIcon } from "../icon";
import { Tag } from "../tag/Tag";
import { CONTROL_CONTAINER_CLASS_NAME } from "../control-container/controlContainer";
import type { SelectHandle, SelectMultipleProps, SelectOption, SelectProps, SelectRawValue, SelectSingleProps } from "./Select.types";
import "./select.css";

const join = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ");
const textOf = (value: ReactNode) => typeof value === "string" || typeof value === "number" ? String(value) : "";
const same = (a: SelectRawValue, b: SelectRawValue) => String(a) === String(b);

function useControlled<T>(controlled: T | undefined, initial: T, notify?: (value: T) => void) {
  const [inner, setInner] = useState(initial);
  const value = controlled === undefined ? inner : controlled;
  const setValue = useCallback((next: T) => {
    if (controlled === undefined) setInner(next);
    notify?.(next);
  }, [controlled, notify]);
  return [value, setValue] as const;
}

export const Select = forwardRef<SelectHandle, SelectProps>(function Select(props, forwardedRef) {
  const {
    options: sourceOptions,
    placeholder = "请选择",
    size = "default",
    status = "default",
    disabled = false,
    allowClear = false,
    addBefore,
    showSearch = false,
    filterOption,
    onSearch,
    allowCreate = false,
    tokenSeparators = [],
    maxTagCount,
    renderTag,
    renderMore,
    hideSelected = false,
    dragToSort = false,
    autoWidth = false,
    popupWidth = "trigger",
    renderOption,
    renderOptionDescription,
    dropdownRender,
    trigger,
    open,
    defaultOpen = false,
    onOpenChange,
    onPopupScroll,
    onBlur,
    className,
    style,
    id,
    name,
  } = props;
  const multiple = props.mode === "multiple";
  const singleProps = props as SelectSingleProps;
  const multipleProps = props as SelectMultipleProps;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupId = `qizhi-select-popup-${useId().replace(/:/g, "")}`;
  const [createdOptions, setCreatedOptions] = useState<SelectOption[]>([]);
  const options = useMemo(() => [...sourceOptions, ...createdOptions], [sourceOptions, createdOptions]);
  const [isOpen, setOpen] = useControlled(open, defaultOpen, onOpenChange);
  const [singleValue, setSingleValue] = useControlled<SelectRawValue | undefined>(multiple ? undefined : singleProps.value, multiple ? undefined : singleProps.defaultValue);
  const [multipleValue, setMultipleValue] = useControlled<SelectRawValue[]>(multiple ? multipleProps.value : undefined, multiple ? multipleProps.defaultValue ?? [] : []);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hoveredOption, setHoveredOption] = useState<SelectRawValue>();
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [popupStyle, setPopupStyle] = useState<CSSProperties>({ position: "fixed", left: 0, top: 0 });
  const searchEnabled = !!showSearch;
  const retainInput = typeof showSearch === "object" && !!showSearch.retainInputValue;
  const selectedValues = multiple ? multipleValue : singleValue === undefined ? [] : [singleValue];
  const selectedOptions = selectedValues.map((value) => options.find((option) => same(option.value, value)) ?? (allowCreate ? { label: String(value), value } : undefined)).filter(Boolean) as SelectOption[];
  const selectedSingle = selectedOptions[0];
  const hasValue = selectedValues.length > 0;

  useImperativeHandle(forwardedRef, () => (triggerRef.current ?? inputRef.current) as SelectHandle);

  const setVisible = useCallback((next: boolean) => {
    if (disabled) return;
    setOpen(next);
    if (!next) setHoveredOption(undefined);
    if (!next && !retainInput) setQuery("");
  }, [disabled, retainInput, setOpen]);

  const updatePosition = useCallback(() => {
    const node = triggerRef.current ?? rootRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const width = typeof popupWidth === "number" ? popupWidth : popupWidth === "content" ? undefined : rect.width;
    const estimatedHeight = Math.min(popupRef.current?.scrollHeight || 220, 320);
    const top = window.innerHeight - rect.bottom >= estimatedHeight ? rect.bottom + 4 : Math.max(4, rect.top - estimatedHeight - 4);
    setPopupStyle({ position: "fixed", left: Math.max(4, Math.min(rect.left, window.innerWidth - (width ?? rect.width) - 4)), top, width, minWidth: popupWidth === "content" ? rect.width : undefined, maxHeight: Math.min(320, window.innerHeight - top - 4), overflowY: "auto", zIndex: 1000 });
  }, [popupWidth]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !popupRef.current?.contains(target) && !triggerRef.current?.contains(target)) setVisible(false);
    };
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [isOpen, setVisible, updatePosition]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions = options.filter((option) => {
    if (hideSelected && multipleValue.some((value) => same(value, option.value))) return false;
    if (!normalizedQuery) return true;
    return filterOption ? filterOption(query, option) : textOf(option.label).toLowerCase().includes(normalizedQuery) || String(option.value).toLowerCase().includes(normalizedQuery);
  });
  const canCreate = !!allowCreate && !!query.trim() && !options.some((option) => textOf(option.label) === query.trim() || String(option.value) === query.trim());
  const navigable = [...visibleOptions, ...(canCreate ? [{ label: query.trim(), value: query.trim() }] : [])].filter((option) => !option.disabled);

  const emitMultiple = (next: SelectRawValue[]) => {
    setMultipleValue(next);
    multipleProps.onChange?.(next, next.map((value) => options.find((option) => same(option.value, value))).filter(Boolean) as SelectOption[]);
  };

  const choose = (option: SelectOption, created = false) => {
    if (option.disabled) return;
    let resolved = option;
    if (created) {
      resolved = { label: option.label, value: option.value };
      setCreatedOptions((current) => [...current, resolved]);
    }
    if (multiple) {
      const exists = multipleValue.some((value) => same(value, resolved.value));
      emitMultiple(exists ? multipleValue.filter((value) => !same(value, resolved.value)) : [...multipleValue, resolved.value]);
      setQuery("");
      return;
    }
    setSingleValue(resolved.value);
    singleProps.onChange?.(resolved.value, resolved);
    setVisible(false);
    queueMicrotask(() => inputRef.current?.focus());
  };

  const clear = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (multiple) emitMultiple([]);
    else { setSingleValue(undefined); singleProps.onChange?.(undefined, undefined); }
    setQuery("");
    setVisible(false);
    queueMicrotask(() => inputRef.current?.focus());
  };

  const remove = (value: SelectRawValue) => emitMultiple(multipleValue.filter((item) => !same(item, value)));

  const commitTokens = (input: string) => {
    if (!multiple || !tokenSeparators.length) return false;
    const escaped = tokenSeparators.map((separator) => separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("");
    if (!new RegExp(`[${escaped}]`).test(input)) return false;
    const tokens = input.split(new RegExp(`[${escaped}]`)).map((item) => item.trim()).filter(Boolean);
    const next = [...multipleValue];
    tokens.forEach((token) => {
      let option = options.find((candidate) => textOf(candidate.label) === token || String(candidate.value) === token);
      if (!option && allowCreate) {
        option = { label: token, value: token };
        setCreatedOptions((current) => current.some((item) => same(item.value, token)) ? current : [...current, option as SelectOption]);
      }
      if (option && !option.disabled && !next.some((value) => same(value, option!.value))) next.push(option.value);
    });
    emitMultiple(next);
    setQuery("");
    return true;
  };

  const handleInput = (next: string) => {
    if (commitTokens(next)) return;
    setQuery(next);
    onSearch?.(next);
    setVisible(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const handledKeys = ["Escape", "ArrowDown", "ArrowUp", "Enter", " "];
    if (event.metaKey || event.ctrlKey || event.altKey || !handledKeys.includes(event.key)) return;
    setKeyboardFocused(true);
    if (event.key === "Escape") {
      event.preventDefault();
      setVisible(false);
      queueMicrotask(() => (triggerRef.current ?? inputRef.current)?.focus());
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) setVisible(true);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => navigable.length ? (current + delta + navigable.length) % navigable.length : -1);
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && !isOpen) {
      event.preventDefault();
      setVisible(true);
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && activeIndex >= 0) {
      event.preventDefault();
      const option = navigable[activeIndex];
      if (option) choose(option, canCreate && same(option.value, query.trim()));
    }
  };

  const autoWidthStyle = typeof autoWidth === "object" ? { minWidth: autoWidth.minWidth, maxWidth: autoWidth.maxWidth } : undefined;
  const visibleTagCount = maxTagCount === "responsive" ? Math.max(1, Math.floor(((rootRef.current?.clientWidth ?? 350) - 56) / 88)) : typeof maxTagCount === "number" ? maxTagCount : selectedOptions.length;
  const shownTags = selectedOptions.slice(0, visibleTagCount);
  const hiddenCount = selectedOptions.length - shownTags.length;
  const commonTriggerProps = {
    ref: (node: HTMLElement | null) => { triggerRef.current = node; },
    role: "combobox" as const,
    tabIndex: disabled ? -1 : 0,
    "aria-haspopup": "listbox" as const,
    "aria-expanded": isOpen,
    "aria-controls": popupId,
    "aria-label": props["aria-label"] ?? placeholder,
    valueText: selectedOptions.map((option) => textOf(option.label)).join("，"),
    onClick: () => setVisible(!isOpen),
    onKeyDown: handleKeyDown,
    onPointerDown: () => setKeyboardFocused(false),
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      setKeyboardFocused(false);
      onBlur?.(event as React.FocusEvent<HTMLInputElement>);
    },
  };

  const menu = (
    <Dropdown.Menu className="qizhi-select-popup__menu" role="listbox" aria-multiselectable={multiple || undefined}>
      {visibleOptions.map((option, index) => {
        const selected = selectedValues.some((value) => same(value, option.value));
        const description = renderOptionDescription?.(option);
        const descriptionVisible = !option.disabled && (keyboardFocused ? navigable[activeIndex]?.value === option.value : hoveredOption === option.value);
        const content = <span className="qizhi-select-popup__option-content">{renderOption ? renderOption(option) : option.label}</span>;
        return <Dropdown.Item key={String(option.value)} id={`${popupId}-option-${index}`} itemKey={String(option.value)} role="option" className={join("qizhi-select-popup__option", selected && "is-selected")} aria-selected={selected} aria-describedby={description != null && descriptionVisible ? `${popupId}-description-${index}` : undefined} aria-disabled={option.disabled || undefined} disabled={option.disabled} onMouseEnter={() => { setKeyboardFocused(false); setHoveredOption(option.value); }} onMouseLeave={() => setHoveredOption(undefined)} onPointerDown={() => setKeyboardFocused(false)} onClick={() => choose(option)}>{multiple ? <CheckboxIndicator checked={selected} disabled={option.disabled} className="qizhi-select-popup__check" /> : null}{description == null ? content : <Popover role="tooltip" position={Number(popupStyle.left) >= 268 ? "left" : "top"} popupVisible={descriptionVisible} content={<span id={`${popupId}-description-${index}`}>{description}</span>}>{content}</Popover>}</Dropdown.Item>;
      })}
      {canCreate ? <Dropdown.Item itemKey={`create-${query}`} role="option" className="qizhi-select-popup__option" aria-selected={false} onClick={() => choose({ label: query.trim(), value: query.trim() }, true)}>{typeof allowCreate === "object" && allowCreate.formatter ? allowCreate.formatter(query.trim()) : `输入创建：${query.trim()}`}</Dropdown.Item> : null}
      {!visibleOptions.length && !canCreate ? <div className="qizhi-select-popup__empty" role="status">暂无数据</div> : null}
    </Dropdown.Menu>
  );

  return <div ref={rootRef} className={join("qizhi-select", `qizhi-select--${size}`, status !== "default" && `qizhi-select--${status}`, disabled && "qizhi-select--disabled", multiple && "qizhi-select--multiple", isOpen && "is-open", keyboardFocused && "is-keyboard-focused", hasValue && "has-value", autoWidth && "qizhi-select--auto-width", addBefore != null && "qizhi-select--grouped", className)} style={{ ...style, ...autoWidthStyle }}>
    {addBefore != null ? <span className="qizhi-select__before">{addBefore}</span> : null}
    {trigger ? trigger(commonTriggerProps) : <div className={`${CONTROL_CONTAINER_CLASS_NAME} qizhi-select__control`} style={autoWidth ? { width: "max-content" } : undefined}>
      {multiple ? <div className="qizhi-select__tags" aria-label="已选项">{shownTags.map((option, index) => <Tag key={String(option.value)} className={join("qizhi-select__tag", !renderTag && "qizhi-tag-closable")} draggable={dragToSort} onMouseDown={(event) => event.preventDefault()} onDragStart={(event: DragEvent<HTMLSpanElement>) => event.dataTransfer.setData("text/qizhi-select-index", String(index))} onDragOver={dragToSort ? (event) => event.preventDefault() : undefined} onDrop={dragToSort ? (event) => { event.preventDefault(); const from = Number(event.dataTransfer.getData("text/qizhi-select-index")); if (Number.isInteger(from) && from !== index) { const next = [...multipleValue]; const [item] = next.splice(from, 1); next.splice(index, 0, item); emitMultiple(next); } } : undefined}>{renderTag ? renderTag(option, true) : <>{option.label}<button className="qizhi-tag-close-btn" type="button" aria-label={`删除 ${textOf(option.label)}`} onClick={(event) => { event.stopPropagation(); remove(option.value); }}><CloseIcon /></button></>}</Tag>)}{hiddenCount > 0 ? <Tag className="qizhi-select__tag qizhi-select__tag--more">{renderMore ? renderMore(hiddenCount) : `+${hiddenCount} 个更多`}</Tag> : null}</div> : null}
      <input ref={inputRef} id={id} name={name} className="qizhi-select__input" role="combobox" aria-haspopup="listbox" aria-expanded={isOpen} aria-controls={popupId} aria-activedescendant={activeIndex >= 0 ? `${popupId}-option-${activeIndex}` : undefined} aria-autocomplete={searchEnabled ? "list" : undefined} aria-label={props["aria-label"] ?? placeholder} aria-labelledby={props["aria-labelledby"]} aria-describedby={props["aria-describedby"]} aria-invalid={props["aria-invalid"]} disabled={disabled} readOnly={!searchEnabled && !allowCreate && tokenSeparators.length === 0} placeholder={hasValue ? "" : placeholder} value={isOpen && (searchEnabled || allowCreate || tokenSeparators.length) ? query : multiple ? query : selectedSingle ? textOf(selectedSingle.label) : query} onChange={(event) => handleInput(event.target.value)} onPointerDown={() => setKeyboardFocused(false)} onBlur={(event) => { setKeyboardFocused(false); onBlur?.(event); }} onClick={() => setVisible(!isOpen)} onKeyDown={handleKeyDown} />
      {allowClear && hasValue && !disabled ? <button type="button" className="qizhi-select__clear" aria-label="清除选择" onMouseDown={(event) => event.preventDefault()} onClick={clear}><CloseIcon /></button> : null}
      <span className="qizhi-select__arrow" aria-hidden="true"><ArrowDownIcon viewBox="1.6 1.6 12.8 12.8" /></span>
    </div>}
    {isOpen ? createPortal(<div ref={popupRef} id={popupId} className="qizhi-select-popup" style={popupStyle} onScroll={onPopupScroll} onPointerDown={(event) => event.stopPropagation()}>{dropdownRender ? dropdownRender(menu) : menu}</div>, document.body) : null}
  </div>;
});
