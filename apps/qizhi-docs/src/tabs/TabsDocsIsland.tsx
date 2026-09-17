import { useEffect } from "react";
import { TabsApiTable } from "./TabsApiTable";
import { TabsDemoCodebox } from "./TabsDemoCodebox";
import { tabsDemos } from "./tabsDocs.registry";
import "./tabsDocs.css";

export function TabsDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return (
    <>
      <div className="qz-nav-intro">
        <p>组件 <span className="separator">/</span>{" "}
          <strong>数据展示</strong>
        </p>
        <h1 id="标签页-tabs">标签页 Tabs</h1>
        <p>用于平级内容切换，适合详情页分区和内容聚合展示。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {tabsDemos.map((demo) => (
          <TabsDemoCodebox key={demo.id} demo={demo} />
        ))}
        <TabsApiTable />
      </div>
    </>
  );
}

