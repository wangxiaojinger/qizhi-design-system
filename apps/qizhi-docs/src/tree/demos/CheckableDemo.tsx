import { useState } from "react";
import { Checkbox, Tree } from "@wangxiaojinger/qizhi-react";

const treeData = [
  {
    key: "check-0-0",
    title: "Trunk 0-0",
    children: [
      { key: "check-0-0-1", title: "Leaf" },
      {
        key: "check-0-0-2",
        title: "Branch 0-0-2",
        disabled: true,
        children: [
          { key: "check-0-0-2-1", title: "Leaf" },
          { key: "check-0-0-2-2", title: "Leaf", disableCheckbox: true },
        ],
      },
    ],
  },
  {
    key: "check-0-1",
    title: "Trunk 0-1",
    children: [
      {
        key: "check-0-1-1",
        title: "Branch 0-1-1",
        children: [
          { key: "check-0-1-1-1", title: "Leaf" },
          { key: "check-0-1-1-2", title: "Leaf" },
        ],
      },
      { key: "check-0-1-2", title: "Leaf" },
    ],
  },
];

export default function CheckableDemo() {
  const [checkStrictly, setCheckStrictly] = useState(false);
  return (
    <div className="tree-docs-stack">
      <Checkbox checked={checkStrictly} onChange={setCheckStrictly}>
        checkStrictly
      </Checkbox>
      <Tree
        treeData={treeData}
        checkable
        checkStrictly={checkStrictly}
        defaultCheckedKeys={["check-0-0-1", "check-0-1"]}
        defaultExpandedKeys={[
          "check-0-0",
          "check-0-0-2",
          "check-0-1",
          "check-0-1-1",
        ]}
      />
    </div>
  );
}
