import { useEffect } from "react";
import { SpaceApiTable } from "./SpaceApiTable";
import { SpaceDemoCodebox } from "./SpaceDemoCodebox";
import { spaceDemos } from "./spaceDocs.registry";
import "./spaceDocs.css";

export function SpaceDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <>
    <div className="component-intro">
      <div className="component-intro-meta">组件 / 布局</div>
      <div className="component-intro-head"><div className="component-intro-copy">
        <h3>间距 Space</h3><p>设置组件之间的间距。</p>
      </div></div>
    </div>
    <div className="component-examples qizhi-components-wrapper">
      {spaceDemos.map((demo) => <SpaceDemoCodebox key={demo.id} demo={demo} />)}
      <SpaceApiTable />
    </div>
  </>;
}
