import { StarIcon, Tree } from "@wangxiaojinger/qizhi-react";

const treeData = [
  {
    key: "icon-node1",
    title: "Trunk",
    icon: <StarIcon />,
    children: [{ key: "icon-node2", title: "Leaf", icon: <StarIcon /> }],
  },
  {
    key: "icon-node3",
    title: "Trunk",
    icon: <StarIcon />,
    children: [
      { key: "icon-node4", title: "Leaf", icon: <StarIcon /> },
      { key: "icon-node5", title: "Leaf", icon: <StarIcon /> },
    ],
  },
];

export default function IconDemo() {
  return (
    <Tree
      treeData={treeData}
      defaultExpandedKeys={["icon-node1", "icon-node3"]}
    />
  );
}
