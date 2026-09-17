import { ApiTable } from "../api/ApiTable";

export function PaginationApiTable() {
  return <section id="pagination-API" className="qizhi-api-section"><h2 className="qz-demo-title"><a tabIndex={-1} href="#pagination-API">API</a></h2><h3>Pagination</h3><p className="qizhi-api-section__note">只列出 QIZHI Pagination v1 已实现且属于本组件的能力。</p><ApiTable api="paginationApi" label="Pagination API" /></section>;
}
