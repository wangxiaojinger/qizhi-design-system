import type { TimelineItemProps, TimelineProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type TimelineApiItem = ComponentApiItem<keyof TimelineProps>;
type TimelineItemApiItem = ComponentApiItem<keyof TimelineItemProps>;

export const timelineApi = [
  { name: "children", description: "时间轴节点。", type: "ReactNode", defaultValue: "—" },
  { name: "direction", description: "时间轴方向。", type: '"vertical" | "horizontal"', defaultValue: '"vertical"' },
  { name: "mode", description: "纵向时间轴内容位置；横向时降级为默认布局。", type: '"left" | "right" | "alternate"', defaultValue: '"left"' },
  { name: "reverse", description: "倒序渲染节点。", type: "boolean", defaultValue: "false" },
  { name: "labelPosition", description: "标签位于内容之后或之前。", type: '"same" | "relative"', defaultValue: '"same"' },
  { name: "pending", description: "追加幽灵节点内容。", type: "ReactNode", defaultValue: "—" },
  { name: "pendingDot", description: "幽灵节点的自定义轴点。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly TimelineApiItem[];

export const timelineItemApi = [
  { name: "children", description: "节点主要内容。", type: "ReactNode", defaultValue: "—" },
  { name: "label", description: "节点标签。", type: "ReactNode", defaultValue: "—" },
  { name: "description", description: "节点补充说明。", type: "ReactNode", defaultValue: "—" },
  { name: "dot", description: "自定义轴点，优先级高于 dotColor 和 dotType。", type: "ReactNode", defaultValue: "—" },
  { name: "dotColor", description: "默认轴点颜色。", type: "string", defaultValue: "primary-6" },
  { name: "dotType", description: "默认轴点类型。", type: '"solid" | "hollow"', defaultValue: '"hollow"' },
  { name: "lineType", description: "连接轴线样式。", type: '"solid" | "dashed"', defaultValue: '"solid"' },
  { name: "position", description: "交替模式中的单节点位置。", type: '"left" | "right"', defaultValue: "—" },
  { name: "className", description: "节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "节点内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly TimelineItemApiItem[];

