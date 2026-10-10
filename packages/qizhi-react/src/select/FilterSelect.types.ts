import type { CSSProperties, ReactNode } from "react";
import type { SelectOption, SelectProps, SelectRawValue } from "./Select.types";

export type FilterSelectValue = SelectRawValue;
export type FilterSelectOption = SelectOption;
export type FilterSelectFilterOption = boolean | NonNullable<SelectProps["filterOption"]>;

interface FilterSelectCommonProps {
  label: ReactNode;
  options: FilterSelectOption[];
  emptyText?: ReactNode;
  searchable?: boolean;
  searchValue?: string;
  retainDisplayValueWhenOpen?: boolean;
  loading?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  placeholder?: string;
  notFoundContent?: ReactNode;
  filterOption?: FilterSelectFilterOption;
  onSearch?: (keyword: string) => void;
  renderOption?: (option: FilterSelectOption) => ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

export interface FilterSelectSingleProps extends FilterSelectCommonProps {
  mode?: "single";
  value?: FilterSelectValue;
  defaultValue?: FilterSelectValue;
  allOption?: FilterSelectOption;
  onChange?: (value: FilterSelectValue | undefined, option: FilterSelectOption | undefined) => void;
}

export interface FilterSelectMultipleProps extends FilterSelectCommonProps {
  mode: "multiple";
  value?: FilterSelectValue[];
  defaultValue?: FilterSelectValue[];
  maxDisplayCount?: number;
  separator?: ReactNode;
  renderMore?: (count: number) => ReactNode;
  onChange?: (values: FilterSelectValue[], options: FilterSelectOption[]) => void;
}

export type FilterSelectProps = FilterSelectSingleProps | FilterSelectMultipleProps;
