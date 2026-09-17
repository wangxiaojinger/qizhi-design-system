import { Checkbox } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <div className="checkbox-docs-row">
      <Checkbox>复选框</Checkbox>
      <Checkbox defaultChecked>已选中</Checkbox>
      <Checkbox disabled>禁用</Checkbox>
      <Checkbox defaultChecked disabled>
        禁用已选中
      </Checkbox>
    </div>
  );
};

export default App;
