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
      renderFormat={(option) => (
        <span className="tree-select-demo__rich-value">
          {option.label}
        </span>
      )}
      aria-label="自定义渲染树选择"
    />
  );
}
