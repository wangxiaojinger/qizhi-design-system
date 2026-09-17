import type { AlertProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type Item = ComponentApiItem<keyof AlertProps>;
export const alertApi = [
  { name: "content", description: "提示内容（必填）。", type: "ReactNode", defaultValue: "—" },
  { name: "title", description: "提示标题。", type: "ReactNode", defaultValue: "—" },
  { name: "type", description: "语义类型。", type: '"info" | "success" | "warning" | "error" | "neutral"', defaultValue: "info" },
  { name: "size", description: "尺寸。", type: '"small" | "default" | "large"', defaultValue: "default" },
  { name: "inline", description: "是否为紧凑行内风险提示。", type: "boolean", defaultValue: "false" },
  { name: "banner", description: "是否作为顶部公告。", type: "boolean", defaultValue: "false" },
  { name: "closable", description: "是否显示默认关闭按钮。", type: "boolean", defaultValue: "false" },
  { name: "showIcon", description: "是否显示图标。", type: "boolean", defaultValue: "true" },
  { name: "icon", description: "自定义提示图标。", type: "ReactNode", defaultValue: "—" },
  { name: "closeElement", description: "自定义关闭元素或接收 close 的渲染函数。", type: "ReactNode | ((close) => ReactNode)", defaultValue: "—" },
  { name: "onClose", description: "关闭后回调。", type: "() => void", defaultValue: "—" },
  { name: "className", description: "根节点类名。", type: "string", defaultValue: "—" },
] as const satisfies readonly Item[];
