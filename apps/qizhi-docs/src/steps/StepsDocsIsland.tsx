import { useEffect } from "react";
import { StepsApiTable } from "./StepsApiTable";
import { StepsDemoCodebox } from "./StepsDemoCodebox";
import { stepsDemos } from "./stepsDocs.registry";
import "./stepsDocs.css";

export function StepsDocsIsland() {
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
        <h1 id="步骤条-steps">步骤条 Steps</h1>
        <p>
          明示任务流程和当前完成程度，引导用户按照步骤完成任务。
        </p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {stepsDemos.map((demo) => (
          <StepsDemoCodebox key={demo.id} demo={demo} />
        ))}
        <StepsApiTable />
      </div>
    </>
  );
}
