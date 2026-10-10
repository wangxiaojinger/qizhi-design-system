import { useEffect } from "react";
import { FilterSelectApiTable } from "./FilterSelectApiTable";
import { FilterSelectDemoCodebox } from "./FilterSelectDemoCodebox";
import { filterSelectDemos } from "./filterSelectDocs.registry";
import "./filterSelectDocs.css";

export function FilterSelectDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return (
    <>
      <div className="qz-nav-intro">
        <p>
          组件 <span className="separator">/</span> 数据输入
          <span className="separator">/</span> <strong>选择器</strong>
        </p>
        <h1 id="筛选选择器-filterselect">筛选选择器 FilterSelect</h1>
        <p>
          用于列表、表格和管理后台筛选区，统一展示筛选名称与当前结果。
        </p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {filterSelectDemos.map((demo) => (
          <FilterSelectDemoCodebox key={demo.id} demo={demo} />
        ))}
        <FilterSelectApiTable />
      </div>
    </>
  );
}
