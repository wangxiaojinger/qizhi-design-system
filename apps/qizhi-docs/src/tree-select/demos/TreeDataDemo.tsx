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
      defaultValue="leaf"
      placeholder="请选择..."
      aria-label="数据生成树选择"
    />
  );
}
