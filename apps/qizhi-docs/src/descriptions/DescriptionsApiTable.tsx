import { ApiTable } from "../api/ApiTable";

export function DescriptionsApiTable() {
  return (
    <section id="descriptions-API" className="qizhi-api-section">
      <h2 className="qz-demo-title"><a tabIndex={-1} href="#descriptions-API">API</a></h2>
      <h3>Descriptions</h3>
      <p className="qizhi-api-section__note">只列出 QIZHI Descriptions v1 已实现且属于本组件的能力。</p>
      <ApiTable api="descriptionsApi" label="Descriptions API" />
      <h3>Descriptions.Item</h3>
      <ApiTable api="descriptionsItemApi" label="Descriptions.Item API" />
    </section>
  );
}
