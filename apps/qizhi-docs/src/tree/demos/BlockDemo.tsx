import { Tree } from "@wangxiaojinger/qizhi-react";

const treeData = [
  {
    key: "block-0-0",
    title: "Trunk 0-0",
    children: [
      {
        key: "block-0-0-0",
        title: "Branch 0-0-0",
        disabled: true,
        children: [
          { key: "block-0-0-0-0", title: "Leaf 0-0-0-0" },
          { key: "block-0-0-0-1", title: "Leaf 0-0-0-1" },
        ],
      },
      {
        key: "block-0-0-1",
        title: "Branch 0-0-1",
        children: [{ key: "block-0-0-1-0", title: "Leaf 0-0-1-0" }],
      },
    ],
  },
];

export default function BlockDemo() {
  return (
    <Tree
      blockNode
      treeData={treeData}
      defaultExpandedKeys={["block-0-0", "block-0-0-0", "block-0-0-1"]}
      defaultSelectedKeys={["block-0-0-0-1"]}
    />
  );
}
