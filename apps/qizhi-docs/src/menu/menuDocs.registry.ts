import type { ComponentType } from "react";
import SideMenuDemo from "./demos/SideMenuDemo";
import sideMenuSource from "./demos/SideMenuDemo.tsx?raw";
import TopNavigationDemo from "./demos/TopNavigationDemo";
import topNavigationSource from "./demos/TopNavigationDemo.tsx?raw";

export interface MenuDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const menuDemos: readonly MenuDemoDefinition[] = [
  {
    id: "顶部导航菜单",
    title: "顶部导航栏",
    description:
      "设置 mode 为 horizontal 时，使用水平菜单；仅当导航项无法在当前可用空间内完整展示时出现“更多”，空间恢复后自动展开全部导航项。",
    component: TopNavigationDemo,
    source: topNavigationSource,
  },
  {
    id: "左侧菜单",
    title: "左侧菜单",
    description:
      "菜单内可以嵌入多个子项，通过 defaultOpenKeys 可以设置默认打开的子项。",
    component: SideMenuDemo,
    source: sideMenuSource,
  },
];
