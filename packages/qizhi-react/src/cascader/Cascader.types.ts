import type {
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
  RefCallback,
} from "react";

export type CascaderRawValue = string | number;
export type CascaderPathValue = CascaderRawValue[];
export type CascaderStatus = "default" | "error" | "warning";
export type CascaderSize = "mini" | "small" | "default" | "large";
export type CascaderExpandTrigger = "click" | "hover";
export type CascaderCheckedStrategy = "all" | "parent";
export type CascaderHandle = HTMLInputElement | HTMLElement;

export interface CascaderOption {
  label?: ReactNode;
  value?: CascaderRawValue;
  children?: CascaderOption[];
  disabled?: boolean;
  isLeaf?: boolean;
  [field: string]: unknown;
}

export interface CascaderFieldNames {
  label?: string;
  value?: string;
  children?: string;
  disabled?: string;
  isLeaf?: string;
}

export interface CascaderTriggerProps {
  ref: RefCallback<HTMLButtonElement>;
  role: "combobox";
  tabIndex: number;
  "aria-haspopup": "listbox";
  "aria-expanded": boolean;
  "aria-controls": string;
  "aria-label": string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onKeyDown: KeyboardEventHandler<HTMLButtonElement>;
}

interface CascaderCommonProps {
  options: CascaderOption[];
  fieldNames?: CascaderFieldNames;
  placeholder?: string;
  size?: CascaderSize;
  status?: CascaderStatus;
  expandTrigger?: CascaderExpandTrigger;
  allowClear?: boolean;
  addBefore?: ReactNode;
  showSearch?: boolean;
  filterOption?: (input: string, optionPath: CascaderOption[]) => boolean;
  changeOnSelect?: boolean;
  loadMore?: (option: CascaderOption, optionPath: CascaderOption[]) => Promise<void>;
  renderFormat?: (labels: ReactNode[], selectedOptions: CascaderOption[]) => ReactNode;
  trigger?: (props: CascaderTriggerProps) => ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  id?: string;
  name?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface CascaderSingleProps extends CascaderCommonProps {
  mode?: "single";
  value?: CascaderPathValue;
  defaultValue?: CascaderPathValue;
  onChange?: (value: CascaderPathValue | undefined, selectedOptions: CascaderOption[]) => void;
  checkedStrategy?: never;
  dragToSort?: never;
}

export interface CascaderMultipleProps extends CascaderCommonProps {
  mode: "multiple";
  value?: CascaderPathValue[];
  defaultValue?: CascaderPathValue[];
  onChange?: (value: CascaderPathValue[], selectedOptions: CascaderOption[][]) => void;
  checkedStrategy?: CascaderCheckedStrategy;
  dragToSort?: boolean;
}

export type CascaderProps = CascaderSingleProps | CascaderMultipleProps;
