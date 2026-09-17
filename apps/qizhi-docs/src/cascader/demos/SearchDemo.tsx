import { Cascader } from "@wangxiaojinger/qizhi-react";

const options = [
  {
    label: "北京",
    value: "beijing",
    children: [
      {
        label: "北京市",
        value: "beijing-city",
        children: [{ label: "朝阳", value: "chaoyang", isLeaf: true }],
      },
    ],
  },
  {
    label: "上海",
    value: "shanghai",
    children: [
      {
        label: "上海市",
        value: "shanghai-city",
        children: [{ label: "黄浦", value: "huangpu", isLeaf: true }],
      },
    ],
  },
];

const defaultValue = ["shanghai", "shanghai-city", "huangpu"];

export default function SearchDemo() {
  return (
    <div className="cascader-docs-row">
      <Cascader
        options={options}
        defaultValue={defaultValue}
        showSearch
        allowClear
      />
      <Cascader
        mode="multiple"
        options={options}
        defaultValue={[defaultValue]}
        showSearch
        allowClear
      />
    </div>
  );
}
