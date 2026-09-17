import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import MiniDemo from "./demos/MiniDemo";
import miniSource from "./demos/MiniDemo.tsx?raw";
import PositionDemo from "./demos/PositionDemo";
import positionSource from "./demos/PositionDemo.tsx?raw";
import ControlledDemo from "./demos/ControlledDemo";
import controlledSource from "./demos/ControlledDemo.tsx?raw";
import ColorDemo from "./demos/ColorDemo";
import colorSource from "./demos/ColorDemo.tsx?raw";

export interface TooltipDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const tooltipDemos: readonly TooltipDemoDefinition[] = [
  {
    id: "文字气泡-基础用法",
    title: "基础用法",
    description: "鼠标移入，气泡出现，鼠标移出，气泡消失。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "文字气泡-迷你尺寸",
    title: "迷你尺寸",
    description: "适用于小场景或数字气泡样式。",
    component: MiniDemo,
    source: miniSource,
  },
  {
    id: "文字气泡-位置",
    title: "位置",
    description:
      "Tooltip 支持 12 个不同的方位。分别为：上左 上 上右 下左 下 下右 左上 左 左下 右上 右 右下。",
    component: PositionDemo,
    source: positionSource,
  },
  {
    id: "文字气泡-受控模式",
    title: "受控模式",
    description: "可以通过 popupVisible 控制气泡显示状态。",
    component: ControlledDemo,
    source: controlledSource,
  },
  {
    id: "文字气泡-不同颜色",
    title: "不同颜色",
    description: "通过设置 color 可以展示不同背景色的提示内容。",
    component: ColorDemo,
    source: colorSource,
  },
];
