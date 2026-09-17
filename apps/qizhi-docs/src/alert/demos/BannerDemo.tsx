import { Alert } from "@wangxiaojinger/qizhi-react";

export default function BannerDemo() {
  return <div className="alert-demo-browser">
    <div className="alert-demo-browser-header" aria-hidden="true">
      <span /><span /><span />
    </div>
    <div className="alert-demo-browser-content">
      <Alert banner content="General text" />
      <Alert banner content="General text" closable />
      <Alert banner title="General text" content="Here is an example text" />
      <Alert banner type="success" title="Success text" content={null} />
    </div>
  </div>;
}
