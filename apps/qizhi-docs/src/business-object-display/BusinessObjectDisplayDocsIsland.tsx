import { useEffect } from "react";
import { BusinessObjectApiTable } from "./BusinessObjectApiTable";
import { BusinessObjectDemoCodebox } from "./BusinessObjectDemoCodebox";
import { businessObjectDemos } from "./businessObjectDisplay.registry";
import "./businessObjectDisplay.css";

export function BusinessObjectDisplayDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return (
    <>
      <div className="qz-nav-intro">
        <p>业务组件 <span className="separator">/</span>{" "}
          <strong>业务卡片</strong></p>
        <h1 id="业务卡片-对象展示">对象展示</h1>
        <p>用于展示可查看、进入或操作的任务、AI 资产、项目与资源对象。详细规范与示例将在后续逐步补充。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {businessObjectDemos.map((demo) => (
          <BusinessObjectDemoCodebox key={demo.id} demo={demo} />
        ))}
        <BusinessObjectApiTable />
      </div>
    </>
  );
}
