import type { SelectOption } from "@wangxiaojinger/qizhi-react";
import { Select, SelectOptionCard } from "@wangxiaojinger/qizhi-react";

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

function describeImage(option: SelectOption) {
  const description = option.value === "sandbox-base"
    ? "可用于模型任务的基础镜像。"
    : "可用于文档解析任务的镜像。";

  return (
    <div>
      <div>镜像状态：创建成功</div>
      <div>{`镜像描述：${description}`}</div>
    </div>
  );
}

export default function CardDescriptionDemo() {
  return (
    <Select
      className="select-docs-card-select"
      options={imageOptions}
      renderOption={renderImageOption}
      renderOptionDescription={describeImage}
    />
  );
}
