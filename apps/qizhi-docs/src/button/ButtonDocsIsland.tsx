import { useEffect } from "react";
import { ApiTable } from "./ApiTable";
import { buttonDemos } from "./buttonDocs.registry";
import { DemoCodebox } from "./DemoCodebox";
import "./buttonDocs.css";

export function ButtonDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <>
    <div className="component-intro"><div className="component-intro-meta">组件 / 通用</div><div className="component-intro-head"><div className="component-intro-copy"><h3>按钮 Button</h3><p>按钮是一种命令组件，可发起一个即时操作。</p></div></div></div>
    <div className="component-examples qizhi-components-wrapper">{buttonDemos.map((demo) => <DemoCodebox key={demo.id} demo={demo} />)}<ApiTable /></div>
  </>;
}
