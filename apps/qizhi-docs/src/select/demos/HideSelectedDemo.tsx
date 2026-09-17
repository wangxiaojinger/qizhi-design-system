import { Select } from "@wangxiaojinger/qizhi-react";

const options = Array.from({ length: 10 }, (_, index) => ({
  label: `选项 ${index + 1}`,
  value: `选项 ${index + 1}`,
}));

export default function HideSelectedDemo() {
  return (
    <Select
      className="select-docs-wide"
      mode="multiple"
      options={options}
      hideSelected
    />
  );
}
