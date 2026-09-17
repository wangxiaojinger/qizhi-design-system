import { Input } from "@wangxiaojinger/qizhi-react";

export default function StatusDemo() {
  return (
    <div className="input-demo-state-row">
      <Input status="error" placeholder="错误状态" />
      <Input status="warning" placeholder="警告状态" />
      <Input disabled placeholder="禁用输入" />
    </div>
  );
}
