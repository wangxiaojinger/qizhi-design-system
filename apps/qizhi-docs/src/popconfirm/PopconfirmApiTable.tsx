import { ApiTable } from "../api/ApiTable";

export function PopconfirmApiTable() {
  return (
    <section id="popconfirm-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#popconfirm-API">API</a>
      </h2>
      <h3>Popconfirm</h3>
      <p className="qizhi-api-section__note">
        只列出 QIZHI Popconfirm v1 已实现且属于本组件的能力。
      </p>
      <ApiTable api="popconfirmApi" label="Popconfirm API" />
    </section>
  );
}
