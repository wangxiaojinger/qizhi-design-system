import { useEffect } from "react";
import { AlertApiTable } from "./AlertApiTable";
import { AlertDemoCodebox } from "./AlertDemoCodebox";
import { alertDemos } from "./alertDocs.registry";
import "./alertDocs.css";

export function AlertDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return <>
    <div className="qz-nav-intro">
      <p>组件 <span className="separator">/</span> <strong>反馈</strong></p>
      <h1 id="警告提示-alert">警告提示 Alert</h1>
      <p>向用户显示警告的信息时，通过警告提示，展现需要关注的信息。</p>
    </div>
    <div className="component-examples qizhi-components-wrapper">
      {alertDemos.map((demo) => <AlertDemoCodebox key={demo.id} demo={demo} />)}
      <AlertApiTable />
    </div>
  </>;
}
