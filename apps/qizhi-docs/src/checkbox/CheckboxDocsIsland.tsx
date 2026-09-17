import { useEffect } from "react";
import { CheckboxApiTable } from "./CheckboxApiTable";
import { CheckboxDemoCodebox } from "./CheckboxDemoCodebox";
import { checkboxDemos } from "./checkboxDocs.registry";
import "./checkboxDocs.css";

export function CheckboxDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <><div className="qz-nav-intro"><p>组件 <span className="separator">/</span> <strong>数据输入</strong></p><h1 id="复选框-checkbox">复选框 Checkbox</h1><p>在一组数据中，用户可通过复选框选择一个或多个数据。</p></div><div className="component-examples qizhi-components-wrapper">{checkboxDemos.map((demo) => <CheckboxDemoCodebox key={demo.id} demo={demo} />)}<CheckboxApiTable /></div></>;
}
