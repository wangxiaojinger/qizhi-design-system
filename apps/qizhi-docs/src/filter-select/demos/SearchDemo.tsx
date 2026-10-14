import { FilterSelect } from "@wangxiaojinger/qizhi-react";

const options = [
  { value: "enterprise", label: "企业管理员" },
  { value: "research", label: "研究团队管理员" },
  { value: "project", label: "项目管理员" },
];

export default function SearchDemo() {
  return (
    <FilterSelect
      label="所有者"
      options={options}
      searchable
      emptyText="全部"
      placeholder="搜索所有者"
    />
  );
}
