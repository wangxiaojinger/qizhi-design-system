import { Checkbox } from "../checkbox/Checkbox";
import { Dropdown } from "../dropdown/Dropdown";
import { LoadingIcon } from "../icon";
import type {
  TreeSelectOption,
  TreeSelectRawValue,
} from "./TreeSelect.types";

interface TreeSelectPopupProps {
  options: readonly TreeSelectOption[];
  multiple: boolean;
  selectedValues: ReadonlySet<TreeSelectRawValue>;
  expandedValues: ReadonlySet<TreeSelectRawValue>;
  loadingValues: ReadonlySet<TreeSelectRawValue>;
  onToggle: (option: TreeSelectOption) => void;
  onSelect: (option: TreeSelectOption) => void;
  forceExpanded?: boolean;
}

function optionText(option: TreeSelectOption): string {
  return typeof option.label === "string" || typeof option.label === "number"
    ? String(option.label)
    : String(option.value);
}

export function TreeSelectPopup({
  options,
  multiple,
  selectedValues,
  expandedValues,
  loadingValues,
  onToggle,
  onSelect,
  forceExpanded = false,
}: TreeSelectPopupProps) {
  const renderOptions = (
    nodes: readonly TreeSelectOption[],
    level: number,
  ) => nodes.map((option) => {
    const label = optionText(option);
    const hasChildren = Boolean(option.children?.length);
    const expandable = hasChildren || option.isLeaf === false;
    const expanded = forceExpanded || expandedValues.has(option.value);
    const loading = loadingValues.has(option.value);
    const selected = selectedValues.has(option.value);

    return (
      <div className="qizhi-tree-select__node-group" key={option.value}>
        <div
          className={[
            "qizhi-tree-node",
            expandable
              ? expanded && "qizhi-tree-node-expanded"
              : "qizhi-tree-node-is-leaf",
            option.disabled && "qizhi-tree-node-disabled",
          ].filter(Boolean).join(" ")}
          role="treeitem"
          aria-label={label}
          aria-level={level}
          aria-selected={selected}
          aria-expanded={expandable ? expanded : undefined}
          aria-disabled={option.disabled || undefined}
          onClick={() => onSelect(option)}
        >
          <span className="qizhi-tree-node-indent" aria-hidden="true">
            {Array.from({ length: level - 1 }, (_, index) => (
              <span
                className={[
                  "qizhi-tree-node-indent-block",
                  index === 0 && "qizhi-tree-node-indent-block-lineless",
                ].filter(Boolean).join(" ")}
                key={index}
              />
            ))}
          </span>

          {expandable ? (
            <button
              type="button"
              className={[
                "qizhi-tree-node-switcher",
                expanded && "qizhi-tree-node-switcher-expanded",
                loading && "is-loading",
              ].filter(Boolean).join(" ")}
              aria-label={`${expanded ? "收起" : "展开"}${label}`}
              disabled={option.disabled || loading}
              onClick={(event) => {
                event.stopPropagation();
                onToggle(option);
              }}
            >
              {loading ? <LoadingIcon /> : null}
              {loading ? (
                <span className="qizhi-tree-select__loading-text">
                  正在加载
                </span>
              ) : null}
            </button>
          ) : (
            <span className="qizhi-tree-node-switcher" aria-hidden="true" />
          )}

          {multiple ? (
            <span
              className="qizhi-tree-select__checkbox"
              onClick={(event) => event.stopPropagation()}
            >
              <Checkbox
                checked={selected}
                disabled={option.disabled}
                aria-label={`选择 ${label}`}
                onChange={() => onSelect(option)}
              />
            </span>
          ) : null}

          <button
            type="button"
            className="qizhi-tree-node-title"
            aria-label={`选择${label}`}
            disabled={option.disabled}
            tabIndex={-1}
          >
            <span className="qizhi-tree-node-title-text">
              {option.label}
            </span>
          </button>
        </div>

        {expanded && option.children?.length ? (
          <div className="qizhi-tree-select__children" role="group">
            {renderOptions(option.children, level + 1)}
          </div>
        ) : null}
      </div>
    );
  });

  if (!options.length) {
    return <div className="qizhi-tree-select__empty">暂无数据</div>;
  }

  return (
    <Dropdown.Menu
      className={[
        "qizhi-tree",
        "qizhi-tree-select__tree",
        "qizhi-tree-size-default",
        multiple && "qizhi-tree-checkable",
      ].filter(Boolean).join(" ")}
      role="tree"
      aria-multiselectable={multiple || undefined}
    >
      {renderOptions(options, 1)}
    </Dropdown.Menu>
  );
}
