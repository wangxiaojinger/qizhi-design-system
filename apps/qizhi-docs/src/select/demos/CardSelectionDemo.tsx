import { useState } from "react";
import type { SelectOption } from "@wangxiaojinger/qizhi-react";
import {
  Select,
  SelectOptionCard,
  SelectSelectionCard,
} from "@wangxiaojinger/qizhi-react";

const imageOptions: SelectOption[] = [
  {
    label: "sandbox-base:ubuntu24.04-py3.12-1.0.3",
    value: "sandbox-base",
  },
  { label: "mineru:0.21", value: "mineru" },
];

function renderImageOption(option: SelectOption) {
  const vendor = option.value === "sandbox-base" ? "通用" : "英伟达";

  return (
    <SelectOptionCard
      name={option.label}
      fields={[
        { key: "vendor", label: "支持的算力厂商", value: vendor },
        { key: "architecture", label: "支持的 CPU 架构", value: "x86" },
      ]}
    />
  );
}

export default function CardSelectionDemo() {
  const [selected, setSelected] = useState<SelectOption>();

  return (
    <div className="select-docs-card-selection">
      <Select
        allowClear
        className="select-docs-card-select"
        options={imageOptions}
        renderOption={renderImageOption}
        value={selected?.value}
        onChange={(_value, option) => setSelected(option)}
      />
      {selected ? (
        <SelectSelectionCard className="select-docs-card-related" fields={[
          { key: "vendor", label: "支持的算力厂商",
            value: selected.value === "sandbox-base" ? "通用" : "英伟达" },
          { key: "architecture", label: "支持的 CPU 架构", value: "x86" },
        ]} />
      ) : null}
    </div>
  );
}
