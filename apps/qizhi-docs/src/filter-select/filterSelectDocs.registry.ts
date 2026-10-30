import type { ComponentType } from "react";
import MultipleDemo from "./demos/MultipleDemo";
import multipleSource from "./demos/MultipleDemo.tsx?raw";
import SingleDemo from "./demos/SingleDemo";
import singleSource from "./demos/SingleDemo.tsx?raw";
import StatesDemo from "./demos/StatesDemo";
import statesSource from "./demos/StatesDemo.tsx?raw";

export interface FilterSelectDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const filterSelectDemos: readonly FilterSelectDemoDefinition[] = [
  { id: "筛选选择器-单选筛选", title: "单选筛选", description: "筛选名称常驻触发框，选择后立即更新摘要。", component: SingleDemo, source: singleSource },
  { id: "筛选选择器-多选筛选", title: "多选筛选", description: "超过最大展示数量后合并为剩余数量摘要。", component: MultipleDemo, source: multipleSource },
  { id: "筛选选择器-状态与自定义", title: "状态与自定义", description: "演示多选摘要与禁用状态。", component: StatesDemo, source: statesSource },
];
