import { Button, Space } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <Space size="large" wrap className="button-icon-demo-row">
      <Button type="primary" icon={<i className="ri-add-line" aria-hidden="true" />} aria-label="添加" />
      <Button type="primary" icon={<i className="ri-delete-bin-line" aria-hidden="true" />}>删除</Button>
      <Button icon={<i className="ri-add-line" aria-hidden="true" />}>添加</Button>
      <Button type="dashed" icon={<i className="ri-add-line" aria-hidden="true" />}>添加</Button>
      <Button type="text" icon={<i className="ri-add-line" aria-hidden="true" />}>添加</Button>
    </Space>
  );
};

export default App;
