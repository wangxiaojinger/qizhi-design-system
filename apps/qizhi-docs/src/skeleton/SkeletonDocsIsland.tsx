import { useEffect } from "react";
import { SkeletonApiTable } from "./SkeletonApiTable";
import { SkeletonDemoCodebox } from "./SkeletonDemoCodebox";
import { skeletonDemos } from "./skeletonDocs.registry";
import "./skeletonDocs.css";

export function SkeletonDocsIsland() {
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
        <h1 id="骨架屏-skeleton">骨架屏 Skeleton</h1>
        <p>将加载中的数据用灰色占位。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {skeletonDemos.map((demo) => (
          <SkeletonDemoCodebox key={demo.id} demo={demo} />
        ))}
        <SkeletonApiTable />
      </div>
    </>
  );
}
