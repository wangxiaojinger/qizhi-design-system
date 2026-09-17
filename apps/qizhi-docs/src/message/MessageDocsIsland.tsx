import { useEffect } from "react";
import { MessageApiTable } from "./MessageApiTable";
import { MessageDemoCodebox } from "./MessageDemoCodebox";
import { messageDemos } from "./messageDocs.registry";
import "./messageDocs.css";

export function MessageDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <>
    <div className="qz-nav-intro">
      <p>组件 <span className="separator">/</span> <strong>反馈</strong></p>
      <h1 id="全局提示-message">全局提示 Message</h1>
      <p>由用户的操作触发的轻量级全局反馈。</p>
    </div>
    <div className="component-examples qizhi-components-wrapper">
      {messageDemos.map((demo) => <MessageDemoCodebox key={demo.id} demo={demo} />)}
      <MessageApiTable />
    </div>
  </>;
}
