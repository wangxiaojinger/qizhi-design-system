import { Alert } from "@wangxiaojinger/qizhi-react";

export default function ClosableDemo() {
  return <div className="alert-demo-grid">
    <div className="alert-demo-stack">
      <Alert type="info" content="Here is an info text" closable />
      <Alert type="warning" title="Warning" content="Here is a warning text" closable />
    </div>
    <div className="alert-demo-stack">
      <Alert type="success" content="Here is a success text" closable />
      <Alert type="error" title="Error" content="Here is an error text" closable />
    </div>
  </div>;
}
