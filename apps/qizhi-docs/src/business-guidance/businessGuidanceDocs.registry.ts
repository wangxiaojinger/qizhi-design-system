import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";

export interface BusinessGuidanceDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const businessGuidanceDemos: readonly BusinessGuidanceDemoDefinition[] = [
  {
    id: "引导与流程-基础用法",
    title: "基础用法",
    description:
      "适用于首次进入平台或关键业务尚未完成时，用三步任务卡说明从加入项目到模型部署的完整路径。",
    component: BasicDemo,
    source: basicSource,
  },
];
