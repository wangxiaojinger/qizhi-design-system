import { Button, Space } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <Space size="large">
      <Button type="primary">主要按钮</Button>
      <Button>次要按钮</Button>
      <Button type="dashed">虚线按钮</Button>
      <Button type="text">文本按钮</Button>
    </Space>
  );
};

export default App;
