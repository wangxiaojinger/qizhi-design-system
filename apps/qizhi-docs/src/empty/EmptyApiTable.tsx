import { ApiTable } from "../api/ApiTable";

export function EmptyApiTable() {
  return (
    <section id="empty-API" className="qizhi-api-section">
      <h2 className="qz-demo-title"><a tabIndex={-1} href="#empty-API">API</a></h2>
      <h3>Empty</h3>
      <p className="qizhi-api-section__note">只列出 QIZHI Empty v1 已实现且属于本组件的能力。</p>
      <ApiTable api="emptyApi" label="Empty API" />
    </section>
  );
}
