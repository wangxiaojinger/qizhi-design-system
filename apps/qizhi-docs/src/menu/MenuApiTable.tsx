import { ApiTable } from "../api/ApiTable";

export function MenuApiTable() {
  return (
    <section id="menu-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#menu-API">API</a>
      </h2>
      <p className="qizhi-api-section__note">
        分别列出 QIZHI Menu v1 与顶部、侧边导航业务组件的已实现能力。
      </p>
      <ApiTable api="menuApi" label="Menu API" />
      <h3>TopNavigation</h3>
      <ApiTable api="topNavigationApi" label="TopNavigation API" />
      <h3>SideNavigation</h3>
      <ApiTable api="sideNavigationApi" label="SideNavigation API" />
    </section>
  );
}
