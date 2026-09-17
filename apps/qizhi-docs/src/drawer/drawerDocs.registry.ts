import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import FormDemo from "./demos/FormDemo";
import formSource from "./demos/FormDemo.tsx?raw";

export interface DrawerDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  tsxSource: string;
}

export const drawerDemos: readonly DrawerDemoDefinition[] = [
  {
    id: "抽屉-基础用法",
    title: "基础用法",
    description: "基础抽屉，点击触发按钮抽屉从右侧滑出，点击遮罩区关闭。",
    component: BasicDemo,
    tsxSource: basicSource,
  },
  {
    id: "抽屉-表单",
    title: "抽屉表单",
    description: "在抽屉中承载创建表单，适合不中断主流程的复杂配置。",
    component: FormDemo,
    tsxSource: formSource,
  },
];
