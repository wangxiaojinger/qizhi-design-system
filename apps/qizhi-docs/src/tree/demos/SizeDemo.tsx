import { useState } from "react";
import { Radio, Tree } from "@wangxiaojinger/qizhi-react";
import type { TreeSize } from "@wangxiaojinger/qizhi-react";

const treeData = [
  {
    key: "size-0-0",
    title: "Trunk 0-0",
    children: [
      {
        key: "size-0-0-0",
        title: "Branch 0-0-0",
        disabled: true,
        children: [
          { key: "size-0-0-0-0", title: "Leaf" },
          { key: "size-0-0-0-1", title: "Leaf" },
        ],
      },
    ],
  },
];
const options = [
  { label: "mini", value: "mini" },
  { label: "small", value: "small" },
  { label: "default", value: "default" },
  { label: "large", value: "large" },
];

export default function SizeDemo() {
  const [size, setSize] = useState<TreeSize>("default");
  return (
    <div className="tree-docs-stack">
      <Radio.Group
        type="button"
        value={size}
        options={options}
        aria-label="size"
        onChange={(value) => setSize(value as TreeSize)}
      />
      <Tree
        treeData={treeData}
        blockNode
        checkable
        size={size}
        defaultExpandedKeys={["size-0-0", "size-0-0-0"]}
      />
    </div>
  );
}
