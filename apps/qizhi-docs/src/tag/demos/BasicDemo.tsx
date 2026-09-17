import { CheckCircleIcon, Space, Tag } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <Space size="large" className="tag-docs-row">
      <Tag>Default</Tag>
      <Tag>Tag 1</Tag>
      <Tag>Tag 2</Tag>
      <Tag icon={<CheckCircleIcon />}>Complete</Tag>
    </Space>
  );
};

export default App;
