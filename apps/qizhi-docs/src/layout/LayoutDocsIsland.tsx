import { useEffect } from "react";
import { LayoutApiTable } from "./LayoutApiTable";
import { LayoutDemoCodebox } from "./LayoutDemoCodebox";
import { layoutDemos } from "./layoutDocs.registry";
import "../menu/menuDocs.css";
import "./layoutDocs.css";

export function LayoutDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return (
    <>
      <div className="component-intro"><div className="component-intro-meta">组件 / 布局</div><div className="component-intro-head"><div className="component-intro-copy"><h3>布局 Layout</h3><p>页面的基础布局框架，常与组件嵌套使用，用于构建带头部、底部、侧边栏和内容区的整体页面结构。</p></div></div></div>
      <div className="component-examples qizhi-components-wrapper">
        {layoutDemos.map((demo) => <LayoutDemoCodebox key={demo.id} demo={demo} />)}
        <LayoutApiTable />
      </div>
    </>
  );
}
