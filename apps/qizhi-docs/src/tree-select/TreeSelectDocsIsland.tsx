import { useEffect } from "react";
import { TreeSelectApiTable } from "./TreeSelectApiTable";
import { TreeSelectDemoCodebox } from "./TreeSelectDemoCodebox";
import { treeSelectDemos } from "./treeSelectDocs.registry";
import "./treeSelectDocs.css";

export function TreeSelectDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  return (
    <>
      <div className="qz-nav-intro">
        <p>
          组件 <span className="separator">/</span>{" "}
          <strong>数据输入</strong>
        </p>
        <h1 id="树选择-treeselect">树选择 TreeSelect</h1>
        <p>可以通过树形结构选择数据。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {treeSelectDemos.map((demo) => (
          <TreeSelectDemoCodebox key={demo.id} demo={demo} />
        ))}
        <TreeSelectApiTable />
      </div>
    </>
  );
}
