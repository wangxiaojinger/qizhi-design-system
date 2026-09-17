import { ApiTable } from "../api/ApiTable";

export function PageHeaderApiTable() {
  return (
    <section id="page-header-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#page-header-API">API</a>
      </h2>
      <h3>PageHeader</h3>
      <ApiTable api="pageHeaderApi" label="PageHeader API" />
    </section>
  );
}
