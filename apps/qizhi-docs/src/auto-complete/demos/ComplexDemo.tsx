import { useState } from "react";
import { AutoComplete, Popover } from "@wangxiaojinger/qizhi-react";

const App = () => {
  const [value, setValue] = useState("Beijing");
  return (
    <Popover
      trigger="focus"
      role="tooltip"
      content="只有当选中或者输入 Beijing 的时候才改变值，不然重置为空"
    >
      <AutoComplete
        aria-label="复杂用法"
        value={value}
        data={[{ value: "Beijing", label: "北京" }]}
        placeholder="请输入..."
        filterOption={(inputValue, option) => option.value.toLowerCase().includes(inputValue.toLowerCase())}
        onChange={setValue}
        onBlur={() => window.setTimeout(() => setValue((current) => current === "Beijing" ? current : ""), 100)}
      />
    </Popover>
  );
};

export default App;
