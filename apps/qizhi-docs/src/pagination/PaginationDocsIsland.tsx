import { useEffect } from "react";
import { PaginationApiTable } from "./PaginationApiTable";
import { PaginationDemoCodebox } from "./PaginationDemoCodebox";
import { paginationDemos } from "./paginationDocs.registry";
import "./paginationDocs.css";

export function PaginationDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <><div className="component-intro"><div className="component-intro-meta">组件 / 导航</div><div className="component-intro-head"><div className="component-intro-copy"><h3>分页 Pagination</h3><p>采用分页控制单页内的信息数量，也可进行页面跳转。</p></div></div></div><div className="component-examples qizhi-components-wrapper">{paginationDemos.map((demo) => <PaginationDemoCodebox key={demo.id} demo={demo} />)}<PaginationApiTable /></div></>;
}
