import { Fragment, forwardRef, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, DragEvent, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Dropdown } from "../dropdown/Dropdown";
import { Popover } from "../popover/Popover";
import { CheckboxIndicator } from "../checkbox/CheckboxIndicator";
import { ArrowDownIcon, CloseIcon } from "../icon";
import { Tag } from "../tag/Tag";
import { CONTROL_CONTAINER_CLASS_NAME } from "../control-container/controlContainer";
import type { SelectHandle, SelectMultipleProps, SelectOption, SelectOptionGroup, SelectProps, SelectRawValue, SelectSingleProps } from "./Select.types";
import "./select.css";

const join = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ");
const textOf = (value: ReactNode) => typeof value === "string" || typeof value === "number" ? String(value) : "";
const same = (a: SelectRawValue, b: SelectRawValue) => String(a) === String(b);
const isOptionGroup = (item: SelectOption | SelectOptionGroup): item is SelectOptionGroup => "options" in item;

interface SelectOptionEntry {
  option: SelectOption;
  groupIndex?: number;
  groupLabel?: ReactNode;
}

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
    searchValue,
    filterOption,
    onSearch,
    onSelect,
    onClear,
    onFocus,
    loading = false,
    notFoundContent = "暂无数据",
    allowCreate = false,
    tokenSeparators = [],
    maxTagCount,
    virtual = true,
    listHeight = 256,
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
  const controlRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupId = `qizhi-select-popup-${useId().replace(/:/g, "")}`;
  const [createdOptions, setCreatedOptions] = useState<SelectOption[]>([]);
  const sourceEntries = useMemo<SelectOptionEntry[]>(() => sourceOptions.flatMap((item, groupIndex) => isOptionGroup(item)
    ? item.options.map((option) => ({ option, groupIndex, groupLabel: item.label }))
    : [{ option: item }]), [sourceOptions]);
  const optionEntries = useMemo<SelectOptionEntry[]>(() => [...sourceEntries, ...createdOptions.map((option) => ({ option }))], [createdOptions, sourceEntries]);
  const options = useMemo(() => optionEntries.map((entry) => entry.option), [optionEntries]);
  const [isOpen, setOpen] = useControlled(open, defaultOpen, onOpenChange);
  const [singleValue, setSingleValue] = useControlled<SelectRawValue | undefined>(multiple ? undefined : singleProps.value, multiple ? undefined : singleProps.defaultValue);
  const [multipleValue, setMultipleValue] = useControlled<SelectRawValue[]>(multiple ? multipleProps.value : undefined, multiple ? multipleProps.defaultValue ?? [] : []);
  const [innerQuery, setInnerQuery] = useState("");
  const query = searchValue === undefined ? innerQuery : searchValue;
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hoveredOption, setHoveredOption] = useState<SelectRawValue>();
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [popupStyle, setPopupStyle] = useState<CSSProperties>({ position: "fixed", left: 0, top: 0 });
  const [virtualScrollTop, setVirtualScrollTop] = useState(0);
  const searchEnabled = !!showSearch;
  const inputEditable = searchEnabled || !!allowCreate || tokenSeparators.length > 0;
  const retainInput = typeof showSearch === "object" && !!showSearch.retainInputValue;
  const selectedValues = multiple ? multipleValue : singleValue === undefined ? [] : [singleValue];
  const selectedOptions = useMemo(() => selectedValues.map((value) => options.find((option) => same(option.value, value)) ?? (allowCreate ? { label: String(value), value } : undefined)).filter(Boolean) as SelectOption[], [allowCreate, options, selectedValues]);
  const selectedSingle = selectedOptions[0];
  const hasValue = selectedOptions.length > 0;
  const [responsiveTagCount, setResponsiveTagCount] = useState(selectedOptions.length);
  const tagMeasureRefs = useRef(new Map<string, HTMLElement>());
  const moreMeasureRefs = useRef(new Map<number, HTMLSpanElement>());

  useImperativeHandle(forwardedRef, () => (triggerRef.current ?? inputRef.current) as SelectHandle);

  const setVisible = useCallback((next: boolean) => {
    if (disabled) return;
    setOpen(next);
    if (!next) setHoveredOption(undefined);
    if (!next) setActiveIndex(-1);
    if (!next && !retainInput && searchValue === undefined) setInnerQuery("");
  }, [disabled, retainInput, searchValue, setOpen]);

  const updatePosition = useCallback(() => {
    const node = triggerRef.current ?? controlRef.current ?? rootRef.current;
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

  useEffect(() => {
    if (!isOpen || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updatePosition);
    const triggerNode = triggerRef.current ?? controlRef.current ?? rootRef.current;
    if (triggerNode) observer.observe(triggerNode);
    if (popupRef.current) observer.observe(popupRef.current);
    return () => observer.disconnect();
  }, [isOpen, updatePosition]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleEntries = optionEntries.filter(({ option }) => {
    if (hideSelected && multipleValue.some((value) => same(value, option.value))) return false;
    if (!normalizedQuery) return true;
    return filterOption ? filterOption(query, option) : textOf(option.label).toLowerCase().includes(normalizedQuery) || String(option.value).toLowerCase().includes(normalizedQuery);
  });
  const visibleOptions = visibleEntries.map((entry) => entry.option);
  const selectionAtLimit = multiple && multipleProps.maxCount !== undefined && multipleValue.length >= Math.max(0, multipleProps.maxCount);
  const canCreate = !loading && !!allowCreate && !!query.trim() && !options.some((option) => textOf(option.label) === query.trim() || String(option.value) === query.trim());
  const virtualItemHeight = 32;
  const virtualEnabled = virtual && sourceOptions.length >= 100
    && sourceOptions.every((item) => !isOptionGroup(item))
    && !renderOption && !renderOptionDescription && !canCreate;
  const normalizedListHeight = Math.max(virtualItemHeight, listHeight);
  const virtualOverscan = 2;
  const virtualStart = virtualEnabled
    ? Math.max(0, Math.floor(virtualScrollTop / virtualItemHeight) - virtualOverscan)
    : 0;
  const virtualEnd = virtualEnabled
    ? Math.min(visibleEntries.length, virtualStart + Math.ceil(normalizedListHeight / virtualItemHeight) + virtualOverscan * 2)
    : visibleEntries.length;
  const isOptionDisabled = (option: SelectOption) => !!option.disabled || !!(selectionAtLimit && !multipleValue.some((value) => same(value, option.value)));
  const navigable = loading ? [] : [...visibleOptions, ...(canCreate ? [{ label: query.trim(), value: query.trim() }] : [])].filter((option) => !isOptionDisabled(option));
  const activeOption = activeIndex >= 0 ? navigable[activeIndex] : undefined;
  const activeVisibleIndex = activeOption ? visibleOptions.findIndex((option) => same(option.value, activeOption.value)) : -1;
  const activeDescendant = activeOption
    ? activeVisibleIndex >= 0 ? `${popupId}-option-${activeVisibleIndex}` : `${popupId}-option-create`
    : undefined;

  useEffect(() => {
    if (!isOpen || !activeDescendant) return;
    const popup = popupRef.current;
    if (!popup) return;
    if (virtualEnabled && activeVisibleIndex >= 0) {
      const optionTop = activeVisibleIndex * virtualItemHeight;
      const optionBottom = optionTop + virtualItemHeight;
      const popupStyle = window.getComputedStyle(popup);
      const visibleHeight = Math.max(
        virtualItemHeight,
        popup.clientHeight
          - Number.parseFloat(popupStyle.paddingTop || "0")
          - Number.parseFloat(popupStyle.paddingBottom || "0"),
      );
      let nextScrollTop = popup.scrollTop;
      if (optionTop < popup.scrollTop) nextScrollTop = optionTop;
      else if (optionBottom > popup.scrollTop + visibleHeight) nextScrollTop = optionBottom - visibleHeight;
      if (nextScrollTop !== popup.scrollTop) popup.scrollTop = nextScrollTop;
      if (nextScrollTop !== virtualScrollTop) setVirtualScrollTop(nextScrollTop);
      return;
    }
    const activeElement = document.getElementById(activeDescendant);
    if (!activeElement) return;
    const popupBounds = popup.getBoundingClientRect();
    const activeBounds = activeElement.getBoundingClientRect();
    if (activeBounds.top < popupBounds.top) popup.scrollTop -= popupBounds.top - activeBounds.top;
    else if (activeBounds.bottom > popupBounds.bottom) popup.scrollTop += activeBounds.bottom - popupBounds.bottom;
  }, [activeDescendant, activeVisibleIndex, isOpen, normalizedListHeight, virtualEnabled, virtualScrollTop]);

  const emitMultiple = (next: SelectRawValue[]) => {
    setMultipleValue(next);
    multipleProps.onChange?.(next, next.map((value) => options.find((option) => same(option.value, value))).filter(Boolean) as SelectOption[]);
  };

  const choose = (option: SelectOption, created = false) => {
    if (loading || isOptionDisabled(option)) return;
    let resolved = option;
    if (created) {
      resolved = { label: option.label, value: option.value };
      setCreatedOptions((current) => [...current, resolved]);
    }
    if (multiple) {
      const exists = multipleValue.some((value) => same(value, resolved.value));
      emitMultiple(exists ? multipleValue.filter((value) => !same(value, resolved.value)) : [...multipleValue, resolved.value]);
      if (exists) multipleProps.onDeselect?.(resolved.value, resolved);
      else onSelect?.(resolved.value, resolved);
      if (searchValue === undefined) setInnerQuery("");
      return;
    }
    setSingleValue(resolved.value);
    singleProps.onChange?.(resolved.value, resolved);
    onSelect?.(resolved.value, resolved);
    setVisible(false);
    queueMicrotask(() => inputRef.current?.focus());
  };

  const clear = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (multiple) emitMultiple([]);
    else { setSingleValue(undefined); singleProps.onChange?.(undefined, undefined); }
    onClear?.();
    if (searchValue === undefined) setInnerQuery("");
    setVisible(false);
    queueMicrotask(() => inputRef.current?.focus());
  };

  const remove = (value: SelectRawValue) => {
    const option = selectedOptions.find((item) => same(item.value, value));
    emitMultiple(multipleValue.filter((item) => !same(item, value)));
    if (option) multipleProps.onDeselect?.(value, option);
  };

  const commitTokens = (input: string) => {
    if (!multiple || !tokenSeparators.length) return false;
    const escaped = tokenSeparators.map((separator) => separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("");
    if (!new RegExp(`[${escaped}]`).test(input)) return false;
    const tokens = input.split(new RegExp(`[${escaped}]`)).map((item) => item.trim()).filter(Boolean);
    const next = [...multipleValue];
    const added: SelectOption[] = [];
    tokens.forEach((token) => {
      let option = options.find((candidate) => textOf(candidate.label) === token || String(candidate.value) === token);
      if (!option && allowCreate) {
        option = { label: token, value: token };
        setCreatedOptions((current) => current.some((item) => same(item.value, token)) ? current : [...current, option as SelectOption]);
      }
      if (option && !option.disabled && !next.some((value) => same(value, option!.value)) && (multipleProps.maxCount === undefined || next.length < Math.max(0, multipleProps.maxCount))) {
        next.push(option.value);
        added.push(option);
      }
    });
    emitMultiple(next);
    added.forEach((option) => onSelect?.(option.value, option));
    if (searchValue === undefined) setInnerQuery("");
    return true;
  };

  const handleInput = (next: string) => {
    if (commitTokens(next)) return;
    if (searchValue === undefined) setInnerQuery(next);
    onSearch?.(next);
    if (popupRef.current) popupRef.current.scrollTop = 0;
    setVirtualScrollTop(0);
    setVisible(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const handledKeys = ["Escape", "ArrowDown", "ArrowUp", "Enter", " "];
    if (event.metaKey || event.ctrlKey || event.altKey || !handledKeys.includes(event.key)) return;
    if (event.key === " " && inputEditable) return;
    setKeyboardFocused(true);
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setVisible(false);
      queueMicrotask(() => (triggerRef.current ?? inputRef.current)?.focus());
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) setVisible(true);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => {
        if (!navigable.length) return -1;
        if (current < 0 || current >= navigable.length) return delta > 0 ? 0 : navigable.length - 1;
        return (current + delta + navigable.length) % navigable.length;
      });
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

  const measureResponsiveTags = useCallback(() => {
    if (maxTagCount !== "responsive") return;
    const available = Math.max(0, (controlRef.current?.clientWidth ?? 0) - 56);
    if (!available) return;
    let visible = selectedOptions.length;
    while (visible > 0) {
      const hidden = selectedOptions.length - visible;
      const tagWidth = selectedOptions.slice(0, visible).reduce((total, option) => total + (tagMeasureRefs.current.get(String(option.value))?.getBoundingClientRect().width ?? 0), 0);
      const summaryWidth = hidden ? (moreMeasureRefs.current.get(hidden)?.getBoundingClientRect().width ?? 0) : 0;
      const count = visible + (hidden ? 1 : 0);
      if (tagWidth + summaryWidth + Math.max(0, count - 1) * 4 <= available) break;
      visible -= 1;
    }
    setResponsiveTagCount(visible);
  }, [maxTagCount, renderMore, selectedOptions]);

  useLayoutEffect(() => {
    setResponsiveTagCount(selectedOptions.length);
    measureResponsiveTags();
  }, [measureResponsiveTags, selectedOptions.length]);

  useEffect(() => {
    if (maxTagCount !== "responsive" || typeof ResizeObserver === "undefined" || !controlRef.current) return;
    const observer = new ResizeObserver(measureResponsiveTags);
    observer.observe(controlRef.current);
    return () => observer.disconnect();
  }, [maxTagCount, measureResponsiveTags]);

  const autoWidthStyle = typeof autoWidth === "object" ? { minWidth: autoWidth.minWidth, maxWidth: autoWidth.maxWidth } : undefined;
  const visibleTagCount = maxTagCount === "responsive" ? responsiveTagCount : typeof maxTagCount === "number" ? Math.max(0, maxTagCount) : selectedOptions.length;
  const shownTags = selectedOptions.slice(0, visibleTagCount);
  const hiddenCount = selectedOptions.length - shownTags.length;
  const isFocusWithin = (target: EventTarget | null) => target instanceof Node && (
    !!rootRef.current?.contains(target)
    || !!popupRef.current?.contains(target)
    || !!triggerRef.current?.contains(target)
  );
  const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
    if (!isFocusWithin(event.relatedTarget)) onFocus?.(event);
  };
  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (isFocusWithin(event.relatedTarget)) return;
    if (event.relatedTarget) {
      setKeyboardFocused(false);
      onBlur?.(event);
      setVisible(false);
      return;
    }
    queueMicrotask(() => {
      if (isFocusWithin(document.activeElement)) return;
      setKeyboardFocused(false);
      onBlur?.(event);
      setVisible(false);
    });
  };
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
    onBlur: handleBlur,
  };

  const renderOptionItem = (option: SelectOption, index: number, virtualStyle?: CSSProperties) => {
    const selected = selectedValues.some((value) => same(value, option.value));
    const optionDisabled = isOptionDisabled(option);
    const description = renderOptionDescription?.(option);
    const descriptionVisible = !optionDisabled && (keyboardFocused ? navigable[activeIndex]?.value === option.value : hoveredOption === option.value);
    const content = <span className="qizhi-select-popup__option-content">{renderOption ? renderOption(option) : option.label}</span>;
    return <Dropdown.Item key={String(option.value)} id={`${popupId}-option-${index}`} itemKey={String(option.value)} role="option" className={join("qizhi-select-popup__option", selected && "is-selected", activeVisibleIndex === index && "is-active")} style={virtualStyle} aria-setsize={virtualEnabled ? visibleEntries.length : undefined} aria-posinset={virtualEnabled ? index + 1 : undefined} aria-selected={selected} aria-describedby={description != null && descriptionVisible ? `${popupId}-description-${index}` : undefined} aria-disabled={optionDisabled || undefined} disabled={optionDisabled} onMouseEnter={() => { setKeyboardFocused(false); setHoveredOption(option.value); }} onMouseLeave={() => setHoveredOption(undefined)} onPointerDown={(event) => { event.preventDefault(); setKeyboardFocused(false); }} onClick={() => choose(option)}>{description == null ? content : <Popover role="tooltip" position={Number(popupStyle.left) >= 268 ? "left" : "top"} popupVisible={descriptionVisible} content={<span id={`${popupId}-description-${index}`}>{description}</span>}>{content}</Popover>}{multiple ? <CheckboxIndicator checked={selected} disabled={optionDisabled} className="qizhi-select-popup__check" /> : null}</Dropdown.Item>;
  };
  const visibleSections: Array<{ groupIndex?: number; groupLabel?: ReactNode; entries: Array<{ entry: SelectOptionEntry; index: number }> }> = [];
  visibleEntries.forEach((entry, index) => {
    const previous = visibleSections.at(-1);
    if (entry.groupIndex !== undefined && previous?.groupIndex === entry.groupIndex) {
      previous.entries.push({ entry, index });
    } else {
      visibleSections.push({ groupIndex: entry.groupIndex, groupLabel: entry.groupLabel, entries: [{ entry, index }] });
    }
  });

  const menu = (
    <Dropdown.Menu className="qizhi-select-popup__menu" role="listbox" aria-multiselectable={multiple || undefined}>
      {!loading && virtualEnabled ? <div className="qizhi-select-popup__virtual" style={{ height: visibleEntries.length * virtualItemHeight }}>
        {visibleEntries.slice(virtualStart, virtualEnd).map((entry, offset) => {
          const index = virtualStart + offset;
          return renderOptionItem(entry.option, index, { position: "absolute", top: index * virtualItemHeight, height: virtualItemHeight });
        })}
      </div> : null}
      {!loading && !virtualEnabled ? visibleSections.map((section, sectionIndex) => {
        const optionNodes = section.entries.map(({ entry, index }) => renderOptionItem(entry.option, index));
        if (section.groupIndex === undefined) return <Fragment key={`options-${sectionIndex}`}>{optionNodes}</Fragment>;
        const groupId = `${popupId}-group-${section.groupIndex}`;
        return <div key={groupId} className="qizhi-select-popup__group" role="group" aria-labelledby={groupId}><div id={groupId} className="qizhi-select-popup__group-label">{section.groupLabel}</div>{optionNodes}</div>;
      }) : null}
      {canCreate ? <Dropdown.Item id={`${popupId}-option-create`} itemKey={`create-${query}`} role="option" className={join("qizhi-select-popup__option", activeVisibleIndex < 0 && activeOption && "is-active")} aria-selected={false} onPointerDown={(event) => event.preventDefault()} onClick={() => choose({ label: query.trim(), value: query.trim() }, true)}>{typeof allowCreate === "object" && allowCreate.formatter ? allowCreate.formatter(query.trim()) : `输入创建：${query.trim()}`}</Dropdown.Item> : null}
      {loading ? <div className="qizhi-select-popup__empty is-loading" role="status">正在加载</div> : !visibleOptions.length && !canCreate && notFoundContent != null ? <div className="qizhi-select-popup__empty" role="status">{notFoundContent}</div> : null}
    </Dropdown.Menu>
  );

  return <div ref={rootRef} className={join("qizhi-select", `qizhi-select--${size}`, status !== "default" && `qizhi-select--${status}`, disabled && "qizhi-select--disabled", multiple && "qizhi-select--multiple", isOpen && "is-open", keyboardFocused && "is-keyboard-focused", hasValue && "has-value", autoWidth && "qizhi-select--auto-width", addBefore != null && "qizhi-select--grouped", className)} style={{ ...style, ...autoWidthStyle }} onFocus={handleFocus}>
    {addBefore != null ? <span className="qizhi-select__before">{addBefore}</span> : null}
    {trigger ? trigger(commonTriggerProps) : <div ref={controlRef} className={`${CONTROL_CONTAINER_CLASS_NAME} qizhi-select__control`} style={autoWidth ? { width: "max-content" } : undefined}>
      {multiple ? <div className="qizhi-select__tags" aria-label="已选项">{shownTags.map((option, index) => <Tag key={String(option.value)} className={join("qizhi-select__tag", !renderTag && "qizhi-tag-closable")} draggable={dragToSort} onMouseDown={(event) => event.preventDefault()} onDragStart={(event: DragEvent<HTMLSpanElement>) => event.dataTransfer.setData("text/qizhi-select-index", String(index))} onDragOver={dragToSort ? (event) => event.preventDefault() : undefined} onDrop={dragToSort ? (event) => { event.preventDefault(); const from = Number(event.dataTransfer.getData("text/qizhi-select-index")); if (Number.isInteger(from) && from !== index) { const next = [...multipleValue]; const [item] = next.splice(from, 1); next.splice(index, 0, item); emitMultiple(next); } } : undefined}>{renderTag ? renderTag(option, true) : <>{option.label}<button className="qizhi-tag-close-btn" type="button" aria-label={`删除 ${textOf(option.label)}`} onClick={(event) => { event.stopPropagation(); remove(option.value); }}><CloseIcon /></button></>}</Tag>)}{hiddenCount > 0 ? <Tag className="qizhi-select__tag qizhi-select__tag--more">{renderMore ? renderMore(hiddenCount) : `+${hiddenCount} 个更多`}</Tag> : null}</div> : null}
      {multiple && maxTagCount === "responsive" ? <div className="qizhi-select__measure" aria-hidden="true">{selectedOptions.map((option) => <Tag key={String(option.value)} ref={(node) => { if (node) tagMeasureRefs.current.set(String(option.value), node); else tagMeasureRefs.current.delete(String(option.value)); }}>{renderTag ? renderTag(option, true) : <>{option.label}<CloseIcon /></>}</Tag>)}{selectedOptions.map((_, index) => { const count = index + 1; return <span key={count} ref={(node) => { if (node) moreMeasureRefs.current.set(count, node); else moreMeasureRefs.current.delete(count); }}>{renderMore ? renderMore(count) : `+${count} 个更多`}</span>; })}</div> : null}
      <input ref={inputRef} id={id} name={name} className="qizhi-select__input" role="combobox" aria-haspopup="listbox" aria-expanded={isOpen} aria-controls={popupId} aria-activedescendant={activeDescendant} aria-autocomplete={searchEnabled ? "list" : undefined} aria-label={props["aria-label"] ?? placeholder} aria-labelledby={props["aria-labelledby"]} aria-describedby={props["aria-describedby"]} aria-invalid={props["aria-invalid"]} disabled={disabled} readOnly={!inputEditable} placeholder={hasValue ? "" : placeholder} value={isOpen && inputEditable ? query : multiple ? query : selectedSingle ? textOf(selectedSingle.label) : query} onChange={(event) => handleInput(event.target.value)} onPointerDown={() => setKeyboardFocused(false)} onBlur={handleBlur} onClick={() => setVisible(!isOpen)} onKeyDown={handleKeyDown} />
      {allowClear && hasValue && !disabled ? <button type="button" className="qizhi-select__clear" aria-label="清除选择" onMouseDown={(event) => event.preventDefault()} onBlur={handleBlur} onClick={clear}><CloseIcon /></button> : null}
      <span className="qizhi-select__arrow" aria-hidden="true"><ArrowDownIcon viewBox="1.6 1.6 12.8 12.8" /></span>
    </div>}
    {isOpen ? createPortal(<div ref={popupRef} id={popupId} className="qizhi-select-popup" style={{ ...popupStyle, maxHeight: virtualEnabled ? normalizedListHeight : popupStyle.maxHeight }} aria-busy={loading || undefined} onBlur={handleBlur} onScroll={(event) => { if (virtualEnabled) setVirtualScrollTop(event.currentTarget.scrollTop); onPopupScroll?.(event); }} onPointerDown={(event) => event.stopPropagation()}>{dropdownRender ? dropdownRender(menu) : menu}</div>, document.body) : null}
  </div>;
});
