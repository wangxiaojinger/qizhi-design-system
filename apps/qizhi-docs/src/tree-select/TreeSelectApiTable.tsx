import { ApiTable } from "../api/ApiTable";

export function TreeSelectApiTable() {
  return (
    <section id="tree-select-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#tree-select-API">API</a>
      </h2>
      <p className="qizhi-api-section__note">
        只列出 QIZHI TreeSelect v1 已实现且属于本组件的能力。
      </p>
      <ApiTable api="treeSelectApi" label="TreeSelect API" />
    </section>
  );
}
