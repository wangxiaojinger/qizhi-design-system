import { useEffect } from "react";
import { LinkApiTable } from "./LinkApiTable";
import { LinkDemoCodebox } from "./LinkDemoCodebox";
import { linkDemos } from "./linkDocs.registry";
import "./linkDocs.css";

export function LinkDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <><div className="component-intro"><div className="component-intro-meta">组件 / 通用</div><div className="component-intro-head"><div className="component-intro-copy"><h3>链接 Link</h3><p>链接用于页面跳转或表达较轻量的当前页操作。</p></div></div></div><div className="component-examples qizhi-components-wrapper">{linkDemos.map((demo) => <LinkDemoCodebox key={demo.id} demo={demo} />)}<LinkApiTable /></div></>;
}
