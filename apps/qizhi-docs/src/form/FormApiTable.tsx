import { ApiTable } from "../api/ApiTable";

export function FormApiTable() {
  return (
    <section id="form-API" className="qizhi-api-section">
      <h2 className="qz-demo-title"><a tabIndex={-1} href="#form-API">API</a></h2>
      <p className="qizhi-api-section__note">列出 QIZHI Form 已实现的数据收集、异步校验、异常分流、未保存修改、嵌套字段和动态列表能力。</p>
      <h3>Form</h3>
      <ApiTable api="formApi" label="Form API" />
      <h3>Form.Item</h3>
      <ApiTable api="formItemApi" label="Form.Item API" />
      <h3>Form.List</h3>
      <ApiTable api="formListApi" label="Form.List API" />
      <h3>Form.useBulkEdit</h3>
      <ApiTable api="formBulkEditApi" label="Form.useBulkEdit API" />
      <h3>FormInstance</h3>
      <ApiTable api="formInstanceApi" label="FormInstance API" />
    </section>
  );
}
