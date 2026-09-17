import { Radio } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <div className="radio-docs-row">
      <Radio name="radio-basic" value="radio">单选框</Radio>
      <Radio name="radio-basic-disabled" value="disabled" defaultChecked disabled>禁用单选框</Radio>
    </div>
  );
};

export default App;
