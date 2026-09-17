import { Alert } from "@wangxiaojinger/qizhi-react";

export default function SizeDemo() {
  return <div className="alert-demo-stack alert-size-demo-stack">
    <Alert size="small" content="Small · 28px" />
    <Alert size="default" content="Default · 32px" />
    <Alert size="large" content="Large · 40px" />
  </div>;
}
