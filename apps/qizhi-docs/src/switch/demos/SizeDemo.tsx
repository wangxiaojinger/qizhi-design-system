import { Space, Switch } from "@wangxiaojinger/qizhi-react";

const App = () => (
  <Space size="large" className="switch-docs-row">
    <Switch aria-label="默认尺寸开关" />
    <Switch aria-label="小号尺寸开关" size="small" />
  </Space>
);

export default App;
