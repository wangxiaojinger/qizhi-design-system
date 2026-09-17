import { useState } from "react";
import { Cascader } from "@wangxiaojinger/qizhi-react";
import type { CascaderSize } from "@wangxiaojinger/qizhi-react";
import { DemoSegmentedControl } from "../../demo-controls/DemoSegmentedControl";

const options = [
  {
    label: "北京",
    value: "beijing",
    children: [{ label: "朝阳", value: "chaoyang" }],
  },
  {
    label: "上海",
    value: "shanghai",
    children: [{ label: "黄浦", value: "huangpu" }],
  },
];

export default function SizeDemo() {
  const [size, setSize] = useState<CascaderSize>("default");

  return (
    <div className="cascader-size-demo">
      <DemoSegmentedControl
        aria-label="级联选择尺寸"
        value={size}
        options={["mini", "small", "default", "large"]}
        onChange={setSize}
      />
      <div className="cascader-size-demo__controls">
        <Cascader options={options} size={size} allowClear />
        <Cascader options={options} size={size} mode="multiple" showSearch allowClear />
      </div>
    </div>
  );
}
