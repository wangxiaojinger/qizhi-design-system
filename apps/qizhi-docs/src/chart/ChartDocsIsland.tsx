import { useEffect } from "react";
import { ChartApiTable } from "./ChartApiTable";
import { ChartDemoCodebox } from "./ChartDemoCodebox";
import { chartDemos } from "./chartDocs.registry";
import "./chartDocs.css";

export function ChartDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  return (
    <>
      <div className="qz-nav-intro">
        <p>基础组件 <span className="separator">/</span> <strong>数据展示</strong></p>
        <h1 id="图表-chart">图表</h1>
        <p>用于展示数据的变化趋势与分类对比，支持折线图、柱状图及分组、堆叠模式。由业务页面传入数据，统一提供图例、提示信息和状态反馈。</p>
        <p>指标计算、时间范围和数据请求由业务页面管理；图表组件负责数据展示与交互。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {chartDemos.map((demo) => <ChartDemoCodebox key={demo.id} demo={demo} />)}
        <ChartApiTable />
      </div>
    </>
  );
}
