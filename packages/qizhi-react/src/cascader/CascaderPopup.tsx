import { forwardRef } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, PointerEventHandler } from "react";
import { Dropdown } from "../dropdown/Dropdown";
import { ChevronRightIcon } from "../icon";
import type { CascaderFlatPath, NormalizedCascaderOption } from "./cascaderModel";

interface MenuProps {
  options: NormalizedCascaderOption[];
  multiple: boolean;
  busyIds: Set<string>;
  selectedKeys: Set<string>;
  onOptionClick: (option: NormalizedCascaderOption) => void;
  onOptionEnter: (option: NormalizedCascaderOption) => void;
}

function Menu({ options, multiple, busyIds, selectedKeys, onOptionClick, onOptionEnter }: MenuProps) {
  return (
    <Dropdown.Menu className="qizhi-cascader-popup__menu" role="listbox" aria-multiselectable={multiple || undefined}>
      {options.map((option) => (
        <Dropdown.Item
          key={option.id}
          id={option.id}
          itemKey={option.id}
          className="qizhi-cascader-popup__option"
          role="option"
          aria-selected={selectedKeys.has(JSON.stringify(option.path))}
          aria-disabled={option.disabled || undefined}
          aria-busy={busyIds.has(option.id) || undefined}
          disabled={option.disabled}
          onClick={() => onOptionClick(option)}
          onMouseEnter={() => onOptionEnter(option)}
        >
          <span>{option.label}</span>
          {!option.isLeaf ? <ChevronRightIcon className="qizhi-cascader-popup__next-icon" /> : null}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  );
}

export interface CascaderPopupProps {
  id: string;
  style: CSSProperties;
  menus: NormalizedCascaderOption[][];
  searchResults?: CascaderFlatPath[];
  multiple: boolean;
  busyIds: Set<string>;
  selectedKeys: Set<string>;
  onOptionClick: (option: NormalizedCascaderOption) => void;
  onOptionEnter: (option: NormalizedCascaderOption) => void;
  onSearchResult: (path: CascaderFlatPath) => void;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
}

export const CascaderPopup = forwardRef<HTMLDivElement, CascaderPopupProps>(function CascaderPopup(
  { id, style, menus, searchResults, multiple, busyIds, selectedKeys, onOptionClick, onOptionEnter, onSearchResult, onPointerDown },
  ref,
) {
  return createPortal(
    <div ref={ref} id={id} className="qizhi-cascader-popup" style={style} onPointerDown={onPointerDown}>
      {searchResults ? (
        <Dropdown.Menu className="qizhi-cascader-popup__menu qizhi-cascader-popup__search-results" role="listbox" aria-multiselectable={multiple || undefined}>
          {searchResults.length ? searchResults.map((path) => (
            <Dropdown.Item
              key={JSON.stringify(path.valuePath)}
              itemKey={JSON.stringify(path.valuePath)}
              role="option"
              aria-selected={selectedKeys.has(JSON.stringify(path.valuePath))}
              onClick={() => onSearchResult(path)}
            >
              {path.labels.join(" / ")}
            </Dropdown.Item>
          )) : <div className="qizhi-cascader-popup__empty" role="status">暂无数据</div>}
        </Dropdown.Menu>
      ) : menus.map((options, index) => (
        <Menu
          key={index}
          options={options}
          multiple={multiple}
          busyIds={busyIds}
          selectedKeys={selectedKeys}
          onOptionClick={onOptionClick}
          onOptionEnter={onOptionEnter}
        />
      ))}
    </div>,
    document.body,
  );
});
