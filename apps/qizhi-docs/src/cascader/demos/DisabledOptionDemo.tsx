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
    children: [
      { label: "黄浦", value: "huangpu" },
      { label: "徐汇", value: "xuhui", disabled: true },
    ],
  },
];

export default function DisabledOptionDemo() {
  return (
    <div className="cascader-docs-row">
      <Cascader options={options} showSearch allowClear />
      <Cascader
        mode="multiple"
        options={options}
        showSearch
        allowClear
      />
    </div>
  );
}
