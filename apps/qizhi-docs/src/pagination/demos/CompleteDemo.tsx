import { Pagination } from "@wangxiaojinger/qizhi-react";

export default function CompleteDemo() {
  return <div className="pagination-demo-stack"><Pagination total={200} showTotal showPageSize showJumper aria-label="全部配置分页" /><Pagination total={200} showTotal showPageSize showJumper disabled aria-label="禁用的全部配置分页" /></div>;
}
