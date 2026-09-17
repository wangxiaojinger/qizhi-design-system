import type { ReactNode } from "react";
import type {
  TreeCheckedStrategy,
  TreeFieldNames,
  TreeKey,
  TreeNodeData,
} from "./Tree.types";

export interface NormalizedTreeNode {
  key: TreeKey;
  title: ReactNode;
  children: NormalizedTreeNode[];
  disabled: boolean;
  selectable: boolean;
  disableCheckbox: boolean;
  isLeaf: boolean;
  icon?: ReactNode;
  draggable: boolean;
  raw: TreeNodeData;
}

const defaultFields: Required<TreeFieldNames> = {
  key: "key",
  title: "title",
  children: "children",
  disabled: "disabled",
  selectable: "selectable",
  disableCheckbox: "disableCheckbox",
  isLeaf: "isLeaf",
  icon: "icon",
};

export function normalizeTreeData(
  data: readonly TreeNodeData[],
  fieldNames: TreeFieldNames = {},
): NormalizedTreeNode[] {
  const fields = { ...defaultFields, ...fieldNames };
  return data.map((raw) => {
    const key = raw[fields.key] as TreeKey | undefined;
    if (key == null)
      throw new Error("[QIZHI Tree] 每个节点都必须具有唯一 key。");
    const children = raw[fields.children] as
      | readonly TreeNodeData[]
      | undefined;
    return {
      key,
      title: raw[fields.title] as ReactNode,
      children: normalizeTreeData(children ?? [], fields),
      disabled: Boolean(raw[fields.disabled]),
      selectable: raw[fields.selectable] !== false,
      disableCheckbox: Boolean(raw[fields.disableCheckbox]),
      isLeaf: Boolean(raw[fields.isLeaf]) || children?.length === 0,
      icon: raw[fields.icon] as ReactNode,
      draggable: raw.draggable !== false,
      raw,
    };
  });
}

export const flattenTree = (
  nodes: readonly NormalizedTreeNode[],
): NormalizedTreeNode[] =>
  nodes.flatMap((node) => [node, ...flattenTree(node.children)]);

export const descendantKeys = (node: NormalizedTreeNode): TreeKey[] => [
  node.key,
  ...node.children.flatMap(descendantKeys),
];

export function linkedCheckedKeys(
  nodes: readonly NormalizedTreeNode[],
  current: ReadonlySet<TreeKey>,
  node: NormalizedTreeNode,
  checked: boolean,
): Set<TreeKey> {
  const next = new Set(current);
  descendantKeys(node).forEach((key) =>
    checked ? next.add(key) : next.delete(key),
  );
  const visit = (candidate: NormalizedTreeNode): boolean => {
    const childChecks = candidate.children.map(visit);
    if (candidate.children.length) {
      if (childChecks.every(Boolean)) next.add(candidate.key);
      else next.delete(candidate.key);
    }
    return next.has(candidate.key);
  };
  nodes.forEach(visit);
  return next;
}

export function halfCheckedKeys(
  nodes: readonly NormalizedTreeNode[],
  checked: ReadonlySet<TreeKey>,
): Set<TreeKey> {
  const half = new Set<TreeKey>();
  const visit = (node: NormalizedTreeNode): { any: boolean; all: boolean } => {
    if (!node.children.length) {
      const value = checked.has(node.key);
      return { any: value, all: value };
    }
    const children = node.children.map(visit);
    const any = checked.has(node.key) || children.some((item) => item.any);
    const all = checked.has(node.key) || children.every((item) => item.all);
    if (any && !all) half.add(node.key);
    return { any, all };
  };
  nodes.forEach(visit);
  return half;
}

export function strategyKeys(
  nodes: readonly NormalizedTreeNode[],
  checked: ReadonlySet<TreeKey>,
  strategy: TreeCheckedStrategy,
): TreeKey[] {
  const all = flattenTree(nodes).filter((node) => checked.has(node.key));
  if (strategy === "child")
    return all.filter((node) => !node.children.length).map((node) => node.key);
  if (strategy === "parent") {
    const result: TreeKey[] = [];
    const visit = (node: NormalizedTreeNode, ancestorChecked: boolean) => {
      const selected = checked.has(node.key);
      if (selected && !ancestorChecked) result.push(node.key);
      node.children.forEach((child) =>
        visit(child, ancestorChecked || selected),
      );
    };
    nodes.forEach((node) => visit(node, false));
    return result;
  }
  return all.map((node) => node.key);
}

const cloneRaw = (node: NormalizedTreeNode): TreeNodeData => ({
  ...node.raw,
  key: node.key,
  title: node.title,
  children: node.children.map(cloneRaw),
});

export function reorderTreeRoots(
  nodes: readonly NormalizedTreeNode[],
  dragKey: TreeKey,
  dropKey: TreeKey,
): TreeNodeData[] | null {
  const from = nodes.findIndex((node) => node.key === dragKey);
  const to = nodes.findIndex((node) => node.key === dropKey);
  if (from < 0 || to < 0 || from === to) return null;
  const next = nodes.map(cloneRaw);
  const [active] = next.splice(from, 1);
  next.splice(to, 0, active);
  return next;
}
