import { Select } from "@wangxiaojinger/qizhi-react";

const options = [
  { label: "第一条非常长的选项内容", value: "1" },
  { label: "第二条选项", value: "2" },
];

export default function PopupWidthDemo() {
  return (
    <div className="select-docs-row">
      <Select
        className="select-docs-narrow"
        options={options}
        popupWidth="content"
      />
      <Select
        className="select-docs-narrow"
        options={options}
        popupWidth={300}
      />
    </div>
  );
}
