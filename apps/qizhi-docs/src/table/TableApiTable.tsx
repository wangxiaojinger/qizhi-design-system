import { ApiTable } from "../api/ApiTable";
import componentApi from "../api/component-api.json";

export function TableApiTable() {
  return <section id="table-API" className="qizhi-api-section"><h2 className="qz-demo-title"><a tabIndex={-1} href="#table-API">API</a></h2><h3>Table</h3><p className="qizhi-api-section__note">只列出 QIZHI Table v1 已实现且属于本组件的能力。</p><h4>默认行为说明</h4>{componentApi.apis.tableApi.defaultBehaviors.map((behavior) => <p key={behavior} className="qizhi-api-section__note">{behavior}</p>)}<ApiTable api="tableApi" label="Table API" /></section>;
}
