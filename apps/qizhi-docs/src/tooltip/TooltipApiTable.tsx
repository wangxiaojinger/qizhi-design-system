import { ApiTable } from "../api/ApiTable";

export function TooltipApiTable() {
  return (
    <section id="tooltip-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#tooltip-API">API</a>
      </h2>
      <h3>Tooltip</h3>
      <p className="qizhi-api-section__note">
        默认通过 hover 和 focus 显示；内容为 null、undefined
        或空字符串时不显示气泡。
      </p>
      <ApiTable api="tooltipApi" label="Tooltip API" />
    </section>
  );
}
