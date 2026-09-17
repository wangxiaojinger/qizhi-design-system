import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";

export interface DetailHeaderDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const detailHeaderDemos: readonly DetailHeaderDemoDefinition[] = [{
  id: "详情头部-基本用法",
  title: "基本用法",
  description: "名称、状态与主要操作构成首要信息层级；属性和审计信息位于次级区域，底部页签切换详情内容。",
  component: BasicDemo,
  source: basicSource,
}];
