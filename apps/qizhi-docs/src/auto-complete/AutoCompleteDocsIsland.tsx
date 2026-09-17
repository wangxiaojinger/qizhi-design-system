import { useEffect } from "react";
import { AutoCompleteApiTable } from "./AutoCompleteApiTable";
import { AutoCompleteDemoCodebox } from "./AutoCompleteDemoCodebox";
import { autoCompleteDemos } from "./autoCompleteDocs.registry";
import "./autoCompleteDocs.css";

export function AutoCompleteDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <><div className="qz-nav-intro"><p>组件 <span className="separator">/</span> <strong>数据输入</strong></p><h1 id="自动补全-autocomplete">自动补全 AutoComplete</h1><p>输入框或自定义输入控件的自动补全功能。</p></div><div className="component-examples qizhi-components-wrapper">{autoCompleteDemos.map((demo) => <AutoCompleteDemoCodebox key={demo.id} demo={demo} />)}<AutoCompleteApiTable /></div></>;
}
