import { useEffect } from "react";
import { TreeApiTable } from "./TreeApiTable";
import { TreeDemoCodebox } from "./TreeDemoCodebox";
import { treeDemos } from "./treeDocs.registry";
import "./treeDocs.css";

export function TreeDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  return (
    <>
      <div className="qz-nav-intro">
        <p>
          组件 <span className="separator">/</span> <strong>数据展示</strong>
        </p>
        <h1 id="树-tree">树 Tree</h1>
        <p>用于展示具有层级关系的数据，并支持展开、选择和勾选。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {treeDemos.map((demo) => (
          <TreeDemoCodebox key={demo.id} demo={demo} />
        ))}
        <TreeApiTable />
      </div>
    </>
  );
}
