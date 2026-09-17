import { AutoComplete } from "@wangxiaojinger/qizhi-react";

const App = () => (
  <AutoComplete
    aria-label="区分大小写"
    data={["beijing", "beihai", "baoding"]}
    placeholder="输入“B”"
    strict
  />
);

export default App;
