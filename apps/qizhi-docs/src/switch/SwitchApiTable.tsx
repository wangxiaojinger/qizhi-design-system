import { ApiTable } from "../api/ApiTable";

export function SwitchApiTable() {
  return <section id="switch-API" className="qizhi-api-section"><h2 className="qz-demo-title"><a tabIndex={-1} href="#switch-API">API</a></h2><p className="qizhi-api-section__note">只列出 QIZHI Switch v1 已实现且属于本组件的能力。</p><ApiTable api="switchApi" label="Switch API" /></section>;
}
