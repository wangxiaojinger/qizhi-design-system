import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
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
  const [innerSingle, setInnerSingle] = useState<FilterSelectSingleProps["defaultValue"]>(singleProps.defaultValue);
  const [innerMultiple, setInnerMultiple] = useState<SelectRawValue[]>(multiple ? multipleProps.defaultValue ?? [] : []);
  const singleValue = multiple ? undefined : singleProps.value === undefined ? innerSingle : singleProps.value;
  const multipleValue = multiple ? multipleProps.value === undefined ? innerMultiple : multipleProps.value : innerMultiple;
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
  const maxDisplayCount = Number.isFinite(requestedDisplayCount) ? Math.max(0, Math.floor(requestedDisplayCount)) : 2;
  const shownValues = multipleValue.slice(0, maxDisplayCount);
  const hiddenCount = Math.max(0, multipleValue.length - shownValues.length);
  const separator = multipleProps.separator ?? "、";
  const summaryId = `qizhi-filter-select-summary-${useId().replace(/:/g, "")}`;
  const multipleSummary = multipleValue.length
    ? <><span>{label}：{shownValues.map((value, index) => <Fragment key={keyOf(value)}>{index ? separator : null}{resolveLabel(value)}</Fragment>)}</span>{hiddenCount > 0 ? <> <span className="qizhi-filter-select__more">{multipleProps.renderMore ? multipleProps.renderMore(hiddenCount) : `+${hiddenCount}个更多`}</span></> : null}</>
    : <span>{label}：{multipleProps.emptyText ?? "全部标签"}</span>;
  const singleSummary = <span>{label}：{summary}</span>;
  const renderDisplay = ({ open, searching }: { open: boolean; searching: boolean }) => {
    if (!retainDisplayValueWhenOpen && open && searching) return null;
    return <span id={summaryId} className="qizhi-filter-select__summary">{multiple ? multipleSummary : singleSummary}</span>;
  };

  if (multiple) {
    return <Select
      mode="multiple"
      options={mergedOptions}
      value={multipleValue}
      showSearch={searchable}
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
        if (multipleProps.value === undefined) setInnerMultiple(values);
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
    showSearch={searchable}
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
    onChange={(value, option) => {
      if (singleProps.value === undefined) setInnerSingle(value);
      singleProps.onChange?.(value, option as FilterSelectOption | undefined);
    }}
    className={join("qizhi-filter-select", className)}
    style={style}
    aria-label={accessibleName}
    aria-describedby={summaryId}
  />;
}
