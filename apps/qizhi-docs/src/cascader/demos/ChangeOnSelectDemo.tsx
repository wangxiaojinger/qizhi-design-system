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

export default function ChangeOnSelectDemo() {
  return (
    <div className="cascader-docs-row">
      <Cascader
        options={options}
        changeOnSelect
        showSearch
        allowClear
      />
      <Cascader
        mode="multiple"
        options={options}
        changeOnSelect
        showSearch
      />
    </div>
  );
}
