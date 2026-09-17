import { Alert } from "@wangxiaojinger/qizhi-react";

export default function InlineDemo() {
  return <div className="alert-demo-grid">
    <Alert type="neutral" size="small" inline
      content="配额剩余不足20%，如果继续使用，请及时进行资源变更" />
    <Alert type="warning" size="small" inline
      content="配额剩余不足15%，如果继续使用，请及时进行资源变更" />
    <Alert type="error" size="small" inline
      content="配额剩余不足10%，如果继续使用，请及时进行资源变更" />
  </div>;
}
