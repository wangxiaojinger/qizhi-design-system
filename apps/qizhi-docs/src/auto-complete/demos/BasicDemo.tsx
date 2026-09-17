import { useState } from "react";
import { AutoComplete } from "@wangxiaojinger/qizhi-react";

const App = () => {
  const [data, setData] = useState<string[]>([]);
  return (
    <AutoComplete
      aria-label="基础自动补全"
      data={data}
      placeholder="请输入"
      filterOption={false}
      onSearch={(value) => setData(value ? Array.from({ length: 5 }, (_, index) => `${value}_${index}`) : [])}
    />
  );
};

export default App;
