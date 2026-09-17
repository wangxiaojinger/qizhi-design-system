import { useMemo, useState } from "react";
import { Input, Tree } from "@wangxiaojinger/qizhi-react";
import type { TreeNodeData } from "@wangxiaojinger/qizhi-react";

const treeData: TreeNodeData[] = [
  {
    key: "search-0-0",
    title: "Trunk 0-0",
    children: [
      {
        key: "search-0-0-1",
        title: "Branch 0-0-1",
        children: [
          { key: "search-0-0-1-1", title: "Leaf 0-0-1-1" },
          { key: "search-0-0-1-2", title: "Leaf 0-0-1-2" },
        ],
      },
    ],
  },
  {
    key: "search-0-1",
    title: "Trunk 0-1",
    children: [
      {
        key: "search-0-1-1",
        title: "Branch 0-1-1",
        children: [{ key: "search-0-1-1-0", title: "Leaf 0-1-1-0" }],
      },
      {
        key: "search-0-1-2",
        title: "Branch 0-1-2",
        children: [{ key: "search-0-1-2-0", title: "Leaf 0-1-2-0" }],
      },
    ],
  },
];
const expandedKeys = [
  "search-0-0",
  "search-0-0-1",
  "search-0-1",
  "search-0-1-1",
  "search-0-1-2",
];
const filterTree = (
  nodes: readonly TreeNodeData[],
  keyword: string,
): TreeNodeData[] =>
  nodes.flatMap((node) => {
    const children = filterTree(node.children ?? [], keyword);
    return String(node.title).includes(keyword) || children.length
      ? [{ ...node, children }]
      : [];
  });

export default function SearchDemo() {
  const [keyword, setKeyword] = useState("");
  const filteredData = useMemo(
    () => (keyword ? filterTree(treeData, keyword) : treeData),
    [keyword],
  );
  return (
    <div className="tree-docs-search">
      <Input.Search
        value={keyword}
        aria-label="搜索树节点"
        onChange={(event) => setKeyword(event.target.value)}
      />
      <Tree treeData={filteredData} defaultExpandedKeys={expandedKeys} />
    </div>
  );
}
