import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import DropdownDemo from "./demos/DropdownDemo";
import dropdownSource from "./demos/DropdownDemo.tsx?raw";
import HoverableDemo from "./demos/HoverableDemo";
import hoverableSource from "./demos/HoverableDemo.tsx?raw";
import IconDemo from "./demos/IconDemo";
import iconSource from "./demos/IconDemo.tsx?raw";
import StatusDemo from "./demos/StatusDemo";
import statusSource from "./demos/StatusDemo.tsx?raw";

export interface LinkDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const linkDemos: readonly LinkDemoDefinition[] = [
  { id: "基础用法", title: "基础用法", description: "与按钮相比，链接不太突出，因此通常将其用作可选操作。这里展示可点击与禁用两种链接状态。", component: BasicDemo, source: basicSource },
  { id: "其他状态", title: "其他状态", description: "通过 status 表达默认、错误、成功和警告状态；disabled 的视觉与行为优先级最高。", component: StatusDemo, source: statusSource },
  { id: "图标", title: "图标", description: "icon 为 true 时显示默认链接图标，也可以传入自定义 ReactNode。", component: IconDemo, source: iconSource },
  { id: "悬浮状态样式", title: "悬浮状态样式", description: "通过 hoverable 控制悬浮时是否显示填充背景，不影响语义状态文字色。", component: HoverableDemo, source: hoverableSource },
  { id: "配合 Dropdown 使用", title: "配合 Dropdown 使用", description: "Link 可以作为 Dropdown 的按钮型触发器；禁用 Link 不触发菜单。", component: DropdownDemo, source: dropdownSource },
];
