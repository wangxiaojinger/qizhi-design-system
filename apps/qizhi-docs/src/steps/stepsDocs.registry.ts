import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import DescriptionDemo from "./demos/DescriptionDemo";
import descriptionSource from "./demos/DescriptionDemo.tsx?raw";
import ErrorDemo from "./demos/ErrorDemo";
import errorSource from "./demos/ErrorDemo.tsx?raw";
import SmallDemo from "./demos/SmallDemo";
import smallSource from "./demos/SmallDemo.tsx?raw";
import SwitchDemo from "./demos/SwitchDemo";
import switchSource from "./demos/SwitchDemo.tsx?raw";

export interface StepsDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const stepsDemos: readonly StepsDemoDefinition[] = [
  {
    id: "步骤条-基础用法",
    title: "基础用法",
    description: "这是步骤条组件的基础用法。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "步骤条-小型步骤条",
    title: "小型步骤条",
    description: "小型步骤条适合信息密度较高或空间有限的场景。",
    component: SmallDemo,
    source: smallSource,
  },
  {
    id: "步骤条-展示描述信息",
    title: "展示描述信息",
    description: "步骤内容需要补充说明时，可在标题下展示描述信息。",
    component: DescriptionDemo,
    source: descriptionSource,
  },
  {
    id: "步骤条-步骤错误",
    title: "步骤错误",
    description: "通过错误状态标识当前未能完成的步骤。",
    component: ErrorDemo,
    source: errorSource,
  },
  {
    id: "步骤条-步骤切换",
    title: "步骤切换",
    description: "通过改变当前步骤，可以在任务流程中前进或后退。",
    component: SwitchDemo,
    source: switchSource,
  },
];
