import type { InputNumberProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type InputNumberApiItem = ComponentApiItem<keyof InputNumberProps | "ref">;

export const inputNumberApi = [
  { name: "value", description: "受控数值；严格模式使用字符串。", type: "number | string", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始数值。", type: "number | string", defaultValue: "—" },
  { name: "onChange", description: "数值变化时触发；空值返回 undefined。", type: "(value: number | string | undefined) => void", defaultValue: "—" },
  { name: "min", description: "最小值；未设置时不限制。", type: "number | string", defaultValue: "—" },
  { name: "max", description: "最大值；未设置时不限制。", type: "number | string", defaultValue: "—" },
  { name: "step", description: "每次增加或减少的步长。", type: "number | string", defaultValue: "1" },
  { name: "precision", description: "显示精度，不低于 step 的小数位数。", type: "number", defaultValue: "—" },
  { name: "mode", description: "内嵌步进或左右按钮模式。", type: '"embed" | "button"', defaultValue: '"embed"' },
  { name: "controls", description: "设置内嵌步进器在悬浮时、始终或不显示。", type: '"hover" | "always" | "hidden"', defaultValue: '"hover"' },
  { name: "size", description: "数字输入框尺寸。", type: '"small" | "default" | "large"', defaultValue: '"default"' },
  { name: "disabled", description: "禁用输入和步进。", type: "boolean", defaultValue: "false" },
  { name: "readOnly", description: "只读时可聚焦但不可修改。", type: "boolean", defaultValue: "false" },
  { name: "placeholder", description: "输入为空时的提示文字。", type: "string", defaultValue: "—" },
  { name: "prefix", description: "输入值前的内容。", type: "ReactNode", defaultValue: "—" },
  { name: "suffix", description: "输入值后的内容。", type: "ReactNode", defaultValue: "—" },
  { name: "formatter", description: "将数值转换为展示文本，并提供输入中状态。", type: "(value, info) => string", defaultValue: "—" },
  { name: "parser", description: "将展示文本还原为可计算值。", type: "(displayValue: string) => number | string", defaultValue: "—" },
  { name: "strictMode", description: "使用字符串进行高精度十进制计算。", type: "boolean", defaultValue: "false" },
  { name: "className", description: "根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "ref", description: "转发至内部原生输入框。", type: "Ref<HTMLInputElement>", defaultValue: "—" },
] as const satisfies readonly InputNumberApiItem[];
