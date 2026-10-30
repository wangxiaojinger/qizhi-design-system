import { FilterSelect } from "@wangxiaojinger/qizhi-react";

const options = [
  { value: "enterprise", label: "企业管理员" },
  { value: "research", label: "研究团队管理员" },
];

export default function SingleDemo() {
  return (
    <FilterSelect
      label="所有者"
      options={options}
      allOption={{ value: "all", label: "全部" }}
      defaultValue="all"
    />
  );
}
