import { Cascader } from "@wangxiaojinger/qizhi-react";

const options = [
  {
    label: "北京",
    value: "beijing",
    children: [
      {
        label: "北京市",
        value: "beijing-city",
        children: [
          { label: "朝阳", value: "chaoyang", isLeaf: true },
          { label: "东城", value: "dongcheng", isLeaf: true },
        ],
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
        children: [
          { label: "黄浦", value: "huangpu", isLeaf: true },
          { label: "徐汇", value: "xuhui", disabled: true, isLeaf: true },
        ],
      },
    ],
  },
];

export default function BasicDemo() {
  return (
    <div className="cascader-docs-grid">
      <Cascader options={options} />
      <Cascader
        options={options}
        expandTrigger="hover"
        placeholder="鼠标悬停即可展开"
      />
      <Cascader options={options} status="error" />
      <Cascader options={options} status="warning" />
    </div>
  );
}
