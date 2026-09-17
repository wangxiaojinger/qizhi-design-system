import { Cascader } from "@wangxiaojinger/qizhi-react";

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

export default function AddBeforeDemo() {
  return (
    <div className="cascader-docs-row">
      <Cascader options={options} addBefore="选择城市" />
      <Cascader
        mode="multiple"
        options={options}
        addBefore="选择城市"
        expandTrigger="hover"
      />
    </div>
  );
}
