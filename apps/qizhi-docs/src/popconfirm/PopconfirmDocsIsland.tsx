import { useEffect } from "react";
import { PopconfirmApiTable } from "./PopconfirmApiTable";
import { PopconfirmDemoCodebox } from "./PopconfirmDemoCodebox";
import { popconfirmDemos } from "./popconfirmDocs.registry";
import "./popconfirmDocs.css";

export function PopconfirmDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  return (
    <>
      <div className="qz-nav-intro">
        <p>组件 <span className="separator">/</span> <strong>反馈</strong></p>
        <h1 id="气泡确认框-popconfirm">气泡确认框 Popconfirm</h1>
        <p>点击元素，弹出气泡式的确认框。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {popconfirmDemos.map((demo) => (
          <PopconfirmDemoCodebox key={demo.id} demo={demo} />
        ))}
        <PopconfirmApiTable />
      </div>
    </>
  );
}
