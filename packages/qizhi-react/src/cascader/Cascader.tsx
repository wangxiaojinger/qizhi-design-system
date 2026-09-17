import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { CascaderPopup } from "./CascaderPopup";
import { CascaderTags } from "./CascaderTags";
import { CONTROL_CONTAINER_CLASS_NAME } from "../control-container/controlContainer";
import { ArrowDownIcon, CloseIcon } from "../icon";
import type {
  CascaderHandle,
  CascaderMultipleProps,
  CascaderOption,
  CascaderPathValue,
  CascaderProps,
  CascaderSingleProps,
} from "./Cascader.types";
import {
  filterPaths,
  findPathByValue,
  flattenLeafPaths,
  normalizeOptions,
  normalizeSelection,
} from "./cascaderModel";
import type { CascaderFlatPath, NormalizedCascaderOption } from "./cascaderModel";
import { useCascaderNavigation } from "./useCascaderNavigation";

const keyOf = (path: CascaderPathValue) => JSON.stringify(path);
const textOf = (value: unknown) => typeof value === "string" || typeof value === "number" ? String(value) : "";

function useControlled<T>(controlled: T | undefined, initial: T, onChange?: (value: T) => void) {
  const [inner, setInner] = useState(initial);
  const value = controlled === undefined ? inner : controlled;
  const setValue = useCallback((next: T) => {
    if (controlled === undefined) setInner(next);
    onChange?.(next);
  }, [controlled, onChange]);
  return [value, setValue] as const;
}

const CascaderBase = forwardRef<CascaderHandle, CascaderProps>(function Cascader(props, forwardedRef) {
  const {
    options,
    fieldNames,
    placeholder = "请选择",
    size = "default",
    status = "default",
    expandTrigger = "click",
    allowClear = false,
    addBefore,
    showSearch = false,
    filterOption,
    changeOnSelect = false,
    loadMore,
    renderFormat,
    trigger,
    open,
    defaultOpen = false,
    onOpenChange,
    className,
    style,
    id,
    name,
  } = props;
  const multiple = props.mode === "multiple";
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupId = `qizhi-cascader-popup-${useId().replace(/:/g, "")}`;
  const normalized = useMemo(() => normalizeOptions(options, fieldNames), [options, fieldNames]);
  const [isOpen, setOpen] = useControlled(open, defaultOpen, onOpenChange);
  const singleProps = props as CascaderSingleProps;
  const multipleProps = props as CascaderMultipleProps;
  const [singleValue, setSingleValue] = useControlled<CascaderPathValue | undefined>(
    multiple ? undefined : singleProps.value,
    multiple ? undefined : singleProps.defaultValue,
  );
  const [multipleValue, setMultipleValue] = useControlled<CascaderPathValue[]>(
    multiple ? multipleProps.value : undefined,
    multiple ? multipleProps.defaultValue ?? [] : [],
  );
  const [expandedPath, setExpandedPath] = useState<NormalizedCascaderOption[]>([]);
  const [query, setQuery] = useState("");
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const pendingIds = useRef(new Set<string>());
  const { active, setActive, move } = useCascaderNavigation(normalized);
  const activeRef = useRef<NormalizedCascaderOption | undefined>(undefined);
  activeRef.current = active;

  useImperativeHandle(forwardedRef, () => trigger ? triggerRef.current as HTMLElement : inputRef.current as HTMLInputElement);

  useEffect(() => {
    if (import.meta.env?.DEV && !multiple && singleProps.value !== undefined && singleProps.defaultValue !== undefined) {
      console.warn("QIZHI Cascader: value and defaultValue cannot be used together.");
    }
  }, [multiple, singleProps.value, singleProps.defaultValue]);

  const triggerNode = triggerRef.current ?? inputRef.current;
  const [popupStyle, setPopupStyle] = useState<CSSProperties>({ position: "fixed", left: 0, top: 0 });
  const updatePosition = useCallback(() => {
    const node = triggerRef.current ?? rootRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const columnCount = showSearch && query
      ? 1
      : 1 + expandedPath.filter((option) => option.children?.length).length;
    const width = Math.min(
      Math.max(rect.width, 240, columnCount * 160),
      window.innerWidth - 8,
    );
    const availableBelow = window.innerHeight - rect.bottom;
    const top = availableBelow >= 220 ? rect.bottom + 4 : Math.max(4, rect.top - 220);
    setPopupStyle({ position: "fixed", left: Math.max(4, Math.min(rect.left, window.innerWidth - width - 4)), top, width, zIndex: 1000 });
  }, [expandedPath, query, showSearch]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !popupRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [isOpen, setOpen, updatePosition]);

  const valuePaths = multiple ? multipleValue : singleValue ? [singleValue] : [];
  const selectedKeys = useMemo(() => new Set(valuePaths.map(keyOf)), [valuePaths]);
  const selectedOptionPaths = valuePaths.map((path) => findPathByValue(normalized, path)).filter(Boolean) as NormalizedCascaderOption[][];
  const tags = selectedOptionPaths.map((path) => ({ path: path.map((item) => item.value), label: path.map((item) => textOf(item.label)).join(" / ") }));
  const singleSelected = selectedOptionPaths[0] ?? [];
  const formattedValue = singleValue
    ? renderFormat
      ? renderFormat(singleSelected.map((item) => item.label), singleSelected.map((item) => item.source))
      : singleSelected.length
        ? singleSelected.map((item) => textOf(item.label)).join(" / ")
        : singleValue.join(" / ")
    : "";

  const menus = useMemo(() => {
    const result = [normalized];
    for (const option of expandedPath) if (option.children?.length) result.push(option.children);
    return result;
  }, [normalized, expandedPath]);
  const searchResults = showSearch && query ? filterPaths(flattenLeafPaths(normalized), query, filterOption) : undefined;

  const requestMore = async (option: NormalizedCascaderOption) => {
    if (!loadMore || option.isLeaf || pendingIds.current.has(option.id)) return;
    pendingIds.current.add(option.id);
    setBusyIds(new Set(pendingIds.current));
    try { await loadMore(option.source, option.sourcePath); }
    catch { /* The caller owns user-facing errors; keep this node retryable. */ }
    finally {
      pendingIds.current.delete(option.id);
      setBusyIds(new Set(pendingIds.current));
    }
  };

  const emitSelection = (optionPath: NormalizedCascaderOption[]) => {
    const path = optionPath.map((item) => item.value);
    const sources = optionPath.map((item) => item.source);
    if (multiple) {
      const exists = multipleValue.some((candidate) => keyOf(candidate) === keyOf(path));
      const next = normalizeSelection(exists ? multipleValue.filter((candidate) => keyOf(candidate) !== keyOf(path)) : [...multipleValue, path], multipleProps.checkedStrategy);
      setMultipleValue(next);
      multipleProps.onChange?.(next, next.map((value) => findPathByValue(normalized, value)?.map((item) => item.source) ?? []));
      return;
    }
    setSingleValue(path);
    singleProps.onChange?.(path, sources);
    setQuery("");
    setOpen(false);
    queueMicrotask(() => inputRef.current?.focus());
  };

  const activateOption = (option: NormalizedCascaderOption) => {
    if (option.disabled) return;
    const optionPath = findPathByValue(normalized, option.path) ?? [];
    if (!option.isLeaf) {
      setExpandedPath(optionPath);
      setActive(option);
      void requestMore(option);
      if (!changeOnSelect) return;
    }
    emitSelection(optionPath);
  };

  const previewOption = (option: NormalizedCascaderOption) => {
    if (option.disabled) return;
    setActive(option);
    if (option.isLeaf) return;
    setExpandedPath(findPathByValue(normalized, option.path) ?? []);
    void requestMore(option);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isOpen) { setOpen(true); return; }
      if (activeRef.current) activateOption(activeRef.current);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) setOpen(true);
      move(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "ArrowRight" && activeRef.current?.children?.length) {
      event.preventDefault();
      setExpandedPath(findPathByValue(normalized, activeRef.current.path) ?? []);
      setActive(activeRef.current.children.find((item) => !item.disabled));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const next = expandedPath.slice(0, -1);
      setExpandedPath(next);
      setActive(next.at(-1));
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      queueMicrotask(() => (triggerRef.current ?? inputRef.current)?.focus());
    }
  };

  const clear = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (multiple) {
      setMultipleValue([]);
      multipleProps.onChange?.([], []);
    } else {
      setSingleValue(undefined);
      singleProps.onChange?.(undefined, []);
    }
    setQuery("");
    setOpen(false);
    queueMicrotask(() => inputRef.current?.focus());
  };

  const reorder = (from: number, to: number) => {
    const next = [...multipleValue];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setMultipleValue(next);
    multipleProps.onChange?.(next, next.map((value) => findPathByValue(normalized, value)?.map((entry) => entry.source) ?? []));
  };

  const commonTriggerProps = {
    ref: (node: HTMLButtonElement | null) => { triggerRef.current = node; },
    role: "combobox" as const,
    tabIndex: 0,
    "aria-haspopup": "listbox" as const,
    "aria-expanded": isOpen,
    "aria-controls": popupId,
    "aria-label": props["aria-label"] ?? placeholder,
    onClick: () => setOpen(!isOpen),
    onKeyDown: handleKeyDown,
  };

  return (
    <div
      ref={rootRef}
      className={[
        CONTROL_CONTAINER_CLASS_NAME,
        "qizhi-cascader",
        `qizhi-cascader--${size}`,
        trigger && "qizhi-cascader--custom-trigger",
        multiple && tags.length && "qizhi-cascader--has-tags",
        showSearch && "qizhi-cascader--searchable",
        status !== "default" && `qizhi-cascader--${status}`,
        isOpen && "is-open",
        className,
      ].filter(Boolean).join(" ")}
      style={style}
      onMouseEnter={expandTrigger === "hover" ? () => setOpen(true) : undefined}
    >
      {trigger ? trigger(commonTriggerProps) : (
        <>
          {addBefore ? <span className="qizhi-cascader__before">{addBefore}</span> : null}
          {multiple && tags.length ? <CascaderTags items={tags} draggable={multipleProps.dragToSort} onReorder={reorder} /> : null}
          <input
            ref={inputRef}
            id={id}
            name={name}
            className="qizhi-cascader__input"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={popupId}
            aria-activedescendant={active?.id}
            aria-autocomplete={showSearch ? "list" : undefined}
            aria-label={props["aria-label"] ?? placeholder}
            aria-labelledby={props["aria-labelledby"]}
            readOnly={!showSearch}
            placeholder={multiple && tags.length ? "" : placeholder}
            value={showSearch && isOpen ? query : multiple ? "" : textOf(formattedValue)}
            onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
            onClick={() => setOpen(!isOpen)}
            onKeyDown={handleKeyDown}
          />
          {allowClear && valuePaths.length ? <button type="button" className="qizhi-cascader__clear" aria-label="清除" onClick={clear}><CloseIcon /></button> : null}
          <span className="qizhi-cascader__arrow" aria-hidden="true"><ArrowDownIcon viewBox="1.6 1.6 12.8 12.8" /></span>
        </>
      )}
      {isOpen ? (
        <CascaderPopup
          ref={popupRef}
          id={popupId}
          style={popupStyle}
          menus={menus}
          searchResults={searchResults}
          multiple={multiple}
          busyIds={busyIds}
          selectedKeys={selectedKeys}
          onOptionClick={activateOption}
          onOptionEnter={expandTrigger === "hover" ? previewOption : setActive}
          onSearchResult={(path: CascaderFlatPath) => {
            const normalizedPath = findPathByValue(normalized, path.valuePath);
            if (normalizedPath) emitSelection(normalizedPath);
          }}
          onPointerDown={(event) => event.stopPropagation()}
        />
      ) : null}
    </div>
  );
});

export const Cascader = CascaderBase;
