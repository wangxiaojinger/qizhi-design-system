import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";

export interface EmptyDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const emptyDemos: readonly EmptyDemoDefinition[] = [
  { id: "empty-basic", title: "基本用法", description: "Empty 空状态组件的基础用法。", component: BasicDemo, source: basicSource },
];
