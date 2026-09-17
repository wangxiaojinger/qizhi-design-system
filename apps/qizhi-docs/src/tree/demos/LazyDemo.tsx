import { Tree } from "@wangxiaojinger/qizhi-react";
import type { TreeNodeData } from "@wangxiaojinger/qizhi-react";

const treeData = [
  {
    key: "dynamic-0-0",
    title: "Trunk 0-0",
    children: [{ key: "dynamic-0-0-1", title: "leaf", isLeaf: true }],
  },
  { key: "dynamic-0-1", title: "Trunk 0-1", isLeaf: false },
];

const wait = (duration: number) =>
  new Promise((resolve) => window.setTimeout(resolve, duration));

export default function LazyDemo() {
  const loadData = async (node: TreeNodeData) => {
    await wait(700);
    return [{ key: `${String(node.key)}-1`, title: "leaf", isLeaf: true }];
  };
  return (
    <Tree
      treeData={treeData}
      loadData={loadData}
      defaultExpandedKeys={["dynamic-0-0"]}
    />
  );
}
