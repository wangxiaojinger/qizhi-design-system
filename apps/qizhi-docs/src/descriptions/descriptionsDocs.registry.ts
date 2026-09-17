import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import LabelAlignDemo from "./demos/LabelAlignDemo";
import labelAlignSource from "./demos/LabelAlignDemo.tsx?raw";

export interface DescriptionsDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const descriptionsDemos: readonly DescriptionsDemoDefinition[] = [
  {
    id: "descriptions-basic",
    title: "基本用法",
    description: "简单地成组展示多个只读字段，一般用于详情页的信息。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "descriptions-label-align",
    title: "标签文本对齐",
    description: "标签文本可以设置左对齐右对齐，也可以设置垂直的排列方式。",
    component: LabelAlignDemo,
    source: labelAlignSource,
  },
];
