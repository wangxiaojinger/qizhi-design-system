import { useState } from "react";
import { Checkbox, Tree } from "@wangxiaojinger/qizhi-react";
import type { TreeKey } from "@wangxiaojinger/qizhi-react";

const treeData = [
  {
    key: "multi-0-0",
    title: "Trunk 0-0",
    children: [
      { key: "multi-0-0-1", title: "Leaf" },
      {
        key: "multi-0-0-2",
        title: "Branch 0-0-2",
        children: [{ key: "multi-0-0-2-1", title: "Leaf" }],
      },
    ],
  },
  {
    key: "multi-0-1",
    title: "Trunk 0-1",
    children: [
      {
        key: "multi-0-1-1",
        title: "Branch 0-1-1",
        children: [
          { key: "multi-0-1-1-1", title: "Leaf" },
          { key: "multi-0-1-1-2", title: "Leaf" },
        ],
      },
      { key: "multi-0-1-2", title: "Leaf" },
    ],
  },
];

export default function MultipleDemo() {
  const [multiple, setMultiple] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<TreeKey[]>([]);

  return (
    <div className="tree-docs-stack">
      <Checkbox checked={multiple} onChange={setMultiple}>
        multiple
      </Checkbox>
      <div className="tree-docs-current">
        Current: {selectedKeys.map(String).join(", ")}
      </div>
      <Tree
        treeData={treeData}
        multiple={multiple}
        selectedKeys={selectedKeys}
        defaultExpandedKeys={[
          "multi-0-0",
          "multi-0-0-2",
          "multi-0-1",
          "multi-0-1-1",
        ]}
        onSelect={setSelectedKeys}
      />
    </div>
  );
}
