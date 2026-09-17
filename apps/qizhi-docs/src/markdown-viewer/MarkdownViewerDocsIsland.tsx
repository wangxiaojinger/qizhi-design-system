import { useEffect } from "react";
import { MarkdownViewerApiTable } from "./MarkdownViewerApiTable";
import { MarkdownViewerDemoCodebox } from "./MarkdownViewerDemoCodebox";
import { markdownViewerDemos } from "./markdownViewerDocs.registry";
import "./markdownViewerDocs.css";
export function MarkdownViewerDocsIsland() { useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []); return <><div className="component-intro"><div className="component-intro-meta">组件 / 数据展示</div><div className="component-intro-head"><div className="component-intro-copy"><h3>Markdown 阅读器 MarkdownViewer</h3><p>用于安全地将 Markdown 内容渲染为易读的标题、段落、列表、表格、引用、链接和代码块，适用于说明文档、使用手册和详情介绍。</p></div></div></div><div className="component-examples qizhi-components-wrapper">{markdownViewerDemos.map((demo) => <MarkdownViewerDemoCodebox key={demo.id} demo={demo} />)}<MarkdownViewerApiTable /></div></>; }
