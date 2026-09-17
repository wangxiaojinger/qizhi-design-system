import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";
import TextDemo from "./demos/TextDemo";
import textSource from "./demos/TextDemo.tsx?raw";
import LoadingDemo from "./demos/LoadingDemo";
import loadingSource from "./demos/LoadingDemo.tsx?raw";

export interface SwitchDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const switchDemos: readonly SwitchDemoDefinition[] = [
  { id: "开关-基础用法", title: "基础用法", description: "最基础的应用，支持点击切换；同时展示禁用状态。", component: BasicDemo, source: basicSource },
  { id: "开关-不同尺寸的开关", title: "不同尺寸的开关", description: "默认尺寸高度为 24px，小号尺寸高度为 16px。", component: SizeDemo, source: sizeSource },
  { id: "开关-自定义文案", title: "自定义文案", description: "自定义开关打开或关闭时显示的文字。", component: TextDemo, source: textSource },
  { id: "开关-加载中", title: "加载中", description: "开关处于加载中状态时不可点击。", component: LoadingDemo, source: loadingSource },
];
