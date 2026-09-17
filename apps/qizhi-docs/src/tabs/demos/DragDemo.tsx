import { useState } from "react";
import { DragIcon, Tabs } from "@wangxiaojinger/qizhi-react";
import type { DragEvent } from "react";
import type { TabsItem, TabsKey } from "@wangxiaojinger/qizhi-react";

const initial: readonly TabsItem[] = [1, 2, 3].map((key) => ({
  key,
  title: `Tab ${key}`,
  content: `标签${key}内容区。`,
}));

export default function DragDemo() {
  const [items, setItems] = useState(initial);
  const [dragKey, setDragKey] = useState<TabsKey>();
  const drop = (event: DragEvent, targetKey: TabsKey) => {
    event.preventDefault();
    if (dragKey === undefined || dragKey === targetKey) return;
    const next = [...items];
    const from = next.findIndex((item) => item.key === dragKey);
    const to = next.findIndex((item) => item.key === targetKey);
    const [moved] = next.splice(from, 1);
    if (moved) next.splice(to, 0, moved);
    setItems(next);
  };
  return (
    <Tabs
      items={items.map((item) => ({
        ...item,
        title: (
          <span
            className="tabs-docs-drag-title"
            draggable
            onDragStart={() => setDragKey(item.key)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => drop(event, item.key)}
          >
            <DragIcon />{item.title}
          </span>
        ),
      }))}
    />
  );
}

