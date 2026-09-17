import type { SwitchProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type SwitchApiItem = ComponentApiItem<keyof SwitchProps>;

export const switchApi = [
  { name: "checked", description: "受控的选中状态。", type: "boolean", defaultValue: "—" },
  { name: "defaultChecked", description: "非受控的初始选中状态。", type: "boolean", defaultValue: "false" },
  { name: "disabled", description: "设置禁用状态。", type: "boolean", defaultValue: "false" },
  { name: "loading", description: "设置加载状态，并阻止交互。", type: "boolean", defaultValue: "false" },
  { name: "size", description: "设置尺寸。", type: '"default" | "small"', defaultValue: "default" },
  { name: "checkedText", description: "选中时显示的文案。", type: "ReactNode", defaultValue: "—" },
  { name: "uncheckedText", description: "未选中时显示的文案。", type: "ReactNode", defaultValue: "—" },
  { name: "onChange", description: "状态改变时返回下一状态和原生点击事件。", type: "(checked, event) => void", defaultValue: "—" },
  { name: "className", description: "根按钮的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根按钮的内联样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "ref", description: "指向原生按钮元素。", type: "Ref<HTMLButtonElement>", defaultValue: "—" },
] as const satisfies readonly SwitchApiItem[];
