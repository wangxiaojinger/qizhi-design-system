import { Cascader } from "@wangxiaojinger/qizhi-react";

const options = [
  {
    label: "上海",
    value: "shanghai",
    children: [
      {
        label: "上海市",
        value: "shanghai-city",
        children: [{ label: "黄浦", value: "huangpu" }],
      },
    ],
  },
];

const defaultValue = ["shanghai", "shanghai-city", "huangpu"];

export default function ClearDemo() {
  return <Cascader options={options} defaultValue={defaultValue} allowClear />;
}
