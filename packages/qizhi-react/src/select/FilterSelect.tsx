import { Fragment, useEffect, useLayoutEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Select } from "./Select";
import type { SelectOption, SelectRawValue } from "./Select.types";
import type { FilterSelectMultipleProps, FilterSelectOption, FilterSelectProps, FilterSelectSingleProps } from "./FilterSelect.types";

const same = (left: SelectRawValue, right: SelectRawValue) => Object.is(left, right);
const keyOf = (value: SelectRawValue) => `${typeof value}:${String(value)}`;
const join = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ");
const textOf = (value: ReactNode) => typeof value === "string" || typeof value === "number" ? String(value) : "";

export function FilterSelect(props: FilterSelectProps) {
  const {
    label,
    options,
    searchable = false,
    searchValue,
    loading = false,
    disabled = false,
    allowClear = false,
    placeholder = "请搜索",
    notFoundContent = "暂无数据",
    filterOption = true,
    onSearch,
    renderOption,
    className,
    style,
  } = props;
  const ariaLabel = props["aria-label"];
  const retainDisplayValueWhenOpen = props.retainDisplayValueWhenOpen ?? true;
  const multiple = props.mode === "multiple";
  const singleProps = props as FilterSelectSingleProps;
  const multipleProps = props as FilterSelectMultipleProps;
  const singleControlled = !multiple && Object.hasOwn(singleProps, "value");
  const multipleControlled = multiple && Object.hasOwn(multipleProps, "value");
  const [innerSingle, setInnerSingle] = useState<FilterSelectSingleProps["defaultValue"]>(singleProps.defaultValue);
  const [innerMultiple, setInnerMultiple] = useState<SelectRawValue[]>(multiple ? multipleProps.defaultValue ?? [] : []);
  const singleValue = multiple ? undefined : singleControlled ? singleProps.value : innerSingle;
  const multipleValue = multiple ? multipleControlled ? multipleProps.value ?? [] : innerMultiple : innerMultiple;
  const duplicateAll = !multiple && !!singleProps.allOption && options.some((option) => same(option.value, singleProps.allOption!.value));
  const mergedOptions = useMemo(() => {
    if (multiple || !singleProps.allOption) return options;
    return [singleProps.allOption, ...options.filter((option) => !same(option.value, singleProps.allOption!.value))];
  }, [multiple, options, singleProps.allOption]);
  const labelCache = useRef(new Map<string, ReactNode>());
  mergedOptions.forEach((option) => labelCache.current.set(keyOf(option.value), option.label));

  useEffect(() => {
    if (duplicateAll && import.meta.env.DEV) {
      console.warn("[QIZHI FilterSelect] allOption.value 不得与 options 中的 value 重复；已保留 allOption。");
    }
  }, [duplicateAll]);

  useEffect(() => {
    if (!ariaLabel && !textOf(label) && import.meta.env.DEV) {
      console.warn("[QIZHI FilterSelect] 非文本 label 无法生成可访问名称，请提供 aria-label。");
    }
  }, [ariaLabel, label]);

  const resolveLabel = (value: SelectRawValue) => mergedOptions.find((option) => same(option.value, value))?.label
    ?? labelCache.current.get(keyOf(value))
    ?? String(value);
  const summary = singleValue === undefined ? singleProps.emptyText ?? "全部" : resolveLabel(singleValue);
  const accessibleName = ariaLabel ?? (textOf(label) || placeholder);
  const mappedFilterOption = filterOption === false ? () => true : filterOption === true ? undefined : filterOption;
  const requestedDisplayCount = multipleProps.maxDisplayCount ?? 2;
  const summaryRef = useRef<HTMLSpanElement>(null);
  const [fittedCount, setFittedCount] = useState(requestedDisplayCount);
  const maxDisplayCount = Number.isFinite(requestedDisplayCount) ? Math.max(0, Math.floor(requestedDisplayCount)) : 2;
  const shownValues = multipleValue.slice(0, Math.max(0, Math.min(maxDisplayCount, fittedCount)));
  const hiddenCount = Math.max(0, multipleValue.length - shownValues.length);
  const separator = multipleProps.separator ?? "、";
  const summaryId = `qizhi-filter-select-summary-${useId().replace(/:/g, "")}`;
  useLayoutEffect(() => {
    const node = summaryRef.current;
    if (!multiple || !node) return;
    const measure = () => {
      if (!node.clientWidth) return;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;
      context.font = getComputedStyle(node).font;
      let count = Math.min(maxDisplayCount, multipleValue.length);
      while (count > 1) {
        const text = `${textOf(label)}：${multipleValue.slice(0, count).map((value) => textOf(resolveLabel(value))).join(textOf(separator))}`;
        const more = count < multipleValue.length ? ` +${multipleValue.length - count}` : "";
        if (context.measureText(text + more).width <= node.clientWidth) break;
        count -= 1;
      }
      setFittedCount(count);
    };
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : undefined;
    observer?.observe(node);
    return () => observer?.disconnect();
  }, [multiple, multipleValue.join("\u0000"), maxDisplayCount, label, separator, options]);
  const multipleSummary = multipleValue.length
    ? <><span>{label}：{shownValues.map((value, index) => <Fragment key={keyOf(value)}>{index ? separator : null}{resolveLabel(value)}</Fragment>)}</span>{hiddenCount > 0 ? <> <span className="qizhi-filter-select__more">{multipleProps.renderMore ? multipleProps.renderMore(hiddenCount) : `+${hiddenCount}`}</span></> : null}</>
    : <span>{label}：{multipleProps.emptyText ?? "全部标签"}</span>;
  const singleSummary = <span>{label}：{summary}</span>;
  const renderDisplay = ({ open, searching }: { open: boolean; searching: boolean }) => {
    if (!retainDisplayValueWhenOpen && open && searching) return null;
    return <span ref={summaryRef} id={summaryId} className="qizhi-filter-select__summary">{multiple ? multipleSummary : singleSummary}</span>;
  };

  if (multiple) {
    return <Select
      mode="multiple"
      options={mergedOptions}
      value={multipleValue}
      showSearch={searchable ? { placement: "popup", placeholder } : false}
      searchValue={searchValue}
      filterOption={mappedFilterOption}
      onSearch={onSearch}
      loading={loading}
      disabled={disabled}
      allowClear={allowClear}
      placeholder={placeholder}
      notFoundContent={notFoundContent}
      renderOption={renderOption}
      valueRender={renderDisplay}
      onChange={(values, selectedOptions) => {
        if (!multipleControlled) setInnerMultiple(values);
        multipleProps.onChange?.(values, selectedOptions);
      }}
      className={join("qizhi-filter-select", className)}
      style={style}
      aria-label={accessibleName}
      aria-describedby={summaryId}
    />;
  }

  return <Select
    options={mergedOptions}
    value={singleValue}
    showSearch={searchable ? { placement: "popup", placeholder } : false}
    searchValue={searchValue}
    filterOption={mappedFilterOption}
    onSearch={onSearch}
    loading={loading}
    disabled={disabled}
    allowClear={false}
    placeholder={placeholder}
    notFoundContent={notFoundContent}
    renderOption={renderOption}
    valueRender={renderDisplay}
    onChange={(value, option) => {
      if (!singleControlled) setInnerSingle(value);
      singleProps.onChange?.(value, option as FilterSelectOption | undefined);
    }}
    className={join("qizhi-filter-select", className)}
    style={style}
    aria-label={accessibleName}
    aria-describedby={summaryId}
  />;
}
