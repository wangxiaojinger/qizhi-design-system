import { useEffect } from "react";
import { InputApiTable } from "./InputApiTable";
import { InputDemoCodebox } from "./InputDemoCodebox";
import { inputDemos } from "./inputDocs.registry";
import "./inputDemos.css";
import "./inputDocs.css";
export function InputDocsIsland() { useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []); return <><div className="component-intro"><div className="component-intro-meta">组件 / 数据输入</div><div className="component-intro-head"><div className="component-intro-copy"><h3>输入框 Input</h3><p>基本表单组件，并在原生控件基础上进行了功能扩展，可以组合使用。</p></div></div></div><div className="component-examples qizhi-components-wrapper">{inputDemos.map((demo) => <InputDemoCodebox key={demo.id} demo={demo} />)}<InputApiTable /></div></>; }
