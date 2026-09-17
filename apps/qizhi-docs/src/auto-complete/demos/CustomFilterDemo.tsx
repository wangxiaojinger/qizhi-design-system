import { useState } from "react";
import { AutoComplete } from "@wangxiaojinger/qizhi-react";

const App = () => {
  const [data, setData] = useState<string[]>([]);
  const search = (value: string) => {
    const seed = value.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
    setData(value ? Array.from({ length: 5 }, (_, index) => String((seed * 7919 + index * 104729) % 10000000000).padStart(10, "0")) : []);
  };
  return (
    <AutoComplete
      aria-label="自定义过滤规则"
      data={data}
      placeholder="请输入"
      filterOption={() => true}
      onSearch={search}
    />
  );
};

export default App;
