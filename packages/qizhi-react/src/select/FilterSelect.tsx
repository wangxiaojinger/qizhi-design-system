import { Fragment, useEffect, useMemo, useRef, useState } from "react";
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
  const multiple = props.mode === "multiple";
  const singleProps = props as FilterSelectSingleProps;
  const multipleProps = props as FilterSelectMultipleProps;
  const [innerSingle, setInnerSingle] = useState<FilterSelectSingleProps["defaultValue"]>(singleProps.defaultValue);
  const [innerMultiple, setInnerMultiple] = useState<SelectRawValue[]>(multipleProps.defaultValue ?? []);
  const singleValue = singleProps.value === undefined ? innerSingle : singleProps.value;
  const multipleValue = multipleProps.value === undefined ? innerMultiple : multipleProps.value;
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

  const resolveLabel = (value: SelectRawValue) => mergedOptions.find((option) => same(option.value, value))?.label
    ?? labelCache.current.get(keyOf(value))
    ?? String(value);
  const summary = multiple
    ? multipleValue.map(resolveLabel)
    : singleValue === undefined ? singleProps.emptyText ?? "全部" : resolveLabel(singleValue);
  const accessibleName = props["aria-label"] ?? (textOf(label) || placeholder);
  const mappedFilterOption = filterOption === false ? () => true : filterOption === true ? undefined : filterOption;

  const display = multiple
    ? <>{label}：{multipleValue.length ? multipleValue.map((value, index) => <Fragment key={keyOf(value)}>{index ? "、" : null}{resolveLabel(value)}</Fragment>) : multipleProps.emptyText ?? "全部标签"}</>
    : <>{label}：{summary}</>;

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
      valueRender={() => <span className="qizhi-filter-select__summary">{display}</span>}
      onChange={(values, selectedOptions) => {
        if (multipleProps.value === undefined) setInnerMultiple(values);
        multipleProps.onChange?.(values, selectedOptions);
      }}
      className={join("qizhi-filter-select", className)}
      style={style}
      aria-label={accessibleName}
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
    valueRender={() => <span className="qizhi-filter-select__summary">{display}</span>}
    onChange={(value, option) => {
      if (singleProps.value === undefined) setInnerSingle(value);
      singleProps.onChange?.(value, option as FilterSelectOption | undefined);
    }}
    className={join("qizhi-filter-select", className)}
    style={style}
    aria-label={accessibleName}
  />;
}
