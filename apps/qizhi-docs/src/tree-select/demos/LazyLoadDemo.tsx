import { TreeSelect } from "@wangxiaojinger/qizhi-react";
import type { TreeSelectOption } from "@wangxiaojinger/qizhi-react";

const treeData: TreeSelectOption[] = [
  {
    label: "节点一",
    value: "node-1",
    children: [
      { label: "节点四", value: "node-4", isLeaf: true },
      { label: "待加载节点", value: "lazy", isLeaf: false },
    ],
  },
];

const wait = (duration: number) =>
  new Promise((resolve) => window.setTimeout(resolve, duration));

export default function App() {
  const loadMore = async (option: TreeSelectOption) => {
    await wait(500);
    return [
      {
        label: `${option.label}的子节点`,
        value: `${option.value}-child`,
        isLeaf: true,
      },
    ];
  };

  return (
    <TreeSelect
      treeData={treeData}
      defaultValue="node-4"
      showSearch
      loadMore={loadMore}
      aria-label="动态加载树选择"
    />
  );
}
