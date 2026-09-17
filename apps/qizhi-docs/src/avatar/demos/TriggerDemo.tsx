import { useState } from "react";
import { Avatar, CameraIcon, EditIcon, Space } from "@wangxiaojinger/qizhi-react";

const App = () => {
  const [message, setMessage] = useState("");
  return (
    <div className="avatar-docs-trigger-layout">
      <Space size="large" className="avatar-docs-row avatar-docs-trigger-row">
        <Avatar triggerIcon={<CameraIcon />} triggerType="mask" triggerAriaLabel="拍摄头像" onTriggerClick={() => setMessage("已触发拍摄头像操作")}>A</Avatar>
        <Avatar triggerIcon={<EditIcon />} triggerType="button" triggerAriaLabel="编辑头像" onTriggerClick={() => setMessage("已触发编辑头像操作")}>B</Avatar>
      </Space>
      <span className="avatar-docs-trigger-status" role="status">{message}</span>
    </div>
  );
};

export default App;
