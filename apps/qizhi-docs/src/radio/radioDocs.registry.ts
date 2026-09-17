import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import GroupDemo from "./demos/GroupDemo";
import groupSource from "./demos/GroupDemo.tsx?raw";
import OutlineButtonDemo from "./demos/OutlineButtonDemo";
import outlineButtonSource from "./demos/OutlineButtonDemo.tsx?raw";

export interface RadioDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const radioDemos: readonly RadioDemoDefinition[] = [
  { id: "单选框-基础用法", title: "基础用法", description: "基础单选框。", component: BasicDemo, source: basicSource },
  { id: "单选框-单选框组", title: "单选框组", description: "单选组的用法。有两种用法，可以通过 children 的方式或者 options 数组的方式。", component: GroupDemo, source: groupSource },
  { id: "单选框-线框型单选按钮组", title: "线框型单选按钮组", description: "指定 type=\"button\"，单选框会展示为线框按钮样式。", component: OutlineButtonDemo, source: outlineButtonSource },
];
