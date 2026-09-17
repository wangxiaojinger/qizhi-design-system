import { useState } from "react";
import { AutoComplete, Input } from "@wangxiaojinger/qizhi-react";

const App = () => {
  const [data, setData] = useState<string[]>([]);
  return (
    <AutoComplete
      aria-label="自定义输入组件"
      className="auto-complete-docs-wide auto-complete-docs-textarea"
      data={data}
      filterOption={false}
      triggerElement={<Input.TextArea rows={3} placeholder="用您自己的文字进行自定义" />}
      onSearch={(value) => setData(value ? Array.from({ length: 5 }, (_, index) => `${value}_${index}`) : [])}
    />
  );
};

export default App;
