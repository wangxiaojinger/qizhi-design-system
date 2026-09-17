import { useEffect } from "react";
import { ModalApiTable } from "./ModalApiTable";
import { ModalDemoCodebox } from "./ModalDemoCodebox";
import { modalDemos } from "./modalDocs.registry";
import "./modalDocs.css";

export function ModalDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return <>
    <div className="qz-nav-intro">
      <p>组件 <span className="separator">/</span> <strong>反馈</strong></p>
      <h1 id="对话框-modal">对话框 Modal</h1>
      <p>在当前页面打开一个浮层，承载相关操作。</p>
    </div>
    <div className="component-examples qizhi-components-wrapper">
      {modalDemos.map((demo) => <ModalDemoCodebox key={demo.id} demo={demo} />)}
      <ModalApiTable />
    </div>
  </>;
}
