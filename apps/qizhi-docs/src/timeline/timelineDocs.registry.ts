import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import ContentDemo from "./demos/ContentDemo";
import contentSource from "./demos/ContentDemo.tsx?raw";
import CustomDotDemo from "./demos/CustomDotDemo";
import customDotSource from "./demos/CustomDotDemo.tsx?raw";
import HorizontalDemo from "./demos/HorizontalDemo";
import horizontalSource from "./demos/HorizontalDemo.tsx?raw";
import LabelDemo from "./demos/LabelDemo";
import labelSource from "./demos/LabelDemo.tsx?raw";
import LineDemo from "./demos/LineDemo";
import lineSource from "./demos/LineDemo.tsx?raw";
import ModeDemo from "./demos/ModeDemo";
import modeSource from "./demos/ModeDemo.tsx?raw";
import PendingDemo from "./demos/PendingDemo";
import pendingSource from "./demos/PendingDemo.tsx?raw";
import VerticalDemo from "./demos/VerticalDemo";
import verticalSource from "./demos/VerticalDemo.tsx?raw";

export interface TimelineDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const timelineDemos: readonly TimelineDemoDefinition[] = [
  {
    id: "时间轴-基础用法",
    title: "基础用法",
    description: "基本用法",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "时间轴-自定义节点内容",
    title: "自定义节点内容",
    description: "自定义节点内容",
    component: ContentDemo,
    source: contentSource,
  },
  {
    id: "时间轴-自定义节点",
    title: "自定义节点",
    description:
      "可以通过属性 dotColor, dotType 设置节点的颜色以及节点类型。同时可通过 dot 直接传入 ReactNode 自定义节点样式。优先级高于 dotColor 和 dotType",
    component: CustomDotDemo,
    source: customDotSource,
  },
  {
    id: "时间轴-自定义轴线样式",
    title: "自定义轴线样式",
    description: "自定义轴线的示例。",
    component: LineDemo,
    source: lineSource,
  },
  {
    id: "时间轴-幽灵节点",
    title: "幽灵节点",
    description:
      "当任务状态正在发生，还在记录过程中，可用幽灵节点来表示当前的时间节点，通过 pendingDot 定制其轴点。",
    component: PendingDemo,
    source: pendingSource,
  },
  {
    id: "时间轴-时间轴展示类型",
    title: "时间轴展示类型",
    description:
      "设置 mode=alternate 时将会交替展示内容。同时可以通过设置 TimelineItem 的 position 属性控制时间轴节点的位置。",
    component: ModeDemo,
    source: modeSource,
  },
  {
    id: "时间轴-纵向时间轴",
    title: "纵向时间轴",
    description: "竖直方向的时间轴。",
    component: VerticalDemo,
    source: verticalSource,
  },
  {
    id: "时间轴-横向时间轴",
    title: "横向时间轴",
    description: "可以通过 direction 设置展示横向时间轴",
    component: HorizontalDemo,
    source: horizontalSource,
  },
  {
    id: "时间轴-标签文本位置",
    title: "标签文本位置",
    description: "通过 labelPosition 可以设置标签文本的位置。",
    component: LabelDemo,
    source: labelSource,
  },
];

