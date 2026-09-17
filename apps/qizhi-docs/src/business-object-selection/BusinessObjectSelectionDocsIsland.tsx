import { useEffect } from "react";
import { BusinessObjectSelectionApiTable } from "./BusinessObjectSelectionApiTable";
import { BusinessObjectSelectionDemoCodebox } from "./BusinessObjectSelectionDemoCodebox";
import { businessObjectSelectionDemos } from "./businessObjectSelection.registry";
import "./businessObjectSelectionDocs.css";

export function BusinessObjectSelectionDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return (
    <>
      <div className="qz-nav-intro">
        <p>业务组件 <span className="separator">/</span> <strong>业务卡片</strong></p>
        <h1 id="业务卡片-对象选择">对象选择</h1>
        <p>用于在候选业务对象、资源或版本中完成选择。详细规范与示例将在后续补充。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {businessObjectSelectionDemos.map((demo) => (
          <BusinessObjectSelectionDemoCodebox key={demo.id} demo={demo} />
        ))}
        <BusinessObjectSelectionApiTable />
      </div>
    </>
  );
}
