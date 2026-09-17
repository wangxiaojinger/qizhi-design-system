import { ApiTable } from "../api/ApiTable";

export function TooltipApiTable() {
  return (
    <section id="tooltip-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#tooltip-API">API</a>
      </h2>
      <h3>Tooltip</h3>
      <p className="qizhi-api-section__note">
        只列出 QIZHI Tooltip v1 已实现且属于本组件的能力。
      </p>
      <ApiTable api="tooltipApi" label="Tooltip API" />
    </section>
  );
}
