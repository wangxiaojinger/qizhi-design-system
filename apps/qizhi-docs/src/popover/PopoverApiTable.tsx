import { ApiTable } from "../api/ApiTable";

export function PopoverApiTable() {
  return <section id="popover-API" className="qizhi-api-section"><h2 className="qz-demo-title"><a tabIndex={-1} href="#popover-API">API</a></h2><h3>Popover</h3><p className="qizhi-api-section__note">只列出 QIZHI Popover v1 已实现且属于本组件的能力。</p><ApiTable api="popoverApi" label="Popover API" /></section>;
}
