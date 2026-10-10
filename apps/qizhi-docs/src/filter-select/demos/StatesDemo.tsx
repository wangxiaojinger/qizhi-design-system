import { FilterSelect } from "@wangxiaojinger/qizhi-react";

const options = [
  { value: "research", label: "research" },
  { value: "design", label: "design" },
  { value: "system", label: "system" },
];

export default function StatesDemo() {
  return (
    <div className="filter-select-docs-stack">
      <FilterSelect
        mode="multiple"
        label="标签"
        options={options}
        defaultValue={["research", "design", "system"]}
        renderMore={(count) => `另有 ${count} 项`}
        allowClear
      />
      <FilterSelect
        label="状态"
        options={options}
        emptyText="不可用"
        disabled
      />
    </div>
  );
}
