import { Tree } from "@wangxiaojinger/qizhi-react";

const treeData = [
  {
    key: "0-0",
    title: "Trunk",
    children: [
      {
        key: "0-0-0",
        title: "Branch 0-0-0",
        disabled: true,
        children: [
          { key: "0-0-0-0", title: "Leaf" },
          { key: "0-0-0-1", title: "Leaf" },
        ],
      },
      {
        key: "0-0-1",
        title: "Branch 0-0-1",
        children: [{ key: "0-0-1-0", title: "Leaf" }],
      },
    ],
  },
];

export default function BasicDemo() {
  return (
    <Tree
      treeData={treeData}
      defaultExpandedKeys={["0-0", "0-0-0"]}
      defaultSelectedKeys={["0-0-1"]}
    />
  );
}
