import { Space, Tag } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <Space size="small" className="tag-docs-row tag-docs-row--wrap">
      <Tag bordered>Default</Tag>
      <Tag bordered color="red">red</Tag>
      <Tag bordered color="orange">orange</Tag>
      <Tag bordered color="green">green</Tag>
      <Tag bordered color="blue">blue</Tag>
      <Tag bordered color="purple">purple</Tag>
      <Tag bordered color="gray">gray</Tag>
    </Space>
  );
};

export default App;
