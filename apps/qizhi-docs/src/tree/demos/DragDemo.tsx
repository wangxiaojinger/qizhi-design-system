import { useState } from "react";
import { Checkbox, DragIcon, Tree } from "@wangxiaojinger/qizhi-react";
import type { TreeNodeData } from "@wangxiaojinger/qizhi-react";

const initialData: TreeNodeData[] = [
  {
    key: "drag-0-0",
    title: "Trunk 0-0",
    children: [
      { key: "drag-0-0-1", title: "Leaf 0-0-1" },
      {
        key: "drag-0-0-2",
        title: "Branch 0-0-2",
        children: [
          {
            key: "drag-0-0-2-1",
            title: "Leaf 0-0-2-1 (Drag disabled)",
            draggable: false,
          },
        ],
      },
    ],
  },
  {
    key: "drag-0-1",
    title: "Trunk 0-1",
    children: [{ key: "drag-0-1-2", title: "Leaf 0-1-2" }],
  },
];

export default function DragDemo() {
  const [treeData, setTreeData] = useState(initialData);
  const [checkable, setCheckable] = useState(false);
  return (
    <div className="tree-docs-stack">
      <Checkbox checked={checkable} onChange={setCheckable}>
        checkable
      </Checkbox>
      <Tree
        treeData={treeData}
        blockNode
        draggable
        checkable={checkable}
        defaultExpandedKeys={["drag-0-0", "drag-0-0-2", "drag-0-1"]}
        renderTitle={(node) => (
          <span className="tree-docs-drag-title">
            {String(node.title)}
            {node.draggable === false ? null : <DragIcon />}
          </span>
        )}
        onDrop={(info) => setTreeData(info.treeData)}
      />
    </div>
  );
}
