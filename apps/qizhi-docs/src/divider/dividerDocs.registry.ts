import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import TextDemo from "./demos/TextDemo";
import textSource from "./demos/TextDemo.tsx?raw";
import VerticalDemo from "./demos/VerticalDemo";
import verticalSource from "./demos/VerticalDemo.tsx?raw";

export interface DividerDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const dividerDemos: readonly DividerDemoDefinition[] = [
  { id: "divider-basic", title: "基本用法", description: "默认为水平实线，也可使用虚线和点线增强内容层次；列表缩进由消费场景样式控制。", component: BasicDemo, source: basicSource },
  { id: "divider-with-text", title: "带有文字的分割线", description: "通过 orientation 指定文字在分割线中的位置，用于标题分段和语义说明。", component: TextDemo, source: textSource },
  { id: "divider-vertical", title: "竖直分割线", description: "将 type 设为 vertical 可分隔并列内容；竖直分割线不渲染文字。", component: VerticalDemo, source: verticalSource },
];
