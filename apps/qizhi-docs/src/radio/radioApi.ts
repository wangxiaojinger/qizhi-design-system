import type { RadioGroupProps, RadioProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type RadioApiItem = ComponentApiItem<keyof RadioProps>;
export type RadioGroupApiItem = ComponentApiItem<keyof RadioGroupProps>;

export const radioApi = [
  { name: "children", description: "单选项的文字或自定义标签内容。", type: "ReactNode", defaultValue: "—" },
  { name: "value", description: "当前单选项的值；在 Group 中用于匹配组值。", type: "string | number", defaultValue: "—" },
  { name: "checked", description: "受控选中状态。", type: "boolean", defaultValue: "—" },
  { name: "defaultChecked", description: "非受控初始选中状态。", type: "boolean", defaultValue: "false" },
  { name: "disabled", description: "禁用当前选项，禁用时不能聚焦或触发变更。", type: "boolean", defaultValue: "false" },
  { name: "type", description: "使用标准圆形单选框或按钮型单选项。", type: '"radio" | "button"', defaultValue: "radio" },
  { name: "size", description: "按钮型高度为 28px、32px 或 36px。", type: '"small" | "default" | "large"', defaultValue: "default" },
  { name: "onChange", description: "当前项变为选中时返回选中状态、值和原生变更事件。", type: "(checked, value, event) => void", defaultValue: "—" },
  { name: "className", description: "单选项根 label 的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "单选项根 label 的内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly RadioApiItem[];

export const radioGroupApi = [
  { name: "children", description: "作为组成员的 Radio 子项；与 options 同时传入时优先。", type: "ReactNode", defaultValue: "—" },
  { name: "options", description: "使用值数组或包含 label、value、disabled 的对象数组批量生成选项。", type: "readonly (RadioValue | RadioOption)[]", defaultValue: "—" },
  { name: "value", description: "受控的组内选中值。", type: "string | number", defaultValue: "—" },
  { name: "defaultValue", description: "非受控的组内初始选中值。", type: "string | number", defaultValue: "—" },
  { name: "disabled", description: "禁用组内所有选项。", type: "boolean", defaultValue: "false" },
  { name: "type", description: "统一设置组内标准圆形或按钮型外观。", type: '"radio" | "button"', defaultValue: "radio" },
  { name: "size", description: "统一设置按钮型的 28px、32px 或 36px 高度。", type: '"small" | "default" | "large"', defaultValue: "default" },
  { name: "name", description: "组内原生 radio 共用的 name；未传入时自动生成。", type: "string", defaultValue: "自动生成" },
  { name: "onChange", description: "组内值改变时返回下一值和原生变更事件。", type: "(value, event) => void", defaultValue: "—" },
  { name: "className", description: "radiogroup 根节点的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "radiogroup 根节点的内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly RadioGroupApiItem[];
