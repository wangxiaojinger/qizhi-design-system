import { ApiTable } from "../api/ApiTable";

export function CheckboxApiTable() {
  return (
    <section id="checkbox-API" className="qizhi-api-section">
      <h2 className="qz-demo-title"><a tabIndex={-1} href="#checkbox-API">API</a></h2>
      <p className="qizhi-api-section__note">只列出 QIZHI Checkbox v1 已实现且属于本组件的能力。</p>

      <h3>Checkbox</h3>
      <ApiTable api="checkboxApi" label="Checkbox API" />

      <h3>Checkbox.Group</h3>
      <ApiTable api="checkboxGroupApi" label="Checkbox.Group API" />

      <h3>类型定义</h3>
      <div className="checkbox-type-definitions" aria-label="Checkbox 类型定义">
        <pre><code>{"type CheckboxValue = string | number;"}</code></pre>
        <pre><code>{`interface CheckboxOption {
  label: ReactNode;
  value: CheckboxValue;
  disabled?: boolean;
}`}</code></pre>
      </div>
      <p className="qizhi-api-section__note">
        <code>CheckboxOption</code> 不包含 <code>icon</code>；QIZHI Checkbox v1 不提供 <code>error</code>、<code>icon</code> 或 <code>useCheckbox</code>。
      </p>
    </section>
  );
}
