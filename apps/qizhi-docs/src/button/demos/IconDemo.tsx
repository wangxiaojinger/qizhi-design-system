import { AddIcon, Button, DeleteIcon, Space } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <Space size="large" className="button-icon-demo-row">
      <Button type="primary" icon={<AddIcon />} aria-label="添加" />
      <Button type="primary" icon={<DeleteIcon />}>删除</Button>
      <Button icon={<AddIcon />}>添加</Button>
      <Button type="dashed" icon={<AddIcon />}>添加</Button>
      <Button type="text" icon={<AddIcon />}>添加</Button>
    </Space>
  );
};

export default App;
