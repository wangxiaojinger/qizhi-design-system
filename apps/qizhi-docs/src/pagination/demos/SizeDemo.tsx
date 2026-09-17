import { useState } from "react";
import { Pagination } from "@wangxiaojinger/qizhi-react";
import type { PaginationSize } from "@wangxiaojinger/qizhi-react";

const sizes: Array<[PaginationSize, string]> = [["large", "大"], ["default", "默认"], ["small", "小"], ["mini", "迷你"]];

export default function SizeDemo() {
  const [size, setSize] = useState<PaginationSize>("default");
  return <div className="pagination-size-demo"><div className="qizhi-segmented table-demo-radio-group" role="radiogroup" aria-label="分页器尺寸">{sizes.map(([value, label]) => <button key={value} className={`qizhi-segmented-item table-demo-radio${size === value ? " is-active" : ""}`} type="button" role="radio" aria-checked={size === value} onClick={() => setSize(value)}>{label}</button>)}</div><Pagination total={50} size={size} showTotal showPageSize showJumper aria-label="可调整尺寸的分页" /></div>;
}
