import { useEffect } from "react";
import { TypographyApiTable } from "./TypographyApiTable";
import { TypographyDemoCodebox } from "./TypographyDemoCodebox";
import { typographyDemos } from "./typographyDocs.registry";
import "./typographyDocs.css";

export function TypographyDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <><div className="component-intro"><div className="component-intro-meta">组件 / 通用</div><div className="component-intro-head"><div className="component-intro-copy"><h3>排版 Typography</h3><p>用于展示标题、段落、文本内容。</p></div></div></div><div className="component-examples qizhi-components-wrapper">{typographyDemos.map((demo) => <TypographyDemoCodebox key={demo.id} demo={demo} />)}<TypographyApiTable /></div></>;
}
