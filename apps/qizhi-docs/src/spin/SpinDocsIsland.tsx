import { useEffect } from "react";
import { SpinApiTable } from "./SpinApiTable";
import { SpinDemoCodebox } from "./SpinDemoCodebox";
import { spinDemos } from "./spinDocs.registry";
import "./spinDocs.css";

export function SpinDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  return (
    <>
      <div className="qz-nav-intro">
        <p>
          组件 <span className="separator">/</span>{" "}
          <strong>反馈</strong>
        </p>
        <h1 id="加载中-spin">加载中 Spin</h1>
        <p>
          用于页面和区块的加载中状态。页面局部处于等待异步数据或正在渲染过程中时，合适的加载动效会有效缓解用户的焦虑。
        </p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {spinDemos.map((demo) => (
          <SpinDemoCodebox key={demo.id} demo={demo} />
        ))}
        <SpinApiTable />
      </div>
    </>
  );
}
