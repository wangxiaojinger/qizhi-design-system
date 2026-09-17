import { Alert } from "@wangxiaojinger/qizhi-react";

export default function TypesDemo() {
  return <div className="alert-demo-grid">
    <Alert type="info" content="Here is an info text" />
    <Alert type="success" content="Here is a success text" />
    <Alert type="warning" content="Here is a warning text" />
    <Alert type="error" content="Here is an error text" />
  </div>;
}
