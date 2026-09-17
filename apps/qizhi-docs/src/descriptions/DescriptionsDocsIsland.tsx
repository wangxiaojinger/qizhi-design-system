import { useEffect } from "react";
import { DescriptionsApiTable } from "./DescriptionsApiTable";
import { DescriptionsDemoCodebox } from "./DescriptionsDemoCodebox";
import { descriptionsDemos } from "./descriptionsDocs.registry";
import "./descriptionsDocs.css";

export function DescriptionsDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);

  return (
    <>
      <div className="component-intro"><div className="component-intro-meta">组件 / 数据展示</div><div className="component-intro-head"><div className="component-intro-copy"><h3>描述列表 Descriptions</h3><p>成组展示多个只读字段和值，适合详情页、订单信息、账号资料和系统参数。</p></div></div></div>
      <div className="component-examples qizhi-components-wrapper">
        {descriptionsDemos.map((demo) => <DescriptionsDemoCodebox key={demo.id} demo={demo} />)}
        <DescriptionsApiTable />
      </div>
    </>
  );
}
