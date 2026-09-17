import { useEffect } from "react";
import { BusinessOverviewDemoCodebox } from
  "./BusinessOverviewDemoCodebox";
import { BusinessOverviewApiTable } from "./BusinessOverviewApiTable";
import { businessOverviewDemos } from "./businessOverviewDocs.registry";
import "./businessOverviewDocs.css";

export function BusinessOverviewDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return (
    <>
      <div className="qz-nav-intro">
        <p>业务组件 <span className="separator">/</span>{" "}
          <strong>业务卡片</strong></p>
        <h1 id="业务卡片-概览与指标">概览与指标</h1>
        <p>用于汇总业务数量、资源用量、状态与异常指标。根据数据是否存在上限、是否需要表达风险以及是否隶属于某个对象，选择对应卡片。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {businessOverviewDemos.map((demo) => (
          <BusinessOverviewDemoCodebox key={demo.id} demo={demo} />
        ))}
        <BusinessOverviewApiTable />
      </div>
    </>
  );
}
