import { ApiTable } from "../api/ApiTable";

export function DetailHeaderApiTable() {
  return (
    <section id="business-detail-header-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#business-detail-header-API">API</a>
      </h2>
      <p className="qizhi-api-section__note">
        只列出详情头部公共组件已实现的业务能力。
      </p>
      <h3>DetailHeader</h3>
      <ApiTable api="detailHeaderApi" label="DetailHeader API" />
      <h3>ServiceDetailHeader</h3>
      <ApiTable
        api="serviceDetailHeaderApi"
        label="ServiceDetailHeader API"
      />
    </section>
  );
}
