import type { SelectOption } from "@wangxiaojinger/qizhi-react";
import { Select, SelectOptionCard } from "@wangxiaojinger/qizhi-react";

const projectOptions: SelectOption[] = [
  { label: "智能科研平台", value: "science" },
  { label: "量化研究项目", value: "quant" },
];

function renderProjectOption(option: SelectOption) {
  const budget = option.value === "science" ? "93956.01元" : "1174149.03元";

  return (
    <SelectOptionCard
      name={option.label}
      fields={[
        { key: "priority", label: "优先级", value: "高优项目-10" },
        { key: "budget", label: "预算", value: budget },
      ]}
    />
  );
}

export default function CardNameFieldsDemo() {
  return (
    <Select
      className="select-docs-card-select"
      options={projectOptions}
      renderOption={renderProjectOption}
    />
  );
}
