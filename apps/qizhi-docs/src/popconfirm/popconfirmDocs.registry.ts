import type { ComponentType } from "react";
import AsyncDemo from "./demos/AsyncDemo";
import asyncSource from "./demos/AsyncDemo.tsx?raw";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import IconDemo from "./demos/IconDemo";
import iconSource from "./demos/IconDemo.tsx?raw";
import InternationalDemo from "./demos/InternationalDemo";
import internationalSource from "./demos/InternationalDemo.tsx?raw";
import PositionDemo from "./demos/PositionDemo";
import positionSource from "./demos/PositionDemo.tsx?raw";

export interface PopconfirmDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const popconfirmDemos: readonly PopconfirmDemoDefinition[] = [
  {
    id: "popconfirm-basic",
    title: "基础用法",
    description: "最基础的用法。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "popconfirm-international",
    title: "国际化",
    description: "自定义按钮文字。",
    component: InternationalDemo,
    source: internationalSource,
  },
  {
    id: "popconfirm-position",
    title: "位置",
    description: "气泡确认框复用 Tooltip 的 12 个方位：上左、上、上右、下左、下、下右、左上、左、左下、右上、右、右下。",
    component: PositionDemo,
    source: positionSource,
  },
  {
    id: "popconfirm-async",
    title: "异步关闭",
    description: "用于异步执行操作，等操作完成后再关闭气泡确认框。",
    component: AsyncDemo,
    source: asyncSource,
  },
  {
    id: "popconfirm-icon",
    title: "自定义图标",
    description: "可以替换默认图标，也可以隐藏图标。",
    component: IconDemo,
    source: iconSource,
  },
];
