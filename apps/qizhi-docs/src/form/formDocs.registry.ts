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
import RemoteBusinessDemo from "./demos/RemoteBusinessDemo";
import remoteBusinessSource from "./demos/RemoteBusinessDemo.tsx?raw";
import StepsDemo from "./demos/StepsDemo";
import stepsSource from "./demos/StepsDemo.tsx?raw";
import DraftDemo from "./demos/DraftDemo";
import draftSource from "./demos/DraftDemo.tsx?raw";
import AdvancedListDemo from "./demos/AdvancedListDemo";
import advancedListSource from "./demos/AdvancedListDemo.tsx?raw";
import BulkEditDemo from "./demos/BulkEditDemo";
import bulkEditSource from "./demos/BulkEditDemo.tsx?raw";

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
  {
    id: "表单-多步骤表单",
    title: "多步骤表单",
    description: "按步骤校验字段并保留跨步骤数据，提交失败时返回首个错误所在步骤。",
    component: StepsDemo,
    source: stepsSource,
  },
  {
    id: "表单-远程联动与未保存修改",
    title: "远程联动与未保存修改",
    description: "演示异步校验竞态、网络异常分流、远程查询四态、条件字段清理和未保存修改判断。",
    component: RemoteBusinessDemo,
    source: remoteBusinessSource,
  },
  {
    id: "表单-表单草稿",
    title: "表单草稿",
    description: "通过业务方提供的存储适配器保存和恢复指定字段，并处理版本、过期与并发冲突。",
    component: DraftDemo,
    source: draftSource,
  },
  {
    id: "表单-高级动态列表",
    title: "高级动态列表",
    description: "演示数量限制、列表与整行校验、批量新增以及嵌套列表状态迁移。",
    component: AdvancedListDemo,
    source: advancedListSource,
  },
  {
    id: "表单-批量编辑",
    title: "批量编辑",
    description: "演示混合值、仅提交改动字段、主动清空、部分失败回填以及失败记录重试。",
    component: BulkEditDemo,
    source: bulkEditSource,
  },
];
