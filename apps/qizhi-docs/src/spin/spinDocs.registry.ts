import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import ContainerDemo from "./demos/ContainerDemo";
import containerSource from "./demos/ContainerDemo.tsx?raw";
import CustomIconDemo from "./demos/CustomIconDemo";
import customIconSource from "./demos/CustomIconDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";
import TipDemo from "./demos/TipDemo";
import tipSource from "./demos/TipDemo.tsx?raw";

export interface SpinDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const spinDemos: readonly SpinDemoDefinition[] = [
  {
    id: "Spin-基础用法",
    title: "基础用法",
    description: "一个简单的加载中状态。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "Spin-容器中",
    title: "在容器中",
    description: "可以给任意元素添加加载状态。容器默认采用行内块布局，需要撑满父级时可设置为块级布局。",
    component: ContainerDemo,
    source: containerSource,
  },
  {
    id: "Spin-自定义描述文案",
    title: "自定义描述文案",
    description: "通过 tip 字段自定义加载时的文案。",
    component: TipDemo,
    source: tipSource,
  },
  {
    id: "Spin-自定义指示符",
    title: "自定义指示符",
    description: "通过指定 icon 可以使用自定义图标作为加载指示符。",
    component: CustomIconDemo,
    source: customIconSource,
  },
  {
    id: "Spin-不同尺寸",
    title: "不同尺寸",
    description: "设置 size 可以得到不同尺寸的加载图标。",
    component: SizeDemo,
    source: sizeSource,
  },
];
