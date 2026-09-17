import { Alert } from "@wangxiaojinger/qizhi-react";

export default function TitleDemo() {
  return <div className="alert-demo-grid">
    <div className="alert-demo-stack">
      <Alert type="info" title="Info" content="Here is an info text" />
      <Alert type="warning" title="Warning" content="Here is a warning text" />
    </div>
    <div className="alert-demo-stack">
      <Alert type="success" title="Success" content="Here is a success text" />
      <Alert type="error" title="Error" content="Here is an error text" />
    </div>
  </div>;
}
