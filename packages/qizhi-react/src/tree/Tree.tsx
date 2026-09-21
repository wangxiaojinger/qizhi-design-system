import { forwardRef, useMemo, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent } from "react";
import { Checkbox } from "../checkbox/Checkbox";
import {
  ArrowDownFilledIcon,
  ArrowRightFilledIcon,
  LoadingIcon,
} from "../icon";
import {
  flattenTree,
  halfCheckedKeys,
  linkedCheckedKeys,
  normalizeTreeData,
  reorderTreeRoots,
  strategyKeys,
} from "./treeModel";
import type { NormalizedTreeNode } from "./treeModel";
import type { TreeKey, TreeNodeData, TreeProps } from "./Tree.types";
import "./tree.css";

const join = (...names: Array<string | false | undefined>) =>
  names.filter(Boolean).join(" ");
const keyText = (key: TreeKey) => String(key);

export const Tree = forwardRef<HTMLDivElement, TreeProps>(function Tree(
  {
    treeData,
    fieldNames,
    selectedKeys,
    defaultSelectedKeys = [],
    multiple = false,
    blockNode = false,
    onSelect,
    expandedKeys,
    defaultExpandedKeys = [],
    onExpand,
    checkable = false,
    checkedKeys,
    defaultCheckedKeys = [],
    checkStrictly = false,
    checkedStrategy = "all",
    onCheck,
    loadData,
    draggable = false,
    onDrop,
    size = "default",
    renderTitle,
    className,
    onKeyDown,
    ...rootProps
  },
  ref,
) {
  const [runtimeData, setRuntimeData] = useState<
    readonly TreeNodeData[] | null
  >(null);
  const data = runtimeData ?? treeData;
  const normalized = useMemo(
    () => normalizeTreeData(data, fieldNames),
    [data, fieldNames],
  );
  const [ownSelected, setOwnSelected] = useState<TreeKey[]>([
    ...defaultSelectedKeys,
  ]);
  const [ownExpanded, setOwnExpanded] = useState<TreeKey[]>([
    ...defaultExpandedKeys,
  ]);
  const [ownChecked, setOwnChecked] = useState<TreeKey[]>([
    ...defaultCheckedKeys,
  ]);
  const [loadingKeys, setLoadingKeys] = useState<TreeKey[]>([]);
  const [focusKey, setFocusKey] = useState<TreeKey | undefined>(
    () => flattenTree(normalized)[0]?.key,
  );
  const draggedKey = useRef<TreeKey | null>(null);
  const nodeRefs = useRef(new Map<TreeKey, HTMLDivElement>());
  const selected = new Set(selectedKeys ?? ownSelected);
  const expanded = new Set(expandedKeys ?? ownExpanded);
  const checked = new Set(checkedKeys ?? ownChecked);
  const half = checkStrictly
    ? new Set<TreeKey>()
    : halfCheckedKeys(normalized, checked);

  const injectChildren = (
    items: readonly TreeNodeData[],
    target: TreeKey,
    children: readonly TreeNodeData[],
  ): TreeNodeData[] => {
    const keyField = fieldNames?.key ?? "key";
    const childField = fieldNames?.children ?? "children";
    return items.map((item) => {
      if (item[keyField] === target) return { ...item, [childField]: children };
      const currentChildren = item[childField] as
        | readonly TreeNodeData[]
        | undefined;
      return currentChildren?.length
        ? {
            ...item,
            [childField]: injectChildren(currentChildren, target, children),
          }
        : { ...item };
    });
  };

  const toggleExpanded = async (node: NormalizedTreeNode, value: boolean) => {
    const next = value
      ? [...new Set([...expanded, node.key])]
      : [...expanded].filter((key) => key !== node.key);
    if (value && loadData && !node.children.length && !node.isLeaf) {
      setLoadingKeys((keys) => [...new Set([...keys, node.key])]);
      try {
        const children = await loadData(node.raw);
        if (children?.length)
          setRuntimeData((items) =>
            injectChildren(items ?? treeData, node.key, children),
          );
      } finally {
        setLoadingKeys((keys) => keys.filter((key) => key !== node.key));
      }
    }
    if (expandedKeys === undefined) setOwnExpanded(next);
    onExpand?.(next, { node: node.raw, expanded: value });
  };

  const select = (node: NormalizedTreeNode) => {
    if (node.disabled || !node.selectable) return;
    const next = multiple
      ? selected.has(node.key)
        ? [...selected].filter((key) => key !== node.key)
        : [...selected, node.key]
      : selected.has(node.key)
        ? []
        : [node.key];
    if (selectedKeys === undefined) setOwnSelected(next);
    onSelect?.(next, { node: node.raw, selected: next.includes(node.key) });
  };

  const check = (node: NormalizedTreeNode, value: boolean) => {
    if (node.disabled || node.disableCheckbox) return;
    let next = new Set(checked);
    if (checkStrictly) value ? next.add(node.key) : next.delete(node.key);
    else next = linkedCheckedKeys(normalized, next, node, value);
    const allKeys = [...next];
    if (checkedKeys === undefined) setOwnChecked(allKeys);
    onCheck?.(strategyKeys(normalized, next, checkedStrategy), {
      node: node.raw,
      checked: value,
      checkedKeys: allKeys,
      halfCheckedKeys: [...halfCheckedKeys(normalized, next)],
    });
  };

  const visibleNodes = () => {
    const result: NormalizedTreeNode[] = [];
    const visit = (nodes: readonly NormalizedTreeNode[]) =>
      nodes.forEach((node) => {
        result.push(node);
        if (expanded.has(node.key)) visit(node.children);
      });
    visit(normalized);
    return result;
  };
  const focus = (node?: NormalizedTreeNode) => {
    if (!node) return;
    setFocusKey(node.key);
    queueMicrotask(() => nodeRefs.current.get(node.key)?.focus());
  };
  const parentOf = (key: TreeKey) => {
    let result: NormalizedTreeNode | undefined;
    const visit = (nodes: readonly NormalizedTreeNode[]) =>
      nodes.forEach((node) => {
        if (node.children.some((child) => child.key === key)) result = node;
        else if (!result) visit(node.children);
      });
    visit(normalized);
    return result;
  };
  const handleKey = (
    event: KeyboardEvent<HTMLDivElement>,
    node: NormalizedTreeNode,
  ) => {
    const visible = visibleNodes();
    const index = visible.findIndex((item) => item.key === node.key);
    if (event.key === "ArrowDown") focus(visible[index + 1]);
    else if (event.key === "ArrowUp") focus(visible[index - 1]);
    else if (event.key === "Home") focus(visible[0]);
    else if (event.key === "End") focus(visible.at(-1));
    else if (event.key === "ArrowRight")
      node.children.length && !expanded.has(node.key)
        ? void toggleExpanded(node, true)
        : focus(node.children[0]);
    else if (event.key === "ArrowLeft")
      expanded.has(node.key)
        ? void toggleExpanded(node, false)
        : focus(parentOf(node.key));
    else if (event.key === "Enter") select(node);
    else if (event.key === " ")
      checkable ? check(node, !checked.has(node.key)) : select(node);
    else return;
    event.preventDefault();
    event.stopPropagation();
  };

  const drop = (event: DragEvent<HTMLDivElement>, dropKey: TreeKey) => {
    event.preventDefault();
    if (draggedKey.current == null) return;
    const next = reorderTreeRoots(normalized, draggedKey.current, dropKey);
    if (!next) return;
    const dragKey = draggedKey.current;
    setRuntimeData(next);
    onDrop?.({ dragKey, dropKey, treeData: next });
    draggedKey.current = null;
  };

  const renderNodes = (
    nodes: readonly NormalizedTreeNode[],
    level: number,
    ancestorIsTail: readonly boolean[] = [],
  ) =>
    nodes.map((node, nodeIndex) => {
      const isTail = nodeIndex === nodes.length - 1;
      const expandable =
        node.children.length > 0 || (!node.isLeaf && Boolean(loadData));
      const isExpanded = expanded.has(node.key);
      const isLoading = loadingKeys.includes(node.key);
      const label =
        typeof node.title === "string" || typeof node.title === "number"
          ? String(node.title)
          : keyText(node.key);
      return (
        <div className="qizhi-tree__node-group" key={node.key}>
          <div
            ref={(element) => {
              if (element) nodeRefs.current.set(node.key, element);
              else nodeRefs.current.delete(node.key);
            }}
            className={join(
              "qizhi-tree__node",
              expandable ? isExpanded && "is-expanded" : "is-leaf",
              selected.has(node.key) && "is-selected",
              node.disabled && "is-disabled",
              !node.selectable && "is-unselectable",
              draggable && node.draggable && "is-draggable",
            )}
            role="treeitem"
            aria-label={label}
            aria-level={level}
            aria-expanded={expandable ? isExpanded : undefined}
            aria-selected={selected.has(node.key)}
            aria-disabled={node.disabled || undefined}
            aria-busy={isLoading || undefined}
            tabIndex={focusKey === node.key ? 0 : -1}
            draggable={draggable && node.draggable && !node.disabled}
            data-tree-key={keyText(node.key)}
            onFocus={() => setFocusKey(node.key)}
            onKeyDown={(event) => handleKey(event, node)}
            onDragStart={(event) => {
              draggedKey.current = node.key;
              event.dataTransfer.setData(
                "text/qizhi-tree-key",
                keyText(node.key),
              );
            }}
            onDragOver={(event) => {
              if (draggable) event.preventDefault();
            }}
            onDrop={(event) => drop(event, node.key)}
          >
            <span className="qizhi-tree__indent" aria-hidden="true">
              {ancestorIsTail.map((ancestorTail, index) => (
                <span
                  className={join(
                    "qizhi-tree__indent-block",
                    ancestorTail && "qizhi-tree__indent-block--lineless",
                  )}
                  key={index}
                />
              ))}
            </span>
            {expandable ? (
              <button
                type="button"
                className="qizhi-tree__switcher"
                aria-label={`${isExpanded ? "收起" : "展开"}${label}`}
                disabled={node.disabled || isLoading}
                onClick={(event) => {
                  event.stopPropagation();
                  void toggleExpanded(node, !isExpanded);
                }}
              >
                {isLoading ? (
                  <LoadingIcon />
                ) : isExpanded ? (
                  <ArrowDownFilledIcon
                    className="qizhi-tree__switcher-icon qizhi-tree__switcher-icon--expanded"
                  />
                ) : (
                  <ArrowRightFilledIcon
                    className="qizhi-tree__switcher-icon qizhi-tree__switcher-icon--collapsed"
                  />
                )}
              </button>
            ) : (
              <span className="qizhi-tree__switcher" aria-hidden="true" />
            )}
            {checkable ? (
              <Checkbox
                className="qizhi-tree__checkbox"
                checked={checked.has(node.key)}
                indeterminate={half.has(node.key)}
                disabled={node.disabled || node.disableCheckbox}
                aria-label={`勾选${label}`}
                onChange={(value) => check(node, value)}
                onClick={(event) => event.stopPropagation()}
              />
            ) : null}
            <button
              type="button"
              className="qizhi-tree__title"
              aria-label={`选择${label}`}
              disabled={node.disabled || !node.selectable}
              tabIndex={-1}
              onClick={(event) => {
                event.stopPropagation();
                select(node);
              }}
            >
              {node.icon ? (
                <span className="qizhi-tree__icon">{node.icon}</span>
              ) : null}
              <span className="qizhi-tree__title-text">
                {renderTitle ? renderTitle(node.raw) : node.title}
              </span>
            </button>
          </div>
          {isExpanded && node.children.length ? (
            <div className="qizhi-tree__children" role="group">
              {renderNodes(node.children, level + 1, [
                ...ancestorIsTail,
                isTail,
              ])}
            </div>
          ) : null}
        </div>
      );
    });

  return (
    <div
      {...rootProps}
      ref={ref}
      className={join(
        "qizhi-tree",
        `qizhi-tree-size-${size}`,
        checkable && "qizhi-tree-checkable",
        draggable && "qizhi-tree-draggable",
        blockNode && "qizhi-tree-block-node",
        className,
      )}
      role="tree"
      aria-multiselectable={multiple || undefined}
      onKeyDown={onKeyDown}
    >
      {renderNodes(normalized, 1)}
    </div>
  );
});
