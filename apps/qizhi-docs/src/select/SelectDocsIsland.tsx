import { Fragment, useEffect } from "react";
import { SelectApiTable } from "./SelectApiTable";
import { SelectDemoCodebox } from "./SelectDemoCodebox";
import { selectDemos } from "./selectDocs.registry";
import "./selectDocs.css";
export function SelectDocsIsland() { useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []); return <><div className="qz-nav-intro"><p>组件 <span className="separator">/</span> <strong>数据输入</strong></p><h1 id="选择器-select">选择器 Select</h1><p>当用户需要从一组同类数据中选择一个或多个时，可以使用下拉选择器，点击后选择对应项。</p></div><div className="component-examples qizhi-components-wrapper">{selectDemos.map((demo) => <Fragment key={demo.id}>{demo.sectionBefore ? <section className="select-docs-card-section"><h2 className="qz-demo-title">{demo.sectionBefore.title}</h2><p>{demo.sectionBefore.description}</p></section> : null}<SelectDemoCodebox demo={demo} /></Fragment>)}<SelectApiTable /></div></>; }
