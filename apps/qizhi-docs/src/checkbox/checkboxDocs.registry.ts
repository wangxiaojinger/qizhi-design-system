import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import ControlledDemo from "./demos/ControlledDemo";
import controlledSource from "./demos/ControlledDemo.tsx?raw";
import GroupDemo from "./demos/GroupDemo";
import groupSource from "./demos/GroupDemo.tsx?raw";
import CheckAllDemo from "./demos/CheckAllDemo";
import checkAllSource from "./demos/CheckAllDemo.tsx?raw";
import LayoutDemo from "./demos/LayoutDemo";
import layoutSource from "./demos/LayoutDemo.tsx?raw";

export interface CheckboxDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const checkboxDemos: readonly CheckboxDemoDefinition[] = [
  { id: "复选框-基础用法", title: "基础用法", description: "最基本的点击选中操作，包含禁用状态。", component: BasicDemo, source: basicSource },
  { id: "复选框-受控", title: "受控", description: "通过 checked 属性控制是否选中。", component: ControlledDemo, source: controlledSource },
  { id: "复选框-复选框组", title: "复选框组", description: "生成复选框组。设置 direction=\"vertical\" 可以展示竖向的复选框组。", component: GroupDemo, source: groupSource },
  { id: "复选框-全选", title: "全选", description: "通过 indeterminate 属性可以实现半选效果。", component: CheckAllDemo, source: checkAllSource },
  { id: "复选框-布局", title: "布局", description: "可以通过 children 传入 Checkbox，配合 CSS Grid 实现灵活的响应式布局。", component: LayoutDemo, source: layoutSource },
];
