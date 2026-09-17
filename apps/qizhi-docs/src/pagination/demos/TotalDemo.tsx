import { Pagination } from "@wangxiaojinger/qizhi-react";

export default function TotalDemo() {
  return <div className="pagination-demo-stack"><Pagination total={50} showTotal aria-label="展示固定总数的分页" /><Pagination total={200} showTotal={(total, range) => `${range[0]}–${range[1]} / ${total} 条`} aria-label="展示当前区间的分页" /></div>;
}
