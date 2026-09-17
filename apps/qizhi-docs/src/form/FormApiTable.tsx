import { ApiTable } from "../api/ApiTable";

export function FormApiTable() {
  return (
    <section id="form-API" className="qizhi-api-section">
      <h2 className="qz-demo-title"><a tabIndex={-1} href="#form-API">API</a></h2>
      <p className="qizhi-api-section__note">只列出 QIZHI Form v1 已实现且属于本组件的能力。</p>
      <h3>Form</h3>
      <ApiTable api="formApi" label="Form API" />
      <h3>Form.Item</h3>
      <ApiTable api="formItemApi" label="Form.Item API" />
    </section>
  );
}

