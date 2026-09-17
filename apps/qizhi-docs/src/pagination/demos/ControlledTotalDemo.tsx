import { useState } from "react";
import { Pagination } from "@wangxiaojinger/qizhi-react";

export default function ControlledTotalDemo() {
  const [total, setTotal] = useState(20);
  const [current, setCurrent] = useState(1);
  return <Pagination total={total} current={current} showTotal={(value) => `当前共 ${value} 条`} aria-label="受控数据总数分页" onChange={(next, pageSize) => { setCurrent(next); if (next * pageSize >= total) setTotal(total + pageSize); }} />;
}
