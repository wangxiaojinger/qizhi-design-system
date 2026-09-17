import { ApiTable } from "../api/ApiTable";

export function RadioApiTable() {
  return <section id="radio-API" className="qizhi-api-section"><h2 className="qz-demo-title"><a tabIndex={-1} href="#radio-API">API</a></h2><p className="qizhi-api-section__note">只列出 QIZHI Radio v1 已实现且属于本组件的能力。</p><h3>Radio</h3><ApiTable api="radioApi" label="Radio API" /><h3>Radio.Group</h3><ApiTable api="radioGroupApi" label="Radio.Group API" /></section>;
}
