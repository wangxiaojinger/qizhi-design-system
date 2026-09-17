import { Avatar, Space, UserIcon } from "@wangxiaojinger/qizhi-react";
import qizhiLogo from "../../../../../assets/qizhi-logo.svg";

const App = () => {
  return (
    <Space size="large" className="avatar-docs-row">
      <Avatar>A</Avatar>
      <Avatar className="avatar-docs-blue"><UserIcon /></Avatar>
      <Avatar className="avatar-docs-brand">QIZHI</Avatar>
      <Avatar className="avatar-docs-cyan">Design</Avatar>
      <Avatar className="avatar-docs-image"><img src={qizhiLogo} alt="QIZHI 标志" /></Avatar>
    </Space>
  );
};

export default App;
