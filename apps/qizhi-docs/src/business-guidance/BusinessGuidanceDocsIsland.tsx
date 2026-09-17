import { useEffect } from "react";
import { BusinessGuidanceDemoCodebox } from "./BusinessGuidanceDemoCodebox";
import { BusinessGuidanceApiTable } from "./BusinessGuidanceApiTable";
import { businessGuidanceDemos } from "./businessGuidanceDocs.registry";
import "./businessGuidanceDocs.css";

export function BusinessGuidanceDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return (
    <>
      <div className="qz-nav-intro">
        <p>业务组件 <span className="separator">/</span>{" "}
          <strong>业务卡片</strong></p>
        <h1 id="业务卡片-引导与流程">引导与流程</h1>
        <p>通过明确的阶段目标和操作入口，帮助用户理解业务路径并完成连续任务。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {businessGuidanceDemos.map((demo) => (
          <BusinessGuidanceDemoCodebox key={demo.id} demo={demo} />
        ))}
      </div>
      <BusinessGuidanceApiTable />
    </>
  );
}
