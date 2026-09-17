import type { ComponentType } from "react";
import AnimationDemo from "./demos/AnimationDemo";
import animationSource from "./demos/AnimationDemo.tsx?raw";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import TextDemo from "./demos/TextDemo";
import textSource from "./demos/TextDemo.tsx?raw";

export interface SkeletonDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const skeletonDemos: readonly SkeletonDemoDefinition[] = [
  {
    id: "Skeleton-基础用法",
    title: "基础用法",
    description: "骨架屏的基本使用。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "Skeleton-文本行数和宽度",
    title: "文本行数和宽度",
    description: "设置文本行数及文本宽度。",
    component: TextDemo,
    source: textSource,
  },
  {
    id: "Skeleton-动画",
    title: "动画",
    description: "骨架屏显示动画效果。",
    component: AnimationDemo,
    source: animationSource,
  },
];
