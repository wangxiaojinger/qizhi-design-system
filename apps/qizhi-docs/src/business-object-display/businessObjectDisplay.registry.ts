import type { ComponentType } from "react";
import BillingBudgetCardDemo from
  "./demos/BillingBudgetCardDemo";
import billingBudgetCardSource from
  "./demos/BillingBudgetCardDemo.tsx?raw";
import FinancialModelCardDemo from "./demos/FinancialModelCardDemo";
import financialModelCardSource from
  "./demos/FinancialModelCardDemo.tsx?raw";
import MarketplaceModelCardDemo from "./demos/MarketplaceModelCardDemo";
import marketplaceModelCardSource from
  "./demos/MarketplaceModelCardDemo.tsx?raw";
import SkillServiceCardDemo from "./demos/SkillServiceCardDemo";
import skillServiceCardSource from "./demos/SkillServiceCardDemo.tsx?raw";
import ProjectCardDemo from "./demos/ProjectCardDemo";
import projectCardSource from "./demos/ProjectCardDemo.tsx?raw";
import ResourceSpecificationCardDemo from
  "./demos/ResourceSpecificationCardDemo";
import resourceSpecificationCardSource from
  "./demos/ResourceSpecificationCardDemo.tsx?raw";
import TaskCardDemo from "./demos/TaskCardDemo";
import taskCardSource from "./demos/TaskCardDemo.tsx?raw";

export interface BusinessObjectDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const businessObjectDemos: readonly BusinessObjectDemoDefinition[] = [
  {
    id: "对象展示-任务卡",
    title: "任务卡",
    description:
      "展示任务名称、所属空间、资源规格、运行时长和当前状态；可作为独立对象卡使用，也可由任务概览等组合组件调用。",
    component: TaskCardDemo,
    source: taskCardSource,
  },
  {
    id: "对象展示-模型卡片",
    title: "模型卡片",
    description:
      "描述默认最多显示两行，悬浮或键盘聚焦时展示全文；已发布且支持在线推理的模型显示“预置推理”。",
    component: MarketplaceModelCardDemo,
    source: marketplaceModelCardSource,
  },
  {
    id: "对象展示-金融启智模型卡片",
    title: "金融启智模型卡片",
    description: "默认展示能力标签；悬浮或键盘聚焦后切换为主要操作。",
    component: FinancialModelCardDemo,
    source: financialModelCardSource,
  },
  {
    id: "对象展示-Skill服务卡",
    title: "Skill 服务卡",
    description:
      "用于展示可被模型或 Agent 调用的 Skill 服务，集中呈现 Skill 名称、版本、更新时间、所属项目与能力摘要。",
    component: SkillServiceCardDemo,
    source: skillServiceCardSource,
  },
  {
    id: "对象展示-项目卡",
    title: "项目卡",
    description:
      "展示项目身份、空间资源、审批状态、成员与快捷操作。不同业务状态复用同一张卡片，通过数据与状态属性切换。",
    component: ProjectCardDemo,
    source: projectCardSource,
  },
  {
    id: "对象展示-资源规格确认",
    title: "资源规格确认",
    description: "",
    component: ResourceSpecificationCardDemo,
    source: resourceSpecificationCardSource,
  },
  {
    id: "对象展示-计费规则费用预算卡片",
    title: "计费规则费用预算卡片",
    description: "",
    component: BillingBudgetCardDemo,
    source: billingBudgetCardSource,
  },
];
