import type { TagProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type TagApiItem = ComponentApiItem<keyof TagProps>;

export const tagApi = [
  { name: "children", description: "标签的文本或自定义内容。", type: "ReactNode", defaultValue: "—" },
  { name: "icon", description: "内容前的图标，继承当前标签文字色。", type: "ReactNode", defaultValue: "—" },
  { name: "size", description: "高度分别为 20px、24px、28px 和 32px。", type: '"small" | "default" | "medium" | "large"', defaultValue: '"default"' },
  { name: "color", description: "使用 QIZHI 预设色名或合法 CSS 颜色。", type: "TagPresetColor | string", defaultValue: "—" },
  { name: "bordered", description: "使用白底和对应颜色的边框样式。", type: "boolean", defaultValue: "false" },
  { name: "closable", description: "显示关闭按钮；非受控状态下点击后隐藏标签。", type: "boolean", defaultValue: "false" },
  { name: "visible", description: "受控显示或隐藏标签。", type: "boolean", defaultValue: "true" },
  { name: "closeAriaLabel", description: "关闭按钮的无障碍名称。", type: "string", defaultValue: '"关闭标签"' },
  { name: "onClose", description: "点击关闭按钮时触发；受控显示状态由调用方更新。", type: "(event: MouseEvent<HTMLButtonElement>) => void", defaultValue: "—" },
  { name: "checkable", description: "开启鼠标、Enter 和 Space 可切换的选择行为。", type: "boolean", defaultValue: "false" },
  { name: "checked", description: "受控选中状态，仅在 checkable 时生效。", type: "boolean", defaultValue: "—" },
  { name: "defaultChecked", description: "非受控初始选中状态，仅在 checkable 时生效。", type: "boolean", defaultValue: "false" },
  { name: "onChange", description: "可选中标签状态变化时触发，返回下一选中状态和原始事件。", type: "(checked: boolean, event: TagChangeEvent) => void", defaultValue: "—" },
  { name: "className", description: "标签根节点的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "标签根节点的内联样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "onClick", description: "点击标签时触发；开启 checkable 后，在选中状态切换之后调用。", type: "MouseEventHandler<HTMLSpanElement>", defaultValue: "—" },
] as const satisfies readonly TagApiItem[];
