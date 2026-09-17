import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";

export type TreeKey = string | number;
export type TreeSize = "mini" | "small" | "default" | "large";
export type TreeCheckedStrategy = "all" | "parent" | "child";

export interface TreeNodeData {
  key?: TreeKey;
  title?: ReactNode;
  children?: readonly TreeNodeData[];
  disabled?: boolean;
  selectable?: boolean;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  icon?: ReactNode;
  draggable?: boolean;
  [field: string]: unknown;
}

export interface TreeFieldNames {
  key?: string;
  title?: string;
  children?: string;
  disabled?: string;
  selectable?: string;
  disableCheckbox?: string;
  isLeaf?: string;
  icon?: string;
}

export interface TreeSelectInfo {
  node: TreeNodeData;
  selected: boolean;
}
export interface TreeExpandInfo {
  node: TreeNodeData;
  expanded: boolean;
}
export interface TreeCheckInfo {
  node: TreeNodeData;
  checked: boolean;
  checkedKeys: TreeKey[];
  halfCheckedKeys: TreeKey[];
}
export interface TreeDropInfo {
  dragKey: TreeKey;
  dropKey: TreeKey;
  treeData: TreeNodeData[];
}

export interface TreeProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "children" | "defaultValue" | "onDrop" | "onSelect"
  > {
  treeData: readonly TreeNodeData[];
  fieldNames?: TreeFieldNames;
  selectedKeys?: readonly TreeKey[];
  defaultSelectedKeys?: readonly TreeKey[];
  multiple?: boolean;
  blockNode?: boolean;
  onSelect?: (keys: TreeKey[], info: TreeSelectInfo) => void;
  expandedKeys?: readonly TreeKey[];
  defaultExpandedKeys?: readonly TreeKey[];
  onExpand?: (keys: TreeKey[], info: TreeExpandInfo) => void;
  checkable?: boolean;
  checkedKeys?: readonly TreeKey[];
  defaultCheckedKeys?: readonly TreeKey[];
  checkStrictly?: boolean;
  checkedStrategy?: TreeCheckedStrategy;
  onCheck?: (keys: TreeKey[], info: TreeCheckInfo) => void;
  loadData?: (node: TreeNodeData) => Promise<readonly TreeNodeData[] | void>;
  draggable?: boolean;
  onDrop?: (info: TreeDropInfo) => void;
  size?: TreeSize;
  renderTitle?: (node: TreeNodeData) => ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
}
