import { useEffect } from "react";
import { SwitchApiTable } from "./SwitchApiTable";
import { SwitchDemoCodebox } from "./SwitchDemoCodebox";
import { switchDemos } from "./switchDocs.registry";
import "./switchDocs.css";

export function SwitchDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <><div className="qz-nav-intro"><p>组件 <span className="separator">/</span> <strong>数据输入</strong></p><h1 id="开关-switch">开关 Switch</h1><p>互斥性的操作控件，用户可打开或关闭某个功能。</p></div><div className="component-examples qizhi-components-wrapper">{switchDemos.map((demo) => <SwitchDemoCodebox key={demo.id} demo={demo} />)}<SwitchApiTable /></div></>;
}
