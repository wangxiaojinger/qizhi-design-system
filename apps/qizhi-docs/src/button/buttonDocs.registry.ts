import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import DisabledDemo from "./demos/DisabledDemo";
import disabledSource from "./demos/DisabledDemo.tsx?raw";
import IconDemo from "./demos/IconDemo";
import iconSource from "./demos/IconDemo.tsx?raw";
import LoadingDemo from "./demos/LoadingDemo";
import loadingSource from "./demos/LoadingDemo.tsx?raw";
import LongDemo from "./demos/LongDemo";
import longSource from "./demos/LongDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";
import ShapeDemo from "./demos/ShapeDemo";
import shapeSource from "./demos/ShapeDemo.tsx?raw";
import StatusDemo from "./demos/StatusDemo";
import statusSource from "./demos/StatusDemo.tsx?raw";

export interface ButtonDemoDefinition { id: string; title: string; description: string; component: ComponentType; source: string; }

export const buttonDemos: readonly ButtonDemoDefinition[] = [
  { id: "基本用法", title: "基本用法", description: "按钮分为主要按钮、次要按钮、虚线按钮和文本按钮。次要按钮为中性线框样式，default 的视觉效果等同于 secondary。", component: BasicDemo, source: basicSource },
  { id: "图标按钮", title: "图标按钮", description: "Button 可以嵌入图标，在只设置图标而没有 children 时，按钮的高宽相等。", component: IconDemo, source: iconSource },
  { id: "按钮形状", title: "按钮形状", description: "普通按钮与纯图标按钮统一使用方形圆角。", component: ShapeDemo, source: shapeSource },
  { id: "按钮尺寸", title: "按钮尺寸", description: "按钮分为迷你、小、中、大四种尺寸，高度分别为 24px、28px、32px、36px。", component: SizeDemo, source: sizeSource },
  { id: "按钮状态", title: "按钮状态", description: "按钮状态分为 Warning、Danger、Success 三种，可以与按钮类型同时生效。", component: StatusDemo, source: statusSource },
  { id: "禁用按钮", title: "禁用按钮", description: "按钮的禁用状态。", component: DisabledDemo, source: disabledSource },
  { id: "加载中按钮", title: "加载中按钮", description: "通过设置 loading 可以让按钮处于加载中状态，且不会触发点击事件。", component: LoadingDemo, source: loadingSource },
  { id: "长按钮", title: "长按钮", description: "按钮宽度随着容器宽度进行适配。", component: LongDemo, source: longSource },
];
