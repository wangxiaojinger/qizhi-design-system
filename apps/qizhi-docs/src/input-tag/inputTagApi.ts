import type { ComponentApiItem } from "../api/ApiTable";
import type { InputTagProps } from "@wangxiaojinger/qizhi-react";

type InputTagApiItem = ComponentApiItem<keyof InputTagProps | "ref">;

export const inputTagApi = [
  { name: "value", description: "受控标签数组。", type: "InputTagValue[]", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始标签数组。", type: "InputTagValue[]", defaultValue: "[]" },
  { name: "onChange", description: "标签数组变化时触发。", type: "(value: InputTagValue[]) => void", defaultValue: "—" },
  { name: "labelInValue", description: "是否同时保留标签文本和值。", type: "boolean", defaultValue: "false" },
  { name: "size", description: "标签输入框尺寸。", type: '"small" | "default" | "large"', defaultValue: '"default"' },
  { name: "placeholder", description: "无标签且输入为空时的提示文字。", type: "string", defaultValue: '"请输入标签"' },
  { name: "allowClear", description: "有内容时是否显示清空按钮。", type: "boolean", defaultValue: "true" },
  { name: "onClear", description: "点击清空按钮时触发。", type: "() => void", defaultValue: "—" },
  { name: "validate", description: "校验输入；返回非布尔值时将其作为标签值。", type: "(input: string, value: InputTagValue[]) => boolean | InputTagValue", defaultValue: "—" },
  { name: "saveOnBlur", description: "失焦时是否保存当前输入。", type: "boolean", defaultValue: "false" },
  { name: "tokenSeparators", description: "触发提交的分隔符；Enter 始终提交。", type: "string[]", defaultValue: '[","]' },
  { name: "maxTagCount", description: "固定或响应式控制可见标签数量。", type: 'number | "responsive"', defaultValue: "—" },
  { name: "renderMore", description: "自定义被隐藏标签的摘要内容。", type: "(hiddenCount: number) => ReactNode", defaultValue: "—" },
  { name: "className", description: "根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "ref", description: "转发至内部原生输入框。", type: "Ref<HTMLInputElement>", defaultValue: "—" },
] as const satisfies readonly InputTagApiItem[];
