import { Select } from "@wangxiaojinger/qizhi-react";

const options = Array.from({ length: 1000 }, (_, index) => ({
  label: `选项 ${index + 1}`,
  value: index + 1,
}));

export default function VirtualDemo() {
  return (
    <Select
      className="select-docs-wide"
      options={options}
      listHeight={256}
      showSearch
      placeholder="请在 1000 个选项中选择"
    />
  );
}
