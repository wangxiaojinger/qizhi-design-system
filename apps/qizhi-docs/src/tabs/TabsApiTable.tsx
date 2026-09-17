import { ApiTable } from "../api/ApiTable";

export function TabsApiTable() {
  return (
    <section id="tabs-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#tabs-API">API</a>
      </h2>
      <p className="qizhi-api-section__note">
        只列出 QIZHI Tabs v1 已实现且属于本组件的能力。
      </p>
      <ApiTable api="tabsApi" label="Tabs API" />
    </section>
  );
}

