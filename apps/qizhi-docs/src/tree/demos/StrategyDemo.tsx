import { useState } from "react";
import { Radio, Tree } from "@wangxiaojinger/qizhi-react";
import type { TreeCheckedStrategy, TreeKey } from "@wangxiaojinger/qizhi-react";

const treeData = [
  {
    key: "0-0",
    title: "Trunk 0-0",
    children: [
      { key: "0-0-1", title: "Leaf" },
      {
        key: "0-0-2",
        title: "Branch 0-0-2",
        children: [{ key: "0-0-2-1", title: "Leaf" }],
      },
    ],
  },
];
const options = [
  { label: "show all", value: "all" },
  { label: "show parent", value: "parent" },
  { label: "show child", value: "child" },
];

export default function StrategyDemo() {
  const [strategy, setStrategy] = useState<TreeCheckedStrategy>("all");
  const [checkedKeys, setCheckedKeys] = useState<TreeKey[]>(["0-0"]);
  return (
    <div className="tree-docs-stack">
      <Radio.Group
        type="button"
        value={strategy}
        options={options}
        aria-label="checkedStrategy"
        onChange={(value) => setStrategy(value as TreeCheckedStrategy)}
      />
      <div className="tree-docs-current">
        Current: {checkedKeys.map(String).join(", ")}
      </div>
      <Tree
        treeData={treeData}
        checkable
        checkStrictly
        checkedKeys={checkedKeys}
        checkedStrategy={strategy}
        defaultExpandedKeys={["0-0", "0-0-2"]}
        onCheck={(keys) => setCheckedKeys(keys)}
      />
    </div>
  );
}
