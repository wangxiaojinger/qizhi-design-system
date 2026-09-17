import { Avatar, Space } from "@wangxiaojinger/qizhi-react";

const sizes = ["large", "default", "small", "mini"] as const;

const App = () => {
  return (
    <div className="avatar-docs-stack">
      <Space size="large" className="avatar-docs-row">
        {sizes.map((size) => <Avatar key={size} size={size}>QIZHI</Avatar>)}
      </Space>
      <Space size="large" className="avatar-docs-row">
        {sizes.map((size) => <Avatar key={size} size={size} shape="square">QIZHI</Avatar>)}
      </Space>
    </div>
  );
};

export default App;
