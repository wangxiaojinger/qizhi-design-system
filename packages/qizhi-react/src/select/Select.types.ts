import type { CSSProperties, FocusEventHandler, KeyboardEventHandler, MouseEventHandler, PointerEventHandler, ReactNode, RefCallback, UIEvent } from "react";

export type SelectRawValue = string | number;
export type SelectSize = "mini" | "small" | "default" | "large";
export type SelectStatus = "default" | "error" | "warning";

export interface SelectOption {
  label: ReactNode;
  value: SelectRawValue;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: ReactNode;
  options: SelectOption[];
}

export interface SelectSearchConfig { retainInputValue?: boolean }
export interface SelectCreateConfig { formatter?: (input: string) => ReactNode }
export interface SelectAutoWidth { minWidth?: number; maxWidth?: number }

export interface SelectTriggerProps {
  ref: RefCallback<HTMLElement>;
  role: "combobox";
  tabIndex: number;
  "aria-haspopup": "listbox";
  "aria-expanded": boolean;
  "aria-controls": string;
  "aria-activedescendant": string | undefined;
  "aria-label": string;
  valueText: string;
  onClick: MouseEventHandler<HTMLElement>;
  onKeyDown: KeyboardEventHandler<HTMLElement>;
  onPointerDown: PointerEventHandler<HTMLElement>;
  onBlur: FocusEventHandler<HTMLElement>;
}

interface SelectCommonProps {
  options: Array<SelectOption | SelectOptionGroup>;
  placeholder?: string;
  size?: SelectSize;
  status?: SelectStatus;
  disabled?: boolean;
  allowClear?: boolean;
  addBefore?: ReactNode;
  showSearch?: boolean | SelectSearchConfig;
  searchValue?: string;
  filterOption?: (input: string, option: SelectOption) => boolean;
  onSearch?: (input: string) => void;
  onSelect?: (value: SelectRawValue, option: SelectOption) => void;
  onClear?: () => void;
  onFocus?: FocusEventHandler<HTMLElement>;
  loading?: boolean;
  notFoundContent?: ReactNode;
  allowCreate?: boolean | SelectCreateConfig;
  tokenSeparators?: string[];
  maxTagCount?: number | "responsive";
  virtual?: boolean;
  listHeight?: number;
  renderTag?: (option: SelectOption, removable: boolean) => ReactNode;
  renderMore?: (count: number) => ReactNode;
  hideSelected?: boolean;
  dragToSort?: boolean;
  autoWidth?: boolean | SelectAutoWidth;
  popupWidth?: "trigger" | "content" | number;
  renderOption?: (option: SelectOption) => ReactNode;
  renderOptionDescription?: (option: SelectOption) => ReactNode;
  dropdownRender?: (menu: ReactNode) => ReactNode;
  trigger?: (props: SelectTriggerProps) => ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onPopupScroll?: (event: UIEvent<HTMLDivElement>) => void;
  onBlur?: FocusEventHandler<HTMLElement>;
  className?: string;
  style?: CSSProperties;
  id?: string;
  name?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
}

export interface SelectSingleProps extends SelectCommonProps {
  mode?: "single";
  value?: SelectRawValue;
  defaultValue?: SelectRawValue;
  onChange?: (value: SelectRawValue | undefined, option: SelectOption | undefined) => void;
}

export interface SelectMultipleProps extends SelectCommonProps {
  mode: "multiple";
  maxCount?: number;
  onDeselect?: (value: SelectRawValue, option: SelectOption) => void;
  value?: SelectRawValue[];
  defaultValue?: SelectRawValue[];
  onChange?: (value: SelectRawValue[], options: SelectOption[]) => void;
}

export type SelectProps = SelectSingleProps | SelectMultipleProps;
export type SelectHandle = HTMLInputElement | HTMLElement;
