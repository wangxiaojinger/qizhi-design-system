import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { controlContainerClassName } from "../control-container/controlContainer";
import {
  ArrowDownIcon,
  CloseIcon,
  SearchIcon,
} from "../icon";
import { Tag } from "../tag/Tag";
import { TreeSelectPopup } from "./TreeSelectPopup";
import "./treeSelect.css";
import type {
  TreeSelectMultipleProps,
  TreeSelectOption,
  TreeSelectProps,
  TreeSelectRawValue,
  TreeSelectSingleProps,
  TreeSelectValue,
} from "./TreeSelect.types";
import {
  filterTreeSelectOptions,
  findTreeSelectOption,
  rawTreeSelectValue,
  replaceTreeSelectChildren,
  treeSelectBranchValues,
} from "./treeSelectModel";

const joinClassName = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(" ");

function optionText(option: TreeSelectOption): string {
  return typeof option.label === "string" || typeof option.label === "number"
    ? String(option.label)
    : String(option.value);
}

function TreeSelectRoot(props: TreeSelectProps) {
  const {
    treeData,
    placeholder = "请选择",
    size = "default",
    status = "default",
    disabled = false,
    allowClear = false,
    addBefore,
    labelInValue = false,
    renderFormat,
    showSearch = false,
    filterTreeNode,
    onSearch,
    loadMore,
    defaultExpandedKeys,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    className,
    style,
    id,
    name,
    "aria-label": ariaLabel = placeholder,
    "aria-labelledby": ariaLabelledBy,
  } = props;
  const multiple = props.multiple === true;
  const controlledValue = props.value !== undefined;
  const [singleValue, setSingleValue] = useState<TreeSelectValue | undefined>(
    multiple ? undefined : (props as TreeSelectSingleProps).defaultValue,
  );
  const [multipleValue, setMultipleValue] = useState<readonly TreeSelectValue[]>(
    multiple ? (props as TreeSelectMultipleProps).defaultValue ?? [] : [],
  );
  const currentValues = multiple
    ? controlledValue
      ? (props as TreeSelectMultipleProps).value ?? []
      : multipleValue
    : [
        controlledValue
          ? (props as TreeSelectSingleProps).value
          : singleValue,
      ].filter((value): value is TreeSelectValue => value !== undefined);
  const rawValues = currentValues.map(rawTreeSelectValue);
  const selectedSet = useMemo(() => new Set(rawValues), [rawValues.join("|")]);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = controlledOpen ?? innerOpen;
  const [query, setQuery] = useState("");
  const [expandedValues, setExpandedValues] = useState<ReadonlySet<TreeSelectRawValue>>(
    () => new Set(
      defaultExpandedKeys ?? treeSelectBranchValues(treeData),
    ),
  );
  const [loadingValues, setLoadingValues] = useState<ReadonlySet<TreeSelectRawValue>>(
    () => new Set(),
  );
  const [options, setOptions] = useState(treeData);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupId = `qizhi-tree-select-${useId().replace(/:/g, "")}`;
  const [popupPosition, setPopupPosition] = useState({
    left: -10000,
    top: -10000,
    width: 300,
    ready: false,
  });

  useEffect(() => setOptions(treeData), [treeData]);

  const setOpen = (next: boolean) => {
    if (disabled || next === open) return;
    if (controlledOpen === undefined) setInnerOpen(next);
    onOpenChange?.(next);
    if (!next) setQuery("");
  };

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      const input = rootRef.current?.querySelector("input");
      (input ?? rootRef.current)?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current || !popupRef.current) return;
    const trigger = rootRef.current.getBoundingClientRect();
    const popup = popupRef.current.getBoundingClientRect();
    const width = Math.max(trigger.width, 300);
    const left = Math.min(
      Math.max(trigger.left, 8),
      Math.max(8, window.innerWidth - width - 8),
    );
    const below = trigger.bottom + 4;
    const top = below + popup.height <= window.innerHeight - 8
      ? below
      : Math.max(8, trigger.top - popup.height - 4);
    setPopupPosition({ left, top, width, ready: true });
  }, [open, options, query, expandedValues]);

  const visibleOptions = filterTreeNode === false
    ? options
    : filterTreeSelectOptions(options, query, filterTreeNode);

  const outputValue = (option: TreeSelectOption): TreeSelectValue =>
    labelInValue
      ? { label: option.label, value: option.value }
      : option.value;

  const commitSingle = (option: TreeSelectOption | undefined) => {
    const nextValue = option ? outputValue(option) : undefined;
    if (!controlledValue) setSingleValue(nextValue);
    (props as TreeSelectSingleProps).onChange?.(nextValue, option);
  };

  const commitMultiple = (nextOptions: readonly TreeSelectOption[]) => {
    const nextValues = nextOptions.map(outputValue);
    if (!controlledValue) setMultipleValue(nextValues);
    (props as TreeSelectMultipleProps).onChange?.(nextValues, nextOptions);
  };

  const selectedOptions = rawValues.flatMap((value) => {
    const match = findTreeSelectOption(options, value);
    return match ? [match.option] : [];
  });

  const selectOption = (option: TreeSelectOption) => {
    if (option.disabled) return;
    if (!multiple) {
      commitSingle(option);
      setOpen(false);
      return;
    }
    const alreadySelected = selectedSet.has(option.value);
    commitMultiple(
      alreadySelected
        ? selectedOptions.filter((item) => item.value !== option.value)
        : [...selectedOptions, option],
    );
  };

  const toggleOption = async (option: TreeSelectOption) => {
    const expanded = expandedValues.has(option.value);
    if (expanded) {
      setExpandedValues((current) => {
        const next = new Set(current);
        next.delete(option.value);
        return next;
      });
      return;
    }

    setExpandedValues((current) => new Set(current).add(option.value));
    if (option.children?.length || option.isLeaf !== false || !loadMore) return;

    setLoadingValues((current) => new Set(current).add(option.value));
    try {
      const children = await loadMore(option);
      if (children) {
        setOptions((current) =>
          replaceTreeSelectChildren(current, option.value, children));
      }
    } finally {
      setLoadingValues((current) => {
        const next = new Set(current);
        next.delete(option.value);
        return next;
      });
    }
  };

  const clear = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (multiple) commitMultiple([]);
    else commitSingle(undefined);
    setOpen(false);
  };

  const removeTag = (option: TreeSelectOption) => {
    commitMultiple(selectedOptions.filter((item) => item.value !== option.value));
  };

  const handleKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  };

  const popup = open
    ? createPortal(
        <div
          ref={popupRef}
          id={popupId}
          className="qizhi-tree-select__popup"
          style={{
            left: popupPosition.left,
            top: popupPosition.top,
            width: popupPosition.width,
            visibility: popupPosition.ready ? "visible" : "hidden",
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={handleKeyboard}
        >
          <TreeSelectPopup
            options={visibleOptions}
            multiple={multiple}
            selectedValues={selectedSet}
            expandedValues={expandedValues}
            loadingValues={loadingValues}
            forceExpanded={Boolean(query) && filterTreeNode !== false}
            onToggle={toggleOption}
            onSelect={selectOption}
          />
        </div>,
        document.body,
      )
    : null;

  const control = (
    <div
      ref={rootRef}
      data-testid="qizhi-tree-select"
      className={controlContainerClassName(
        "qizhi-tree-select",
        `qizhi-tree-select--${size}`,
        status !== "default" && `qizhi-tree-select--${status}`,
        multiple && "qizhi-tree-select--multiple",
        open && "is-open",
        rawValues.length > 0 && "has-value",
        disabled && "is-disabled",
        className,
      )}
      style={style}
      role={showSearch ? undefined : "combobox"}
      tabIndex={showSearch || disabled ? undefined : 0}
      aria-haspopup="tree"
      aria-expanded={open}
      aria-controls={popupId}
      aria-disabled={disabled || undefined}
      aria-label={showSearch ? undefined : ariaLabel}
      aria-labelledby={showSearch ? undefined : ariaLabelledBy}
      onClick={() => setOpen(!open)}
      onKeyDown={handleKeyboard}
    >
      {multiple ? (
        <div className="qizhi-tree-select__tags">
          {selectedOptions.map((option) => (
            <Tag
              key={option.value}
              closable
              onClose={(event) => {
                event.stopPropagation();
                removeTag(option);
              }}
            >
              {renderFormat?.(option) ?? option.label}
            </Tag>
          ))}
          {showSearch ? (
            <input
              id={id}
              name={name}
              className="qizhi-tree-select__search"
              role="combobox"
              aria-haspopup="tree"
              aria-expanded={open}
              aria-controls={popupId}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              value={query}
              placeholder={rawValues.length ? "" : placeholder}
              disabled={disabled}
              onChange={(event) => {
                setQuery(event.target.value);
                onSearch?.(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyboard}
              onClick={(event) => event.stopPropagation()}
            />
          ) : rawValues.length === 0 ? (
            <span className="qizhi-tree-select__placeholder">{placeholder}</span>
          ) : null}
        </div>
      ) : showSearch ? (
        <input
          id={id}
          name={name}
          className="qizhi-tree-select__search"
          role="combobox"
          aria-haspopup="tree"
          aria-expanded={open}
          aria-controls={popupId}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          value={query}
          placeholder={selectedOptions.length ? "" : placeholder}
          disabled={disabled}
          onChange={(event) => {
            setQuery(event.target.value);
            onSearch?.(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyboard}
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <span className="qizhi-tree-select__value">
          {selectedOptions[0]
            ? renderFormat?.(selectedOptions[0]) ?? selectedOptions[0].label
            : placeholder}
        </span>
      )}

      {showSearch && !multiple && selectedOptions[0] && !query ? (
        <span className="qizhi-tree-select__search-value">
          {renderFormat?.(selectedOptions[0]) ?? selectedOptions[0].label}
        </span>
      ) : null}

      {allowClear && rawValues.length > 0 ? (
        <button
          type="button"
          className="qizhi-tree-select__clear"
          aria-label="清空选择"
          onMouseDown={(event) => event.preventDefault()}
          onClick={clear}
        >
          <CloseIcon />
        </button>
      ) : null}

      <span
        className={[
          "qizhi-tree-select__suffix",
          showSearch && open
            ? "qizhi-tree-select__suffix--search"
            : "qizhi-tree-select__suffix--arrow",
        ].join(" ")}
        aria-hidden="true"
      >
        {showSearch && open
          ? <SearchIcon />
          : <ArrowDownIcon viewBox="1.6 1.6 12.8 12.8" />}
      </span>
      {popup}
    </div>
  );

  if (addBefore == null) return control;
  return (
    <div className="qizhi-tree-select__group">
      <div className="qizhi-tree-select__add-before">{addBefore}</div>
      {control}
    </div>
  );
}

export const TreeSelect = TreeSelectRoot;
