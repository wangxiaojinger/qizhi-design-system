import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import CustomIconDemo from "./demos/CustomIconDemo";
import customIconSource from "./demos/CustomIconDemo.tsx?raw";

export interface BreadcrumbDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const breadcrumbDemos: readonly BreadcrumbDemoDefinition[] = [
  {
    id: "面包屑-基础用法",
    title: "基础用法",
    description: "适用于广泛基本用法。分隔方式分为图标分隔及斜线分隔两种方式，可根据不同场景使用。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "面包屑-自定义图标",
    title: "自定义图标",
    description: "可以在内容中使用自定义图标。",
    component: CustomIconDemo,
    source: customIconSource,
  },
];
