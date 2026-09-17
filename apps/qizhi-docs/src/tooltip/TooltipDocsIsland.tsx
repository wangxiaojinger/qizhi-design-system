import { useEffect } from "react";
import { TooltipApiTable } from "./TooltipApiTable";
import { TooltipDemoCodebox } from "./TooltipDemoCodebox";
import { tooltipDemos } from "./tooltipDocs.registry";
import "./tooltipDocs.css";

export function TooltipDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  return (
    <>
      <div className="component-intro">
        <div className="component-intro-meta">组件 / 数据展示</div>
        <div className="component-intro-head">
          <div className="component-intro-copy">
            <h3>文字气泡 Tooltip</h3>
            <p>鼠标悬停、聚焦或点击在某个组件时，弹出的文字提示。</p>
          </div>
        </div>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {tooltipDemos.map((demo) => (
          <TooltipDemoCodebox key={demo.id} demo={demo} />
        ))}
        <TooltipApiTable />
      </div>
    </>
  );
}
