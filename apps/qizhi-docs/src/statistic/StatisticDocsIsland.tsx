import { useEffect } from "react";
import { StatisticApiTable } from "./StatisticApiTable";
import { StatisticDemoCodebox } from "./StatisticDemoCodebox";
import { statisticDemos } from "./statisticDocs.registry";
import "./statisticDocs.css";

export function StatisticDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  return (
    <>
      <div className="qz-nav-intro">
        <p>
          组件 <span className="separator">/</span>{" "}
          <strong>数据展示</strong>
        </p>
        <h1 id="数值显示-statistic">数值显示 Statistic</h1>
        <p>突出展示某个或某组数字、带描述的统计类数据。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {statisticDemos.map((demo) => (
          <StatisticDemoCodebox key={demo.id} demo={demo} />
        ))}
        <StatisticApiTable />
      </div>
    </>
  );
}
