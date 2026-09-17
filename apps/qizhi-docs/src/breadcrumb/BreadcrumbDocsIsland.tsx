import { useEffect } from "react";
import { BreadcrumbApiTable } from "./BreadcrumbApiTable";
import { BreadcrumbDemoCodebox } from "./BreadcrumbDemoCodebox";
import { breadcrumbDemos } from "./breadcrumbDocs.registry";
import "./breadcrumbDocs.css";

export function BreadcrumbDocsIsland() {
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
        <h1 id="面包屑-breadcrumb">面包屑 Breadcrumb</h1>
        <p>
          面包屑是辅助导航模式，用于识别页面在层次结构内的位置，并根据需要向上返回。
        </p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {breadcrumbDemos.map((demo) => (
          <BreadcrumbDemoCodebox key={demo.id} demo={demo} />
        ))}
        <BreadcrumbApiTable />
      </div>
    </>
  );
}
