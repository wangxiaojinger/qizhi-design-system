import { TreeSelect } from "@wangxiaojinger/qizhi-react";
import type { TreeSelectOption } from "@wangxiaojinger/qizhi-react";

const treeData: TreeSelectOption[] = [
  {
    label: "主干",
    value: "trunk",
    children: [{ label: "叶子", value: "leaf" }],
  },
];

export default function App() {
  return (
    <TreeSelect
      treeData={treeData}
      labelInValue
      defaultValue={{ label: "叶子", value: "leaf" }}
      aria-label="包含标签的树选择"
    />
  );
}
