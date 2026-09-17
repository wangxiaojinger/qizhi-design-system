import { ApiTable } from "../api/ApiTable";

export function InputTagApiTable() {
  return (
    <section id="input-tag-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#input-tag-API">API</a>
      </h2>
      <h3>InputTag</h3>
      <p className="qizhi-api-section__note">只列出 QIZHI InputTag v1 已实现能力。</p>
      <ApiTable api="inputTagApi" label="InputTag API" />
    </section>
  );
}
