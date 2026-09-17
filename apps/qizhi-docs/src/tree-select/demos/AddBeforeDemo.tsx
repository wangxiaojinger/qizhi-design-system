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
    <div className="tree-select-docs-row tree-select-docs-row--compact">
      <TreeSelect
        treeData={treeData}
        addBefore="树节点"
        aria-label="单选树节点"
      />
      <TreeSelect
        multiple
        treeData={treeData}
        addBefore="树节点"
        aria-label="多选树节点"
      />
    </div>
  );
}
