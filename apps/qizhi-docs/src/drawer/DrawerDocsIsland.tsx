import { useEffect } from "react";
import { DrawerApiTable } from "./DrawerApiTable";
import { DrawerDemoCodebox } from "./DrawerDemoCodebox";
import { drawerDemos } from "./drawerDocs.registry";
import "./drawerDocs.css";

export function DrawerDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return (
    <>
      <div className="qz-nav-intro">
        <p>组件 <span className="separator">/</span> <strong>反馈</strong></p>
        <h1>抽屉 Drawer</h1>
        <p>触发命令后，从屏幕一侧滑出的抽屉式的面板。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {drawerDemos.map((demo) => (
          <DrawerDemoCodebox key={demo.id} demo={demo} />
        ))}
        <DrawerApiTable />
      </div>
    </>
  );
}
