import { useEffect } from "react";
import { PageHeaderApiTable } from "./PageHeaderApiTable";
import { PageHeaderDemoCodebox } from "./PageHeaderDemoCodebox";
import { pageHeaderDemos } from "./pageHeaderDocs.registry";
import "./pageHeaderDocs.css";

export function PageHeaderDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  return (
    <>
      <div className="qz-nav-intro">
        <p>
          组件 <span className="separator">/</span>{" "}
          <strong>导航</strong>
        </p>
        <h1 id="页头-pageheader">页头 PageHeader</h1>
        <p>
          页头位于页容器顶部，用于概括当前内容并引导页级操作，通常由面包屑、标题、说明和操作区组成。
        </p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {pageHeaderDemos.map((demo) => (
          <PageHeaderDemoCodebox key={demo.id} demo={demo} />
        ))}
        <PageHeaderApiTable />
      </div>
    </>
  );
}
