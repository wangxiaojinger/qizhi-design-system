import { useState } from "react";
import { TreeSelect } from "@wangxiaojinger/qizhi-react";
import type {
  TreeSelectOption,
  TreeSelectValue,
} from "@wangxiaojinger/qizhi-react";

const treeData: TreeSelectOption[] = [
  {
    label: "主干",
    value: "trunk",
    children: [{ label: "叶子", value: "leaf" }],
  },
];

export default function App() {
  const [value, setValue] = useState<TreeSelectValue | undefined>("leaf");

  return (
    <TreeSelect
      treeData={treeData}
      value={value}
      onChange={setValue}
      aria-label="受控树选择"
    />
  );
}
