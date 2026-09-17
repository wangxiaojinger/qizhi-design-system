import { useEffect } from "react";
import { CodePreviewApiTable } from "./CodePreviewApiTable";
import { CodePreviewDemoCodebox } from "./CodePreviewDemoCodebox";
import { codePreviewDemos } from "./codePreviewDocs.registry";
import "./codePreviewDocs.css";
export function CodePreviewDocsIsland() { useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []); return <><div className="component-intro"><div className="component-intro-meta">组件 / 数据展示</div><div className="component-intro-head"><div className="component-intro-copy"><h3>代码预览 CodePreview</h3><p>用于只读展示代码和结构化文本，支持语法高亮、行号、自动换行、复制与下载，适用于配置文件、接口响应和 Skill 源文件等内容。</p></div></div></div><div className="component-examples qizhi-components-wrapper">{codePreviewDemos.map((demo) => <CodePreviewDemoCodebox key={demo.id} demo={demo} />)}<CodePreviewApiTable /></div></>; }
