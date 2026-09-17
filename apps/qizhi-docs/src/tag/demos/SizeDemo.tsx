import { Space, Tag } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <Space size="large" className="tag-docs-row">
      <Tag size="small">Small</Tag>
      <Tag>Default</Tag>
      <Tag size="medium">Medium</Tag>
      <Tag size="large">Large</Tag>
    </Space>
  );
};

export default App;
