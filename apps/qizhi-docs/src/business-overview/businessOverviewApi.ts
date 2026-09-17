import type {
  MetricCardProps,
  MetricItemProps,
  ObjectMetricsProps,
  ResourceUsageCardProps,
  TaskOverviewProps,
} from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type MetricCardApiItem = ComponentApiItem<keyof MetricCardProps>;
type ResourceUsageApiItem = ComponentApiItem<keyof ResourceUsageCardProps>;
type MetricItemApiItem = ComponentApiItem<keyof MetricItemProps>;
type ObjectMetricsApiItem = ComponentApiItem<keyof ObjectMetricsProps>;
type TaskOverviewApiItem = ComponentApiItem<keyof TaskOverviewProps>;

export const metricCardApi = [
  { name: "title", description: "业务类型名称。", type: "ReactNode", defaultValue: "—" },
  { name: "info", description: "业务类型的 Tooltip 说明。", type: "ReactNode", defaultValue: "—" },
  { name: "total", description: "业务对象总数。", type: "number | string", defaultValue: "—" },
  { name: "label", description: "主要状态名称。", type: "ReactNode", defaultValue: "—" },
  { name: "value", description: "主要状态数值。", type: "number | string", defaultValue: "—" },
  { name: "unit", description: "数值单位。", type: "ReactNode", defaultValue: '"个"' },
  { name: "selected", description: "是否为当前选中项。", type: "boolean", defaultValue: "false" },
  { name: "disabled", description: "是否禁用。", type: "boolean", defaultValue: "false" },
  { name: "onClick", description: "点击可用指标卡时触发。", type: "() => void", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies readonly MetricCardApiItem[];

export const resourceUsageCardApi = [
  { name: "title", description: "资源名称。", type: "ReactNode", defaultValue: "—" },
  { name: "value", description: "用量或容量数值。", type: "ReactNode", defaultValue: "—" },
  { name: "percent", description: "分配率，传入时展示进度。", type: "number", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies readonly ResourceUsageApiItem[];

export const metricItemApi = [
  { name: "label", description: "指标名称。", type: "ReactNode", defaultValue: "—" },
  { name: "value", description: "指标数值。", type: "ReactNode", defaultValue: "—" },
  { name: "info", description: "指标的 Tooltip 说明。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies readonly MetricItemApiItem[];

export const objectMetricsApi = [
  { name: "title", description: "业务对象名称。", type: "ReactNode", defaultValue: "—" },
  { name: "summaryLabel", description: "核心结论名称。", type: "ReactNode", defaultValue: "—" },
  { name: "summaryValue", description: "核心结论数值。", type: "ReactNode", defaultValue: "—" },
  { name: "children", description: "内部指标项。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies readonly ObjectMetricsApiItem[];

export const taskOverviewApi = [
  { name: "title", description: "组合面板标题。", type: "ReactNode", defaultValue: '"任务概览"' },
  { name: "metrics", description: "任务类型指标。", type: "readonly TaskOverviewMetric[]", defaultValue: "—" },
  { name: "tasks", description: "可筛选任务数据。", type: "readonly TaskOverviewTask[]", defaultValue: "—" },
  { name: "spaces", description: "空间筛选项。", type: "readonly string[]", defaultValue: "—" },
  { name: "defaultType", description: "默认任务类型。", type: "string", defaultValue: "—" },
  { name: "defaultSpace", description: "默认空间。", type: "string", defaultValue: '"全部"' },
  { name: "initialVisibleCount", description: "默认展示任务数。", type: "number", defaultValue: "4" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies readonly TaskOverviewApiItem[];
