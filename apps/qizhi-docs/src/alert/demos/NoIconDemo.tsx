import { Alert } from "@wangxiaojinger/qizhi-react";

export default function NoIconDemo() {
  return <div className="alert-demo-grid">
    <div className="alert-demo-stack">
      <Alert type="info" content="Here is an info text" showIcon={false} />
      <Alert type="warning" title="Warning" content="Here is a warning text" showIcon={false} />
    </div>
    <div className="alert-demo-stack">
      <Alert type="success" content="Here is a success text" showIcon={false} />
      <Alert type="error" title="Error" content="Here is an error text" showIcon={false} />
    </div>
  </div>;
}
