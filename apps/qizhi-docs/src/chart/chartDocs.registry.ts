import type { ComponentType } from "react";
import type { ChartDemoQuery } from "./chartDocsRange";
import BasicLineDemo from "./demos/BasicLineDemo";
import basicLineSource from "./demos/BasicLineDemo.tsx?raw";
import CostTrendDemo from "./demos/CostTrendDemo";
import costTrendSource from "./demos/CostTrendDemo.tsx?raw";
import EmptyDemo from "./demos/EmptyDemo";
import emptySource from "./demos/EmptyDemo.tsx?raw";
import ErrorDemo from "./demos/ErrorDemo";
import errorSource from "./demos/ErrorDemo.tsx?raw";
import GroupedBarDemo from "./demos/GroupedBarDemo";
import groupedBarSource from "./demos/GroupedBarDemo.tsx?raw";
import LegendTooltipDemo from "./demos/LegendTooltipDemo";
import legendTooltipSource from "./demos/LegendTooltipDemo.tsx?raw";
import LoadingDemo from "./demos/LoadingDemo";
import loadingSource from "./demos/LoadingDemo.tsx?raw";
import MultiLineDemo from "./demos/MultiLineDemo";
import multiLineSource from "./demos/MultiLineDemo.tsx?raw";
import NormalBarDemo from "./demos/NormalBarDemo";
import normalBarSource from "./demos/NormalBarDemo.tsx?raw";
import ResponsiveKeyboardDemo from "./demos/ResponsiveKeyboardDemo";
import responsiveKeyboardSource from "./demos/ResponsiveKeyboardDemo.tsx?raw";
import StackedBarDemo from "./demos/StackedBarDemo";
import stackedBarSource from "./demos/StackedBarDemo.tsx?raw";
import ZeroMissingDemo from "./demos/ZeroMissingDemo";
import zeroMissingSource from "./demos/ZeroMissingDemo.tsx?raw";

export interface ChartDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType<{ query?: ChartDemoQuery }>;
  source: string;
}

export const chartDemos: readonly ChartDemoDefinition[] = [
  {
    id: "图表-基础折线",
    title: "折线图：基础折线",
    description: "展示单个指标随时间的变化，并按所选日期范围将无数据日期补为 0。以下为演示数据。",
    component: BasicLineDemo,
    source: basicLineSource,
  },
  {
    id: "图表-多系列折线",
    title: "折线图：多系列折线",
    description: "在同一坐标系中对比多个同单位指标的变化，适用于不同服务的请求量对比。以下为演示数据。",
    component: MultiLineDemo,
    source: multiLineSource,
  },
  {
    id: "图表-普通柱状图",
    title: "柱状图：普通",
    description: "使用柱形比较各时间点或分类的数值，适用于每日请求量对比。以下为演示数据。",
    component: NormalBarDemo,
    source: normalBarSource,
  },
  {
    id: "图表-分组柱状图",
    title: "柱状图：分组",
    description: "在同一分类中并排展示多个系列，便于比较输入与输出用量的差异。以下为演示数据。",
    component: GroupedBarDemo,
    source: groupedBarSource,
  },
  {
    id: "图表-堆叠柱状图",
    title: "柱状图：堆叠",
    description: "将多个系列在同一柱形中累加，便于观察用量构成及整体变化。以下为演示数据。",
    component: StackedBarDemo,
    source: stackedBarSource,
  },
  {
    id: "图表-费用趋势与单位格式化",
    title: "费用趋势与单位格式化",
    description: "展示费用随时间的变化，并统一格式化坐标轴、提示信息和数据明细。以下为演示数据。",
    component: CostTrendDemo,
    source: costTrendSource,
  },
  {
    id: "图表-图例与提示信息",
    title: "图例与提示信息",
    description: "通过图例控制系列显示，并使用提示信息查看同一时间点的数据。以下为演示数据。",
    component: LegendTooltipDemo,
    source: legendTooltipSource,
  },
  {
    id: "图表-加载中",
    title: "加载中",
    description: "数据加载时保留图表区域并显示加载反馈，避免布局跳动。以下为演示状态。",
    component: LoadingDemo,
    source: loadingSource,
  },
  {
    id: "图表-空数据",
    title: "空数据",
    description: "没有可展示的数据时显示空状态，不使用全零曲线代替。",
    component: EmptyDemo,
    source: emptySource,
  },
  {
    id: "图表-错误状态",
    title: "错误状态",
    description: "数据获取或图表绘制失败时显示错误反馈，由业务页面决定后续处理。",
    component: ErrorDemo,
    source: errorSource,
  },
  {
    id: "图表-零值与缺失数据",
    title: "零值与缺失数据",
    description: "零值表示已知数值为零，缺失值表示当前没有有效数据，两者使用不同方式展示。以下为演示数据。",
    component: ZeroMissingDemo,
    source: zeroMissingSource,
  },
  {
    id: "图表-响应式与键盘操作",
    title: "响应式与键盘操作",
    description: "图表随容器宽度调整布局，并支持使用键盘查看数据和操作图例。以下为演示数据。此示例演示时间轴默认框选，松手后缩小当前图表范围。",
    component: ResponsiveKeyboardDemo,
    source: responsiveKeyboardSource,
  },
];
