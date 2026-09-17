import { useEffect } from "react";
import { DropdownApiTable } from "./DropdownApiTable";
import { DropdownDemoCodebox } from "./DropdownDemoCodebox";
import { dropdownDemos } from "./dropdownDocs.registry";
import "./dropdownDocs.css";
export function DropdownDocsIsland() { useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []); return <><div className="qz-nav-intro"><p>组件 <span className="separator">/</span> <strong>导航</strong></p><h1>下拉菜单 Dropdown</h1><p>页面上的命令过多时，可将备选命令收纳到向下展开的浮层容器中。</p></div><div className="component-examples qizhi-components-wrapper">{dropdownDemos.map((item) => <DropdownDemoCodebox key={item.id} demo={item} />)}<DropdownApiTable /></div></>; }
