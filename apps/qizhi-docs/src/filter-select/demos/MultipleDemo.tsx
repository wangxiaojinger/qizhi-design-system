import { FilterSelect } from "@wangxiaojinger/qizhi-react";

const options = ["标签A", "标签B", "标签C", "标签D", "标签E"].map(
  (label) => ({ label, value: label }),
);

export default function MultipleDemo() {
  return (
    <FilterSelect
      mode="multiple"
      label="标签"
      options={options}
      defaultValue={options.map((option) => option.value)}
      maxDisplayCount={2}
    />
  );
}
