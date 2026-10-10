import { ApiTable } from "../api/ApiTable";

export function FilterSelectApiTable() {
  return (
    <section id="filter-select-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#filter-select-API">API</a>
      </h2>
      <h3>FilterSelect</h3>
      <p className="qizhi-api-section__note">
        单选与多选通过 mode 形成联合类型，其余选择能力复用 Select。
      </p>
      <ApiTable api="filterSelectApi" label="FilterSelect API" />
    </section>
  );
}
