import type { ComponentType } from "react";
import CombinationDemo from "./demos/CombinationDemo";
import combinationSource from "./demos/CombinationDemo.tsx?raw";
import MetricCardDemo from "./demos/MetricCardDemo";
import metricCardSource from "./demos/MetricCardDemo.tsx?raw";
import MetricItemDemo from "./demos/MetricItemDemo";
import metricItemSource from "./demos/MetricItemDemo.tsx?raw";
import ObjectMetricsDemo from "./demos/ObjectMetricsDemo";
import objectMetricsSource from "./demos/ObjectMetricsDemo.tsx?raw";
import ResourceUsageDemo from "./demos/ResourceUsageDemo";
import resourceUsageSource from "./demos/ResourceUsageDemo.tsx?raw";

export interface BusinessOverviewDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const businessOverviewDemos: readonly BusinessOverviewDemoDefinition[] = [
  {
    id: "概览与指标-指标卡",
    title: "指标卡",
    description:
      "展示一个业务类型的总量与主要状态指标。适合任务、服务、实例等可计数对象。",
    component: MetricCardDemo,
    source: metricCardSource,
  },
  {
    id: "概览与指标-资源用量卡",
    title: "资源用量卡",
    description:
      "有明确上限时使用“用量进度型”；没有有效上限、无法计算比例时使用“容量数值型”。",
    component: ResourceUsageDemo,
    source: resourceUsageSource,
  },
  {
    id: "概览与指标-指标项",
    title: "指标项",
    description:
      "最小的数据展示单元，只有名称与数值，通常作为对象指标组的内部组成，不单独承担复杂结论。",
    component: MetricItemDemo,
    source: metricItemSource,
  },
  {
    id: "概览与指标-对象指标组",
    title: "对象指标组",
    description:
      "围绕一个业务对象组织核心结论与多个辅助指标，适合机房、资源池、项目等对象。",
    component: ObjectMetricsDemo,
    source: objectMetricsSource,
  },
  {
    id: "概览与指标-组合应用",
    title: "组合应用",
    description:
      "面板容器、筛选器与多个指标卡的组合示例。组合应用不是新的卡片类型。",
    component: CombinationDemo,
    source: combinationSource,
  },
];
