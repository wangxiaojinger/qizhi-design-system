import type { DescriptionsItemProps, DescriptionsProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type DescriptionsApiItem = ComponentApiItem<Extract<keyof DescriptionsProps, string>>;
type DescriptionsItemApiItem = ComponentApiItem<Extract<keyof DescriptionsItemProps, string>>;

export const descriptionsApi = [
  { name: "children", description: "由 `Descriptions.Item` 组成的字段内容。", type: "ReactNode", defaultValue: "—" },
  { name: "title", description: "描述列表标题；未提供时不渲染标题区域。", type: "ReactNode", defaultValue: "—" },
  { name: "layout", description: "控制标签和值水平同排或垂直排列；垂直排列不显示冒号。", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"' },
  { name: "labelAlign", description: "控制水平布局中的标签左对齐或右对齐；垂直布局固定左对齐。", type: '"left" | "right"', defaultValue: '"left"' },
  { name: "className", description: "Descriptions 根节点的附加类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "Descriptions 根节点的内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly DescriptionsApiItem[];

export const descriptionsItemApi = [
  { name: "label", description: "字段标签，支持 React 内容；水平布局由组件补充冒号。", type: "ReactNode", defaultValue: "必填" },
  { name: "children", description: "字段值，支持文本或正式 QIZHI React 组件。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "Descriptions.Item 根节点的附加类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "Descriptions.Item 根节点的内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly DescriptionsItemApiItem[];
