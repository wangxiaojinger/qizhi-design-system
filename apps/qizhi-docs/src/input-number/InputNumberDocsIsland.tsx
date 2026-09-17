import { useEffect } from "react";
import { InputNumberApiTable } from "./InputNumberApiTable";
import { InputNumberDemoCodebox } from "./InputNumberDemoCodebox";
import { inputNumberDemos } from "./inputNumberDocs.registry";
import "./inputNumberDemos.css";
import "./inputNumberDocs.css";

export function InputNumberDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return (
    <>
      <div className="component-intro">
        <div className="component-intro-meta">组件 / 数据输入</div>
        <div className="component-intro-head">
          <div className="component-intro-copy">
            <h3>数字输入框 InputNumber</h3>
            <p>仅允许输入数字格式的输入框。</p>
          </div>
        </div>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {inputNumberDemos.map((demo) => <InputNumberDemoCodebox key={demo.id} demo={demo} />)}
        <InputNumberApiTable />
      </div>
    </>
  );
}
