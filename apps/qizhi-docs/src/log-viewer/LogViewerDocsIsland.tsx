import { useEffect } from "react";
import { LogViewerApiTable } from "./LogViewerApiTable";
import { LogViewerDemoCodebox } from "./LogViewerDemoCodebox";
import { logViewerDemos } from "./logViewerDocs.registry";
import "./logViewerDocs.css";
export function LogViewerDocsIsland() { useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []); return <><div className="component-intro"><div className="component-intro-meta">组件 / 数据展示</div><div className="component-intro-head"><div className="component-intro-copy"><h3>日志查看器 LogViewer</h3><p>用于观察持续变化的运行日志，支持日志等级、搜索筛选、手动刷新、暂停跟随和长日志浏览。组件只负责展示和交互，不负责请求接口。</p></div></div></div><div className="component-examples qizhi-components-wrapper">{logViewerDemos.map((demo) => <LogViewerDemoCodebox key={demo.id} demo={demo} />)}<LogViewerApiTable /></div></>; }
