import { useEffect } from "react";
import { CascaderApiTable } from "./CascaderApiTable";
import { CascaderDemoCodebox } from "./CascaderDemoCodebox";
import { cascaderDemos } from "./cascaderDocs.registry";
import "./cascaderDocs.css";
export function CascaderDocsIsland() { useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []); return <><div className="component-intro"><div className="component-intro-meta">组件 / 数据输入</div><div className="component-intro-head"><div className="component-intro-copy"><h3>级联选择 Cascader</h3><p>通过多级分类逐层定位选项，适用于地区、组织和类目路径。</p></div></div></div><div className="component-examples qizhi-components-wrapper">{cascaderDemos.map((demo) => <CascaderDemoCodebox key={demo.id} demo={demo} />)}<CascaderApiTable /></div></>; }

