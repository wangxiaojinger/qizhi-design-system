import { Button, Space } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <Space size="large">
      <Button type="primary" size="mini">迷你</Button>
      <Button type="primary" size="small">小</Button>
      <Button type="primary">中</Button>
      <Button type="primary" size="large">大</Button>
    </Space>
  );
};

export default App;
