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
      <h3>Form.ErrorList</h3>
      <ApiTable api="formErrorListApi" label="Form.ErrorList API" />
      <h3>Form.useSteps</h3>
      <ApiTable api="formStepsApi" label="Form.useSteps API" />
      <h3>Form.useDraft</h3>
      <ApiTable api="formDraftApi" label="Form.useDraft API" />
      <h3>Form.useBulkEdit</h3>
      <ApiTable api="formBulkEditApi" label="Form.useBulkEdit API" />
      <h3>FormInstance</h3>
      <ApiTable api="formInstanceApi" label="FormInstance API" />
    </section>
  );
}
