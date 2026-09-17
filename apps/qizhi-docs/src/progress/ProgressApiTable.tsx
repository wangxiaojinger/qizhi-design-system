import { ApiTable } from "../api/ApiTable";

export function ProgressApiTable() {
  return <section id="progress-API" className="qizhi-api-section"><h2 className="qz-demo-title"><a tabIndex={-1} href="#progress-API">API</a></h2><p className="qizhi-api-section__note">只列出 QIZHI Progress v1 已实现能力。</p><ApiTable api="progressApi" label="Progress API" /></section>;
}
