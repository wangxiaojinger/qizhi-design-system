import { Cascader } from "@wangxiaojinger/qizhi-react";

const options = [
  {
    name: "上海",
    code: "shanghai",
    nodes: [{ name: "黄浦", code: "huangpu", leaf: true }],
  },
];

const fieldNames = {
  label: "name",
  value: "code",
  children: "nodes",
  isLeaf: "leaf",
};

export default function FieldNamesDemo() {
  return (
    <Cascader
      mode="multiple"
      options={options}
      fieldNames={fieldNames}
      showSearch
      allowClear
    />
  );
}
