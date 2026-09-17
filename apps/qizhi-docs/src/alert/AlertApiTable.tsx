import { ApiTable } from "../api/ApiTable";

export function AlertApiTable() {
  return <section id="警告提示-api" className="qizhi-api-section">
    <h2 className="qz-demo-title"><a tabIndex={-1} href="#警告提示-api">API</a></h2>
    <h3>Alert</h3>
    <ApiTable api="alertApi" label="Alert API" />
  </section>;
}
