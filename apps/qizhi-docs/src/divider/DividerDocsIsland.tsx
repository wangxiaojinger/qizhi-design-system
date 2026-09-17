import { useEffect } from "react";
import { DividerApiTable } from "./DividerApiTable";
import { DividerDemoCodebox } from "./DividerDemoCodebox";
import { dividerDemos } from "./dividerDocs.registry";
import "./dividerDocs.css";

export function DividerDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <><div className="component-intro"><div className="component-intro-meta">组件 / 布局</div><div className="component-intro-head"><div className="component-intro-copy"><h3>分割线 Divider</h3><p>划分内容区域，对模块做分隔。</p></div></div></div><div className="component-examples qizhi-components-wrapper">{dividerDemos.map((demo) => <DividerDemoCodebox key={demo.id} demo={demo} />)}<DividerApiTable /></div></>;
}
