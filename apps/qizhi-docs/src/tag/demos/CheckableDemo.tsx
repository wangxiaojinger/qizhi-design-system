import { Space, Tag } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <Space size="large" className="tag-docs-checkable">
      <Tag checkable size="large">Awesome</Tag>
      <Tag checkable size="large" color="red" defaultChecked>Toutiao</Tag>
      <Tag checkable size="large" color="blue" defaultChecked>Lark</Tag>
    </Space>
  );
};

export default App;
