import { useState } from "react";
import { AutoComplete, SearchIcon } from "@wangxiaojinger/qizhi-react";
import type { AutoCompleteOption } from "@wangxiaojinger/qizhi-react";

const App = () => {
  const [data, setData] = useState<AutoCompleteOption[]>([]);
  const search = (value: string) => setData(value ? ["Group-1", "Group-2", "Group-3"].flatMap((group, groupIndex) =>
    Array.from({ length: 3 }, (_, optionIndex) => ({ value: `${value}-${groupIndex + 1}-${optionIndex + 1}`, group })),
  ) : []);
  return (
    <AutoComplete
      aria-label="查询模式确定类目"
      className="auto-complete-docs-wide"
      data={data}
      placeholder="请输入"
      suffix={<SearchIcon />}
      filterOption={false}
      onSearch={search}
    />
  );
};

export default App;
