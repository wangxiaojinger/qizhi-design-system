import { ApiTable } from "../api/ApiTable";

export function DrawerApiTable() {
  return (
    <section id="drawer-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#drawer-API">API</a>
      </h2>
      <h3>Drawer</h3>
      <ApiTable api="drawerApi" label="Drawer API" />
    </section>
  );
}
