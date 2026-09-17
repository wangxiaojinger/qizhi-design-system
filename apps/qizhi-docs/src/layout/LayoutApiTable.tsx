import { ApiTable } from "../api/ApiTable";

export function LayoutApiTable() {
  return (
    <section id="layout-API" className="qizhi-api-section">
      <h2 className="qz-demo-title"><a tabIndex={-1} href="#layout-API">API</a></h2>
      <h3>Layout / Layout.Header / Layout.Content / Layout.Sider / Layout.Footer</h3>
      <p className="qizhi-api-section__note">五个布局组件均透传对应原生元素属性。</p>
      <ApiTable api="layoutApi" label="Layout API" />
      <h3>PlatformShell</h3>
      <ApiTable api="platformShellApi" label="PlatformShell API" />
      <h3>LocaleProvider</h3>
      <ApiTable api="localeProviderApi" label="LocaleProvider API" />
    </section>
  );
}
