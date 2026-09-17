import { ApiTable } from "../api/ApiTable";

export function AutoCompleteApiTable() {
  return <section id="auto-complete-API" className="qizhi-api-section"><h2 className="qz-demo-title"><a tabIndex={-1} href="#auto-complete-API">API</a></h2><p className="qizhi-api-section__note">只列出 QIZHI AutoComplete v1 已实现且属于本组件的能力。</p><ApiTable api="autoCompleteApi" label="AutoComplete API" /></section>;
}
