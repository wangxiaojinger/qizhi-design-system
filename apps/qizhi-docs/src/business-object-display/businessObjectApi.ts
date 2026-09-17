import type {
  BillingBudgetCardProps,
  FinancialModelCardProps,
  SkillServiceCardProps,
  MarketplaceModelCardProps,
  ProjectCardProps,
  ResourceSpecificationCardProps,
  TaskCardProps,
} from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type Api<T> = readonly ComponentApiItem<Extract<keyof T, string>>[];

export const taskCardApi = [
  { name: "name", description: "任务名称。", type: "ReactNode", defaultValue: "—" },
  { name: "space", description: "所属空间。", type: "ReactNode", defaultValue: "—" },
  { name: "resource", description: "资源规格。", type: "ReactNode", defaultValue: "—" },
  { name: "duration", description: "运行时长。", type: "ReactNode", defaultValue: "—" },
  { name: "status", description: "当前状态。", type: "ReactNode", defaultValue: "—" },
  { name: "icon", description: "任务图标。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies Api<TaskCardProps>;

export const marketplaceModelCardApi = [
  { name: "name", description: "模型名称。", type: "ReactNode", defaultValue: "—" },
  { name: "description", description: "模型能力描述。", type: "ReactNode", defaultValue: "—" },
  { name: "tags", description: "按固定区域展示的模型属性标签。", type: "readonly ReactNode[]", defaultValue: "[]" },
  { name: "preset", description: "预置能力标识。", type: "ReactNode", defaultValue: "—" },
  { name: "onViewDetails", description: "点击固定“查看详情”操作时触发。", type: "() => void", defaultValue: "—" },
  { name: "onQuickExperience", description: "点击固定“快速体验”操作时触发。", type: "() => void", defaultValue: "—" },
  { name: "onOnlineInference", description: "点击固定“在线推理”操作时触发。", type: "() => void", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies Api<MarketplaceModelCardProps>;

export const financialModelCardApi = [
  { name: "name", description: "模型名称。", type: "ReactNode", defaultValue: "—" },
  { name: "meta", description: "来源与时间等元数据。", type: "ReactNode", defaultValue: "—" },
  { name: "description", description: "模型能力描述。", type: "ReactNode", defaultValue: "—" },
  { name: "tags", description: "默认态展示的能力标签。", type: "readonly ReactNode[]", defaultValue: "[]" },
  { name: "onViewDetails", description: "点击固定“查看详情”操作时触发。", type: "() => void", defaultValue: "—" },
  { name: "onUse", description: "点击固定“去使用”操作时触发。", type: "() => void", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies Api<FinancialModelCardProps>;

export const skillServiceCardApi = [
  { name: "name", description: "Skill 名称。", type: "ReactNode", defaultValue: "—" },
  { name: "version", description: "Skill 版本。", type: "ReactNode", defaultValue: "—" },
  { name: "updatedAt", description: "更新时间。", type: "ReactNode", defaultValue: "—" },
  { name: "project", description: "所属项目。", type: "ReactNode", defaultValue: "—" },
  { name: "summary", description: "能力摘要与 Popover 全文。", type: "ReactNode", defaultValue: "—" },
  { name: "icon", description: "Skill 图标。", type: "ReactNode", defaultValue: "SkillServiceIcon" },
] as const satisfies Api<SkillServiceCardProps>;

export const projectCardApi = [
  { name: "name", description: "项目名称。", type: "string", defaultValue: "—" },
  { name: "englishName", description: "项目英文名。", type: "string", defaultValue: "—" },
  { name: "status", description: "项目或审批状态。", type: "ReactNode", defaultValue: "—" },
  { name: "tone", description: "状态语义色。", type: '"primary" | "success" | "danger" | "warning"', defaultValue: '"primary"' },
  { name: "rows", description: "项目信息与存储数据。", type: "readonly ProjectRow[]", defaultValue: "—" },
  { name: "members", description: "项目成员。", type: "readonly ProjectMember[]", defaultValue: "[]" },
  { name: "action", description: "资源申请或变更操作。", type: "CardAction", defaultValue: "—" },
  { name: "risk", description: "资源风险提示。", type: "ReactNode", defaultValue: "—" },
  { name: "riskLevel", description: "风险等级。", type: '"warning" | "danger"', defaultValue: '"warning"' },
  { name: "onOpen", description: "进入项目详情时触发。", type: "() => void", defaultValue: "—" },
  { name: "onManageMembers", description: "打开成员管理时触发。", type: "() => void", defaultValue: "—" },
] as const satisfies Api<ProjectCardProps>;

export const resourceSpecificationCardApi = [
  { name: "resourceModel", description: "资源型号。", type: "ReactNode", defaultValue: "—" },
  { name: "cpu", description: "CPU 可用量与总量。", type: "ResourceSpecificationMetric", defaultValue: "—" },
  { name: "memory", description: "内存可用量与总量。", type: "ResourceSpecificationMetric", defaultValue: "—" },
  { name: "gpu", description: "GPU 可用量与总量。", type: "ResourceSpecificationMetric", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies Api<ResourceSpecificationCardProps>;

export const billingBudgetCardApi = [
  { name: "model", description: "接入模型。", type: "ReactNode", defaultValue: "—" },
  { name: "instanceCount", description: "实例数。", type: "ReactNode", defaultValue: "—" },
  { name: "settlementMethod", description: "结算方式。", type: "ReactNode", defaultValue: "—" },
  { name: "settlementCycle", description: "结算周期。", type: "ReactNode", defaultValue: "—" },
  { name: "price", description: "费用数值。", type: "ReactNode", defaultValue: "—" },
  { name: "priceUnit", description: "费用单位。", type: "ReactNode", defaultValue: "—" },
  { name: "formula", description: "计费公式和补充说明。", type: "ReactNode", defaultValue: "—" },
  { name: "budget", description: "剩余预算。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies Api<BillingBudgetCardProps>;
