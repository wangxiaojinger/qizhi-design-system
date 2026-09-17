import { useEffect } from "react";
import { FormApiTable } from "./FormApiTable";
import { FormDemoCodebox } from "./FormDemoCodebox";
import { formDemos } from "./formDocs.registry";
import "./formDocs.css";

export function FormDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  return (
    <>
      <div className="qz-nav-intro">
        <p>组件 <span className="separator">/</span> <strong>数据输入</strong></p>
        <h1 id="表单-form">表单 Form</h1>
        <p>具有数据收集、校验和提交功能的表单，包含复选框、单选框、输入框、下拉选择框等元素。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {formDemos.map((demo) => <FormDemoCodebox key={demo.id} demo={demo} />)}
        <FormApiTable />
      </div>
    </>
  );
}

