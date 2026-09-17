import { Space, Switch } from "@wangxiaojinger/qizhi-react";

const App = () => (
  <Space size="large" className="switch-docs-row">
    <Switch aria-label="基础开关" />
    <Switch aria-label="禁用未选中开关" disabled />
    <Switch aria-label="禁用已选中开关" defaultChecked disabled />
  </Space>
);

export default App;
