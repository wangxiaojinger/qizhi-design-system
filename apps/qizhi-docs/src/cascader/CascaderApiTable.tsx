import { ApiTable } from "../api/ApiTable";

export function CascaderApiTable() {
  return (
    <section id="cascader-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#cascader-API">API</a>
      </h2>
      <h3>Cascader</h3>
      <p className="qizhi-api-section__note">
        单选与多选通过 mode 形成联合类型；表中同时列出两种模式的公共能力。
      </p>
      <ApiTable api="cascaderApi" label="Cascader API" />
    </section>
  );
}
