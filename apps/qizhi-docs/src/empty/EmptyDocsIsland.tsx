import { useEffect } from "react";
import { EmptyApiTable } from "./EmptyApiTable";
import { EmptyDemoCodebox } from "./EmptyDemoCodebox";
import { emptyDemos } from "./emptyDocs.registry";
import "./emptyDocs.css";

export function EmptyDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return (
    <>
      <div className="component-intro"><div className="component-intro-meta">组件 / 数据展示</div><div className="component-intro-head"><div className="component-intro-copy"><h3>空状态 Empty</h3><p>用于无数据、无结果和待创建场景，引导用户下一步操作，减少页面空洞感。</p></div></div></div>
      <div className="component-examples qizhi-components-wrapper">
        {emptyDemos.map((demo) => <EmptyDemoCodebox key={demo.id} demo={demo} />)}
        <EmptyApiTable />
      </div>
    </>
  );
}
