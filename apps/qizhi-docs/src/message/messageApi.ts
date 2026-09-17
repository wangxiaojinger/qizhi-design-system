import type { MessageConfig, MessageGlobalConfig } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type MessageApiItem = ComponentApiItem<keyof MessageConfig>;
type ConfigApiItem = ComponentApiItem<keyof MessageGlobalConfig>;
export const messageApi = [
  { name: "content", description: "消息内容（必填）。", type: "ReactNode", defaultValue: "—" },
  { name: "closable", description: "是否显示关闭按钮。", type: "boolean", defaultValue: "false" },
  { name: "showIcon", description: "是否显示图标。", type: "boolean", defaultValue: "true" },
  { name: "duration", description: "自动关闭时间，单位为 ms；0 表示不自动关闭。", type: "number", defaultValue: "3000" },
  { name: "id", description: "唯一标识，相同 id 更新原消息。", type: "string", defaultValue: "—" },
  { name: "position", description: "消息位置。", type: '"top" | "bottom"', defaultValue: "top" },
  { name: "closeIcon", description: "自定义关闭图标。", type: "ReactNode", defaultValue: "—" },
  { name: "icon", description: "自定义消息图标。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "节点类名。", type: "string | string[]", defaultValue: "—" },
  { name: "style", description: "节点样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "onClose", description: "关闭后的回调。", type: "() => void", defaultValue: "—" },
] as const satisfies readonly MessageApiItem[];
export const messageConfigApi = [
  { name: "maxCount", description: "最大通知数量。", type: "number", defaultValue: "—" },
  { name: "getContainer", description: "放置通知的容器。", type: "() => HTMLElement", defaultValue: "() => document.body" },
  { name: "duration", description: "通知自动关闭时间。", type: "number", defaultValue: "3000" },
] as const satisfies readonly ConfigApiItem[];
