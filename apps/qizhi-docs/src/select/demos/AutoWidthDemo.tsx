import { Divider, Select } from "@wangxiaojinger/qizhi-react";

const longOptions = [
  { label: "第一条长选项", value: "第一条长选项" },
  { label: "第二条选项", value: "第二条选项" },
  { label: "第三条", value: "第三条" },
];

export default function AutoWidthDemo() {
  return (
    <div className="select-docs-auto">
      <Divider>{`{"minWidth":200,"maxWidth":500}`}</Divider>
      <Select
        options={longOptions}
        autoWidth={{ minWidth: 200, maxWidth: 500 }}
      />
      <Select
        options={longOptions}
        addBefore="项目"
        autoWidth={{ minWidth: 200, maxWidth: 500 }}
      />

      <Divider>{`{"minWidth":0,"maxWidth":500}`}</Divider>
      <Select
        options={longOptions.slice(0, 2)}
        autoWidth={{ minWidth: 0, maxWidth: 500 }}
      />

      <Divider>{`{"minWidth":300,"maxWidth":"100%"}`}</Divider>
      <Select
        mode="multiple"
        options={longOptions}
        autoWidth={{ minWidth: 300, maxWidth: 500 }}
      />
    </div>
  );
}
