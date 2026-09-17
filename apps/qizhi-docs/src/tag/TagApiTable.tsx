import { ApiTable } from "../api/ApiTable";

export function TagApiTable() {
  return <section id="tag-API" className="qizhi-api-section"><h2 className="qz-demo-title"><a tabIndex={-1} href="#tag-API">API</a></h2><h3>Tag</h3><p className="qizhi-api-section__note">只列出 QIZHI Tag v1 已实现且属于本组件的能力。</p><ApiTable api="tagApi" label="Tag API" /></section>;
}
