import { Input } from "@wangxiaojinger/qizhi-react";

export default function TextAreaDemo() {
  return (
    <div className="input-textarea-demo">
      <Input.TextArea placeholder="请输入内容" />
      <Input.TextArea disabled defaultValue="禁用状态" />
    </div>
  );
}
