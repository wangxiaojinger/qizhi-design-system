import { useState } from "react";
import { TreeSelect } from "@wangxiaojinger/qizhi-react";
import type {
  TreeSelectOption,
  TreeSelectSize,
} from "@wangxiaojinger/qizhi-react";
import { DemoSegmentedControl } from
  "../../demo-controls/DemoSegmentedControl";

const treeData: TreeSelectOption[] = [
  {
    label: "主干",
    value: "trunk",
    children: [{ label: "叶子", value: "leaf" }],
  },
];

const sizeOptions: Array<{
  label: string;
  value: TreeSelectSize;
}> = [
  { label: "32px", value: "default" },
  { label: "36px", value: "large" },
  { label: "40px", value: "huge" },
];

export default function App() {
  const [size, setSize] = useState<TreeSelectSize>("default");

  return (
    <div className="tree-select-docs-size">
      <DemoSegmentedControl
        aria-label="树选择尺寸"
        value={size}
        options={sizeOptions}
        onChange={(value) => setSize(value as TreeSelectSize)}
      />
      <TreeSelect
        treeData={treeData}
        defaultValue="trunk"
        size={size}
        aria-label={`${sizeOptions.find(
          (option) => option.value === size,
        )?.label} 树选择`}
      />
    </div>
  );
}
