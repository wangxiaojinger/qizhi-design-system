import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import LayoutDemo from "./demos/LayoutDemo";
import layoutSource from "./demos/LayoutDemo.tsx?raw";
import ControlledDemo from "./demos/ControlledDemo";
import controlledSource from "./demos/ControlledDemo.tsx?raw";

export interface FormDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const formDemos: readonly FormDemoDefinition[] = [
  {
    id: "表单-基础用法",
    title: "基础用法",
    description: "非受控模式的基础用法，表单项采用垂直布局。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "表单-表单布局",
    title: "表单布局",
    description: "Form 支持垂直和水平两种排列方式。",
    component: LayoutDemo,
    source: layoutSource,
  },
  {
    id: "表单-受控表单",
    title: "受控表单",
    description: "表单统一收集和更新各表单项的值。",
    component: ControlledDemo,
    source: controlledSource,
  },
];

