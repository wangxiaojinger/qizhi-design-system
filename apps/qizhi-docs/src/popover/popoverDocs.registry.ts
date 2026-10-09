import { createElement } from "react";
import type { ComponentType, ReactNode } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import CopyDemo from "./demos/CopyDemo";
import copySource from "./demos/CopyDemo.tsx?raw";
import TriggerDemo from "./demos/TriggerDemo";
import triggerSource from "./demos/TriggerDemo.tsx?raw";
import PositionDemo from "./demos/PositionDemo";
import positionSource from "./demos/PositionDemo.tsx?raw";
import ClosableDemo from "./demos/ClosableDemo";
import closableSource from "./demos/ClosableDemo.tsx?raw";

export interface PopoverDemoDefinition { id: string; title: string; description: ReactNode; component: ComponentType; source: string; }

export const popoverDemos: readonly PopoverDemoDefinition[] = [
  { id: "popover-basic", title: "基础用法", description: "鼠标移入或点击，弹出气泡，可对浮层上元素进行操作，承载复杂内容和操作。", component: BasicDemo, source: basicSource },
  { id: "popover-copy", title: "文字与复制", description: "深色气泡中展示文字和可点击的复制图标，按钮继承浮层文字颜色。", component: CopyDemo, source: copySource },
  { id: "popover-trigger", title: "触发方式", description: createElement("span", null, "通过设置 ", createElement("code", null, "trigger"), "，可以指定不同的触发方式。"), component: TriggerDemo, source: triggerSource },
  { id: "popover-position", title: "位置", description: createElement("span", null, createElement("code", null, "Popover"), " 支持 12 个不同的方位。分别为：上左 上 上右 下左 下 下右 左上 左 左下 右上 右 右下。"), component: PositionDemo, source: positionSource },
  { id: "popover-closable", title: "浮层内关闭", description: "控制浮层显示。", component: ClosableDemo, source: closableSource },
];
