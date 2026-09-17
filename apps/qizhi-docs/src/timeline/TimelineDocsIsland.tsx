import { useEffect } from "react";
import { TimelineApiTable } from "./TimelineApiTable";
import { TimelineDemoCodebox } from "./TimelineDemoCodebox";
import { timelineDemos } from "./timelineDocs.registry";
import "./timelineDocs.css";

export function TimelineDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  return (
    <>
      <div className="component-intro">
        <div className="component-intro-meta">组件 / 数据展示</div>
        <div className="component-intro-head">
          <div className="component-intro-copy">
            <h3>时间轴 Timeline</h3>
            <p>按照时间顺序或倒序规则的展示信息内容。</p>
          </div>
        </div>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {timelineDemos.map((demo) => (
          <TimelineDemoCodebox key={demo.id} demo={demo} />
        ))}
        <TimelineApiTable />
      </div>
    </>
  );
}

