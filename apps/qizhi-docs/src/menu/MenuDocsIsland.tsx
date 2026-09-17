import { useEffect } from "react";
import { MenuApiTable } from "./MenuApiTable";
import { MenuDemoCodebox } from "./MenuDemoCodebox";
import { menuDemos } from "./menuDocs.registry";
import "./menuDocs.css";

export function MenuDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  return (
    <>
      <div className="qz-nav-intro">
        <p>
          组件 <span className="separator">/</span>{" "}
          <strong>导航</strong>
        </p>
        <h1 id="菜单-menu">菜单 Menu</h1>
        <p>收纳、排列并展示一系列选项的列表。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {menuDemos.map((demo) => (
          <MenuDemoCodebox key={demo.id} demo={demo} />
        ))}
        <MenuApiTable />
      </div>
    </>
  );
}
