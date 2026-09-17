import type { NotificationConfig, NotificationGlobalConfig } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type Item = ComponentApiItem<keyof NotificationConfig>;
type ConfigItem = ComponentApiItem<keyof NotificationGlobalConfig>;
export const notificationApi = [
  { name: "title", description: "通知标题（必填）。", type: "ReactNode", defaultValue: "—" },
  { name: "content", description: "通知内容。", type: "ReactNode", defaultValue: "—" },
  { name: "duration", description: "自动关闭时间，单位 ms；0 表示不关闭。", type: "number", defaultValue: "4500" },
  { name: "position", description: "通知位置。", type: '"topLeft" | "topRight" | "bottomLeft" | "bottomRight"', defaultValue: "topRight" },
  { name: "closable", description: "是否显示关闭按钮。", type: "boolean", defaultValue: "true" },
  { name: "showIcon", description: "是否显示图标。", type: "boolean", defaultValue: "true" },
  { name: "id", description: "唯一标识，相同 id 更新原通知。", type: "string", defaultValue: "—" },
  { name: "btn", description: "自定义操作按钮。", type: "ReactNode", defaultValue: "—" },
  { name: "icon", description: "自定义通知图标。", type: "ReactNode", defaultValue: "—" },
  { name: "closeIcon", description: "自定义关闭图标。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "节点类名。", type: "string | string[]", defaultValue: "—" },
  { name: "style", description: "节点样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "onClose", description: "关闭后的回调。", type: "() => void", defaultValue: "—" },
] as const satisfies readonly Item[];
export const notificationConfigApi = [
  { name: "maxCount", description: "最大通知数量。", type: "number", defaultValue: "—" },
  { name: "duration", description: "默认自动关闭时间。", type: "number", defaultValue: "4500" },
  { name: "getContainer", description: "通知挂载容器。", type: "() => HTMLElement", defaultValue: "() => document.body" },
] as const satisfies readonly ConfigItem[];
