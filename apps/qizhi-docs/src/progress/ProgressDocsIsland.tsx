import { useEffect } from "react";
import { ProgressApiTable } from "./ProgressApiTable";
import { ProgressDemoCodebox } from "./ProgressDemoCodebox";
import { progressDemos } from "./progressDocs.registry";
import "./progressDocs.css";

export function ProgressDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <><div className="qz-nav-intro"><p>组件 <span className="separator">/</span> <strong>数据展示</strong></p><h1 id="进度条-progress">进度条 Progress</h1><p>给予用户当前系统执行中任务运行状态的反馈，多用于运行一段时间的场景，有效减轻用户在等待中产生的焦虑感。</p></div><div className="component-examples qizhi-components-wrapper">{progressDemos.map((demo) => <ProgressDemoCodebox key={demo.id} demo={demo} />)}<ProgressApiTable /></div></>;
}
