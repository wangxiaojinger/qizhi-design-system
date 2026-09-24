import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import LayoutDemo from "./demos/LayoutDemo";
import layoutSource from "./demos/LayoutDemo.tsx?raw";
import ControlledDemo from "./demos/ControlledDemo";
import controlledSource from "./demos/ControlledDemo.tsx?raw";
import ValidationLoopDemo from "./demos/ValidationLoopDemo";
import validationLoopSource from "./demos/ValidationLoopDemo.tsx?raw";
import ComplexFieldsDemo from "./demos/ComplexFieldsDemo";
import complexFieldsSource from "./demos/ComplexFieldsDemo.tsx?raw";

export interface FormDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const formDemos: readonly FormDemoDefinition[] = [
  {
    id: "表单-基础用法",
    title: "基础用法",
    description: "非受控模式的基础用法，表单项采用垂直布局。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "表单-表单布局",
    title: "表单布局",
    description: "Form 支持垂直和水平两种排列方式。",
    component: LayoutDemo,
    source: layoutSource,
  },
  {
    id: "表单-受控表单",
    title: "受控表单",
    description: "表单统一收集和更新各表单项的值。",
    component: ControlledDemo,
    source: controlledSource,
  },
  {
    id: "表单-业务校验闭环",
    title: "业务校验闭环",
    description: "演示前端校验、提交、后端字段错误回填以及修改后清除错误的完整链路。",
    component: ValidationLoopDemo,
    source: validationLoopSource,
  },
  {
    id: "表单-复杂表单联动",
    title: "复杂表单联动",
    description: "演示嵌套字段、依赖校验、条件字段保留策略和动态成员列表。",
    component: ComplexFieldsDemo,
    source: complexFieldsSource,
  },
];
