import { Select } from "@wangxiaojinger/qizhi-react";

const foods = [
  { label: "新西兰羊排", value: "新西兰羊排" },
  { label: "北京烤鸭", value: "北京烤鸭" },
  { label: "广州早茶", value: "广州早茶" },
];

export default function SearchDemo() {
  return (
    <div className="select-docs-row">
      <Select
        options={foods}
        defaultValue="新西兰羊排"
        showSearch
        allowClear
      />
      <Select
        options={foods}
        defaultValue="新西兰羊排"
        showSearch
        filterOption={(input, option) => String(option.label).includes(input)}
        allowClear
      />
      <Select
        options={foods}
        defaultValue="新西兰羊排"
        showSearch={{ retainInputValue: true }}
        allowClear
      />
    </div>
  );
}
