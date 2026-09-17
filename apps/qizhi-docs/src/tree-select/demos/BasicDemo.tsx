import { TreeSelect } from "@wangxiaojinger/qizhi-react";
import type { TreeSelectOption } from "@wangxiaojinger/qizhi-react";

const treeData: TreeSelectOption[] = [
  {
    label: "主干",
    value: "trunk",
    children: [
      { label: "叶子一", value: "leaf-1" },
      { label: "叶子二", value: "leaf-2" },
    ],
  },
];

export default function App() {
  return (
    <TreeSelect
      treeData={treeData}
      defaultValue="trunk"
      allowClear
      aria-label="基础树选择"
    />
  );
}
