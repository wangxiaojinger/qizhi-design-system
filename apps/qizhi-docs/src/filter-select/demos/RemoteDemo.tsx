import { useEffect, useState } from "react";
import { FilterSelect } from "@wangxiaojinger/qizhi-react";

const people = [
  { value: "enterprise", label: "企业管理员" },
  { value: "research", label: "研究团队管理员" },
  { value: "project", label: "项目管理员" },
];

export default function RemoteDemo() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(people);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => {
      setOptions(people.filter((option) => (
        String(option.label).includes(keyword.trim())
      )));
      setLoading(false);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  return (
    <FilterSelect
      label="所有者"
      options={options}
      searchable
      searchValue={keyword}
      onSearch={setKeyword}
      filterOption={false}
      loading={loading}
      notFoundContent="没有匹配的所有者"
    />
  );
}
