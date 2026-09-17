import { Button, Space } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <Space size="large">
      <Button type="primary" disabled>主要按钮</Button>
      <Button disabled>次要按钮</Button>
      <Button type="dashed" disabled>虚线按钮</Button>
      <Button type="text" disabled>文本按钮</Button>
    </Space>
  );
};

export default App;
