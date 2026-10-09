import { useEffect, useState } from "react";
import { Select } from "@wangxiaojinger/qizhi-react";

const people = [
  { label: "张伟", value: "张伟" },
  { label: "王芳", value: "王芳" },
  { label: "李娜", value: "李娜" },
  { label: "刘洋", value: "刘洋" },
];

export default function RemoteDemo() {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(people);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => {
      const keyword = searchValue.trim().toLowerCase();
      setOptions(people.filter((person) => (
        String(person.label).toLowerCase().includes(keyword)
      )));
      setLoading(false);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchValue]);

  return (
    <Select
      className="select-docs-wide"
      mode="multiple"
      options={options}
      showSearch
      searchValue={searchValue}
      onSearch={setSearchValue}
      filterOption={() => true}
      loading={loading}
      notFoundContent="没有匹配用户"
      maxCount={3}
      renderOption={(option) => (
        <>
          <span className="select-docs-avatar">
            {String(option.label).slice(0, 1)}
          </span>
          {option.label}
        </>
      )}
    />
  );
}
