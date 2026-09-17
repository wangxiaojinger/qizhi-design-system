import type { SelectOption } from "@wangxiaojinger/qizhi-react";
import { Select, SelectOptionCard } from "@wangxiaojinger/qizhi-react";
import {
  ChildNodeIcon,
  GpuIcon,
  NodeManagementIcon,
} from "@wangxiaojinger/qizhi-react/icon";

const resourceOptions: SelectOption[] = [
  { label: "CPU-Public", value: "cpu-public" },
  { label: "H800-Public", value: "h800-public" },
];

function renderResourceOption(option: SelectOption) {
  const isCpu = option.value === "cpu-public";

  return (
    <SelectOptionCard
      name={option.label}
      fields={[
        {
          key: "resource",
          icon: <GpuIcon />,
          value: isCpu ? "CPU资源" : "NVIDIA H800（80GB）",
        },
        {
          key: "specification",
          icon: <NodeManagementIcon />,
          value: isCpu ? "58核1115.92GB" : "2040核26216.84GB61卡",
        },
        { key: "architecture", icon: <ChildNodeIcon />, value: "x86" },
      ]}
    />
  );
}

export default function CardIconFieldsDemo() {
  return (
    <Select
      className="select-docs-card-select"
      options={resourceOptions}
      renderOption={renderResourceOption}
    />
  );
}
