import { ApiTable } from "../api/ApiTable";

export function InputNumberApiTable() {
  return (
    <section id="input-number-API" className="qizhi-api-section">
      <h2 className="qz-demo-title"><a tabIndex={-1} href="#input-number-API">API</a></h2>
      <h3>InputNumber</h3>
      <ApiTable api="inputNumberApi" label="InputNumber API" />
    </section>
  );
}
