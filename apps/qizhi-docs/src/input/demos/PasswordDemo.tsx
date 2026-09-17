import { Input } from "@wangxiaojinger/qizhi-react";

export default function PasswordDemo() {
  return (
    <div className="input-password-demo">
      <Input.Password defaultValue="示例密码" />
      <Input.Password defaultValue="示例密码" defaultVisibility />
    </div>
  );
}
