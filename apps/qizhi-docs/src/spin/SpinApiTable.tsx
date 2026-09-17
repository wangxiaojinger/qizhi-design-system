import { ApiTable } from "../api/ApiTable";

export function SpinApiTable() {
  return (
    <section id="spin-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#spin-API">API</a>
      </h2>
      <p className="qizhi-api-section__note">
        只列出 QIZHI Spin v1 已实现且属于本组件的能力。
      </p>
      <ApiTable api="spinApi" label="Spin API" />
    </section>
  );
}
