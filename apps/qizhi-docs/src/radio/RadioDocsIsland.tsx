import { useEffect } from "react";
import { RadioApiTable } from "./RadioApiTable";
import { RadioDemoCodebox } from "./RadioDemoCodebox";
import { radioDemos } from "./radioDocs.registry";
import "./radioDocs.css";

export function RadioDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <><div className="qz-nav-intro"><p>组件 <span className="separator">/</span> <strong>数据输入</strong></p><h1 id="单选框-radio">单选框 Radio</h1><p>在一组相关且互斥数据中，用户仅能选择一个选项。</p></div><div className="component-examples qizhi-components-wrapper">{radioDemos.map((demo) => <RadioDemoCodebox key={demo.id} demo={demo} />)}<RadioApiTable /></div></>;
}
