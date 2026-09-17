import { Tree } from "@wangxiaojinger/qizhi-react";

const treeData = [
  {
    key: "tree-data-0-0",
    title: "Trunk 0-0",
    children: [
      {
        key: "tree-data-0-0-2",
        title: "Branch 0-0-2",
        selectable: false,
        children: [
          {
            key: "tree-data-0-0-2-1",
            title: "Leaf",
            children: [
              {
                key: "tree-data-0-0-2-1-0",
                title: "Leafsss 0-0-2",
                children: [
                  { key: "tree-data-0-0-2-1-0-0", title: "Leaf" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "tree-data-0-1",
    title: "Trunk 0-1",
    children: [
      {
        key: "tree-data-0-1-1",
        title: "Branch 0-1-1",
        children: [{ key: "tree-data-0-1-1-0", title: "Leaf" }],
      },
    ],
  },
];

export default function TreeDataDemo() {
  return (
    <Tree
      treeData={treeData}
      defaultExpandedKeys={[
        "tree-data-0-0",
        "tree-data-0-0-2",
        "tree-data-0-0-2-1",
        "tree-data-0-0-2-1-0",
        "tree-data-0-1",
        "tree-data-0-1-1",
      ]}
    />
  );
}
