import type { CheckboxGroupProps, CheckboxProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type CheckboxApiItem = ComponentApiItem<keyof CheckboxProps>;
export type CheckboxGroupApiItem = ComponentApiItem<keyof CheckboxGroupProps>;

export const checkboxApi = [
  { name: "children", description: "复选项的文字或自定义标签内容。", type: "ReactNode", defaultValue: "—" },
  { name: "value", description: "当前复选项的值；在 Group 中用于匹配组值。", type: "string | number", defaultValue: "—" },
  { name: "checked", description: "受控选中状态。", type: "boolean", defaultValue: "—" },
  { name: "defaultChecked", description: "非受控初始选中状态。", type: "boolean", defaultValue: "false" },
  { name: "indeterminate", description: "显示半选状态，并同步原生 input 的 indeterminate 属性。", type: "boolean", defaultValue: "false" },
  { name: "disabled", description: "禁用当前选项，禁用时不能聚焦或触发变更。", type: "boolean", defaultValue: "false" },
  { name: "onChange", description: "选中状态改变时返回下一状态和原生变更事件。", type: "(checked, event) => void", defaultValue: "—" },
  { name: "className", description: "复选项根 label 的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "复选项根 label 的内联样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "ref", description: "指向原生 `<input type=\"checkbox\">` 元素。", type: "Ref<HTMLInputElement>", defaultValue: "—" },
] as const satisfies readonly CheckboxApiItem[];

export const checkboxGroupApi = [
  { name: "children", description: "作为组成员的 Checkbox 子项；与 options 同时传入时优先。", type: "ReactNode", defaultValue: "—" },
  { name: "options", description: "使用值数组或包含 label、value、disabled 的对象数组批量生成选项；不包含 icon。", type: "readonly (CheckboxValue | CheckboxOption)[]", defaultValue: "—" },
  { name: "value", description: "受控的组内选中值集合。", type: "readonly CheckboxValue[]", defaultValue: "—" },
  { name: "defaultValue", description: "非受控的组内初始选中值集合。", type: "readonly CheckboxValue[]", defaultValue: "[]" },
  { name: "disabled", description: "禁用组内所有选项。", type: "boolean", defaultValue: "false" },
  { name: "direction", description: "设置组内选项横向换行或纵向排列。", type: '"horizontal" | "vertical"', defaultValue: "horizontal" },
  { name: "onChange", description: "组值改变时返回下一值集合和原生变更事件。", type: "(values, event) => void", defaultValue: "—" },
  { name: "className", description: "group 根节点的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "group 根节点的内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly CheckboxGroupApiItem[];
