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
    <div className="tree-select-docs-row">
      <TreeSelect
        treeData={treeData}
        showSearch
        placeholder="请选择..."
        aria-label="默认搜索"
      />
      <TreeSelect
        treeData={treeData}
        showSearch
        placeholder="请输入标签"
        filterTreeNode={(input, option) =>
          String(option.label).includes(input)}
        aria-label="自定义搜索"
      />
    </div>
  );
}
