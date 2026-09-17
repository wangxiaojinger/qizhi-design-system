import { useEffect } from "react";
import { TagApiTable } from "./TagApiTable";
import { TagDemoCodebox } from "./TagDemoCodebox";
import { tagDemos } from "./tagDocs.registry";
import "./tagDocs.css";

export function TagDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <><div className="component-intro"><div className="component-intro-meta">组件 / 数据展示</div><div className="component-intro-head"><div className="component-intro-copy"><h3>标签 Tag</h3><p>用于信息的选择、筛选、分类。用户通过标签进行信息反馈和交互操作。</p></div></div></div><div className="component-examples qizhi-components-wrapper">{tagDemos.map((demo) => <TagDemoCodebox key={demo.id} demo={demo} />)}<TagApiTable /></div></>;
}
