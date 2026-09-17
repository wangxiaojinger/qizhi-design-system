import { useEffect } from "react";
import { InputTagApiTable } from "./InputTagApiTable";
import { InputTagDemoCodebox } from "./InputTagDemoCodebox";
import { inputTagDemos } from "./inputTagDocs.registry";
import "./inputTagDemos.css";
import "./inputTagDocs.css";

export function InputTagDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return (
    <>
      <div className="component-intro">
        <div className="component-intro-meta">组件 / 输入</div>
        <div className="component-intro-head">
          <div className="component-intro-copy">
            <h3>标签输入框 InputTag</h3>
            <p>标签输入。</p>
          </div>
        </div>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {inputTagDemos.map((demo) => (
          <InputTagDemoCodebox key={demo.id} demo={demo} />
        ))}
        <InputTagApiTable />
      </div>
    </>
  );
}
