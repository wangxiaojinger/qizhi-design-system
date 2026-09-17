import { AddIcon, Button, Space } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <Space size="large">
      <Button type="primary">方形按钮</Button>
      <Button type="primary" icon={<AddIcon />} aria-label="添加" />
    </Space>
  );
};

export default App;
