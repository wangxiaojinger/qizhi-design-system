import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";

export interface PageHeaderDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const pageHeaderDemos: readonly PageHeaderDemoDefinition[] = [
  {
    id: "页头-基础用法",
    title: "基础用法",
    description: "基础页头用于展示当前工作区的欢迎语，高度固定为 54px。",
    component: BasicDemo,
    source: basicSource,
  },
];
