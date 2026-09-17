import { ApiTable } from "../api/ApiTable";

export function BreadcrumbApiTable() {
  return (
    <section id="breadcrumb-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#breadcrumb-API">API</a>
      </h2>
      <p className="qizhi-api-section__note">
        只列出 QIZHI Breadcrumb v1 已实现且属于本组件的能力。
      </p>
      <h3>Breadcrumb</h3>
      <ApiTable api="breadcrumbApi" label="Breadcrumb API" />
      <h3>Breadcrumb.Item</h3>
      <ApiTable api="breadcrumbItemApi" label="Breadcrumb.Item API" />
    </section>
  );
}
