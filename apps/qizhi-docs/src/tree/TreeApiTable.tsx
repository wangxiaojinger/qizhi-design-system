import { ApiTable } from "../api/ApiTable";

export function TreeApiTable() {
  return (
    <section id="tree-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#tree-API">
          API
        </a>
      </h2>
      <p className="qizhi-api-section__note">
        只列出 QIZHI Tree v1 已实现且属于本组件的能力。
      </p>
      <ApiTable api="treeApi" label="Tree API" />
    </section>
  );
}
