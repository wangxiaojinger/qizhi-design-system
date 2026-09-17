import { useState } from "react";
import { AutoComplete } from "@wangxiaojinger/qizhi-react";

const App = () => {
  const [query, setQuery] = useState("");
  return (
    <AutoComplete aria-label="自定义选项" placeholder="请输入" filterOption={false} onSearch={setQuery}>
      {query ? Array.from({ length: 5 }, (_, index) => (
        <AutoComplete.Option key={index} value={`${query}_${index}`}>
          {query}_{index}
        </AutoComplete.Option>
      )) : null}
    </AutoComplete>
  );
};

export default App;
