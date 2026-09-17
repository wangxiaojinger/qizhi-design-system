import type { CSSProperties, ReactNode } from "react";

export type TreeSelectRawValue = string | number;
export type TreeSelectSize = "default" | "large" | "huge";
export type TreeSelectStatus = "default" | "error" | "warning";

export interface TreeSelectOption {
  label: ReactNode;
  value: TreeSelectRawValue;
  children?: readonly TreeSelectOption[];
  disabled?: boolean;
  isLeaf?: boolean;
}

export interface TreeSelectLabelValue {
  label: ReactNode;
  value: TreeSelectRawValue;
}

export type TreeSelectValue = TreeSelectRawValue | TreeSelectLabelValue;

interface TreeSelectCommonProps {
  treeData: readonly TreeSelectOption[];
  placeholder?: string;
  size?: TreeSelectSize;
  status?: TreeSelectStatus;
  disabled?: boolean;
  allowClear?: boolean;
  addBefore?: ReactNode;
  labelInValue?: boolean;
  renderFormat?: (option: TreeSelectOption) => ReactNode;
  showSearch?: boolean;
  filterTreeNode?: false | (
    (input: string, option: TreeSelectOption) => boolean
  );
  onSearch?: (input: string) => void;
  loadMore?: (
    option: TreeSelectOption,
  ) => Promise<readonly TreeSelectOption[] | void>;
  defaultExpandedKeys?: readonly TreeSelectRawValue[];
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

export interface TreeSelectSingleProps extends TreeSelectCommonProps {
  multiple?: false;
  value?: TreeSelectValue;
  defaultValue?: TreeSelectValue;
  onChange?: (
    value: TreeSelectValue | undefined,
    option: TreeSelectOption | undefined,
  ) => void;
}

export interface TreeSelectMultipleProps extends TreeSelectCommonProps {
  multiple: true;
  value?: readonly TreeSelectValue[];
  defaultValue?: readonly TreeSelectValue[];
  onChange?: (
    value: readonly TreeSelectValue[],
    options: readonly TreeSelectOption[],
  ) => void;
}

export type TreeSelectProps =
  | TreeSelectSingleProps
  | TreeSelectMultipleProps;
