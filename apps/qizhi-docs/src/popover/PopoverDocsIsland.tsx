import { useEffect } from "react";
import { PopoverApiTable } from "./PopoverApiTable";
import { PopoverDemoCodebox } from "./PopoverDemoCodebox";
import { popoverDemos } from "./popoverDocs.registry";
import "./popoverDocs.css";

export function PopoverDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <><div className="component-intro"><div className="component-intro-meta">组件 / 数据展示</div><div className="component-intro-head"><div className="component-intro-copy"><h3>气泡卡片 Popover</h3><p>用于在触发元素旁展示补充信息、复杂内容和轻量操作。</p></div></div></div><div className="component-examples qizhi-components-wrapper">{popoverDemos.map((demo) => <PopoverDemoCodebox key={demo.id} demo={demo} />)}<PopoverApiTable /></div></>;
}
