import type { ComponentType } from "react";
import AlignDemo from "./demos/AlignDemo";
import alignSource from "./demos/AlignDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";
import SplitDemo from "./demos/SplitDemo";
import splitSource from "./demos/SplitDemo.tsx?raw";
import VerticalDemo from "./demos/VerticalDemo";
import verticalSource from "./demos/VerticalDemo.tsx?raw";
import WrapDemo from "./demos/WrapDemo";
import wrapSource from "./demos/WrapDemo.tsx?raw";

export interface SpaceDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const spaceDemos: readonly SpaceDemoDefinition[] = [
  { id: "space-vertical", title: "垂直间距", description: "可以设置垂直方向排列的间距。", component: VerticalDemo, source: verticalSource },
  { id: "space-size", title: "尺寸", description: "内置 4 个尺寸：`mini - 4px`、`small - 8px（默认）`、`medium - 16px`、`large - 24px`，也支持自定义尺寸。", component: SizeDemo, source: sizeSource },
  { id: "space-align", title: "对齐", description: "内置 `start`、`center`、`end`、`baseline` 四种对齐方式，水平模式默认为 `center`。", component: AlignDemo, source: alignSource },
  { id: "space-wrap", title: "环绕间距", description: "环绕类型在水平与垂直方向都保留间距，适合内容自动换行的场景。", component: WrapDemo, source: wrapSource },
  { id: "space-split", title: "分隔符", description: "为相邻子元素设置分隔符。", component: SplitDemo, source: splitSource },
];
