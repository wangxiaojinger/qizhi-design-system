import { ApiTable } from "../api/ApiTable";

export function ModalApiTable() {
  return <section id="对话框-api" className="qizhi-api-section">
    <h2 className="qz-demo-title"><a tabIndex={-1} href="#对话框-api">API</a></h2>
    <h3>Modal</h3>
    <ApiTable api="modalApi" label="Modal API" />
    <h3>Modal.confirm</h3>
    <ApiTable api="modalConfirmApi" label="Modal.confirm API" />
    <h3>Modal.useModal</h3>
    <p><code>Modal.useModal()</code> 返回 <code>[modal, contextHolder]</code>；将 contextHolder 放在需要继承的 React Context 内，再通过 modal.confirm 创建确认框。</p>
  </section>;
}
