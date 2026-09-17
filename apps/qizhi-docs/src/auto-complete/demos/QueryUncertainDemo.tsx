import { useState } from "react";
import { AutoComplete, SearchIcon } from "@wangxiaojinger/qizhi-react";
import type { AutoCompleteOption } from "@wangxiaojinger/qizhi-react";

const App = () => {
  const [data, setData] = useState<AutoCompleteOption[]>([]);
  const search = (value: string) => setData(value ? Array.from({ length: 3 }, (_, index) => ({
    value: `${value}-${index + 1}`,
    label: <><span>{value}-{index + 1}</span><small>{(value.length * 137 + index * 211) % 1000} results</small></>,
  })) : []);
  return (
    <AutoComplete
      aria-label="查询模式不确定类目"
      className="auto-complete-docs-wide auto-complete-docs-with-meta"
      data={data}
      placeholder="请输入"
      suffix={<SearchIcon />}
      filterOption={false}
      onSearch={search}
    />
  );
};

export default App;
