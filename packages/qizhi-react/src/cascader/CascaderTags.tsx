import type { DragEvent } from "react";
import type { CascaderPathValue } from "./Cascader.types";

export interface CascaderTagItem {
  path: CascaderPathValue;
  label: string;
}

interface CascaderTagsProps {
  items: CascaderTagItem[];
  draggable?: boolean;
  onReorder: (from: number, to: number) => void;
}

export function CascaderTags({ items, draggable = false, onReorder }: CascaderTagsProps) {
  const startDrag = (event: DragEvent<HTMLLIElement>, index: number) => {
    event.dataTransfer.setData("text/qizhi-cascader-index", String(index));
    event.dataTransfer.effectAllowed = "move";
  };

  const drop = (event: DragEvent<HTMLLIElement>, index: number) => {
    event.preventDefault();
    const from = Number(event.dataTransfer.getData("text/qizhi-cascader-index"));
    if (Number.isInteger(from) && from !== index) onReorder(from, index);
  };

  return (
    <ul className="qizhi-cascader__tags" aria-label="已选路径">
      {items.map((item, index) => (
        <li
          key={JSON.stringify(item.path)}
          className="qizhi-cascader__tag"
          aria-label={item.label}
          draggable={draggable}
          onDragStart={(event) => startDrag(event, index)}
          onDragOver={draggable ? (event) => event.preventDefault() : undefined}
          onDrop={draggable ? (event) => drop(event, index) : undefined}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}

