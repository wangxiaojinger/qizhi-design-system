import { useState } from "react";
import { Button, Tree } from "@wangxiaojinger/qizhi-react";
import type { TreeKey } from "@wangxiaojinger/qizhi-react";

const allKeys: TreeKey[] = [
  "controlled-0-0",
  "controlled-0-0-1",
  "controlled-0-0-2",
  "controlled-0-0-2-1",
  "controlled-0-1",
  "controlled-0-1-1",
  "controlled-0-1-2",
];
const branchKeys: TreeKey[] = [
  "controlled-0-0",
  "controlled-0-0-2",
  "controlled-0-1",
];
const treeData = [
  {
    key: "controlled-0-0",
    title: "Trunk 0-0",
    children: [
      { key: "controlled-0-0-1", title: "Leaf 0-0-1" },
      {
        key: "controlled-0-0-2",
        title: "Branch 0-0-2",
        children: [
          { key: "controlled-0-0-2-1", title: "Leaf 0-0-2-1" },
        ],
      },
    ],
  },
  {
    key: "controlled-0-1",
    title: "Trunk 0-1",
    children: [
      { key: "controlled-0-1-1", title: "Leaf 0-1-1" },
      { key: "controlled-0-1-2", title: "Leaf 0-1-2" },
    ],
  },
];

export default function ControlledDemo() {
  const [selectedKeys, setSelectedKeys] = useState<TreeKey[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<TreeKey[]>(allKeys);
  const [expandedKeys, setExpandedKeys] = useState<TreeKey[]>(branchKeys);
  return (
    <div className="tree-docs-stack">
      <div className="tree-docs-actions">
        <Button
          type="primary"
          onClick={() =>
            setSelectedKeys(selectedKeys.length ? [] : [...allKeys])
          }
        >
          {selectedKeys.length ? "deselect all" : "select all"}
        </Button>
        <Button
          type="primary"
          onClick={() =>
            setExpandedKeys(expandedKeys.length ? [] : branchKeys)
          }
        >
          {expandedKeys.length ? "fold" : "unfold"}
        </Button>
      </div>
      <Tree
        treeData={treeData}
        checkable
        selectedKeys={selectedKeys}
        checkedKeys={checkedKeys}
        expandedKeys={expandedKeys}
        onSelect={setSelectedKeys}
        onCheck={(_, info) => setCheckedKeys(info.checkedKeys)}
        onExpand={setExpandedKeys}
      />
    </div>
  );
}
