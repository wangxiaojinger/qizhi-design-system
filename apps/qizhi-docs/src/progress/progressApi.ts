import type { ProgressProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type ProgressApiItem = ComponentApiItem<keyof ProgressProps>;

export const progressApi = [
  { name: "percent", description: "进度值，渲染时限制在 0 到 100。", type: "number", defaultValue: "0" },
  { name: "type", description: "进度条类型。", type: '"line" | "circle"', defaultValue: '"line"' },
  { name: "status", description: "状态色与状态图标。", type: '"normal" | "warning" | "danger" | "success"', defaultValue: '"normal"' },
  { name: "size", description: "组件尺寸；`mini` 仅用于环形。", type: '"small" | "default" | "large" | "mini"', defaultValue: '"default"' },
  { name: "color", description: "自定义颜色或渐变停靠点，优先于 `status`。", type: "string | Record<number, string>", defaultValue: "—" },
  { name: "trailColor", description: "未完成轨道的颜色。", type: "string", defaultValue: "—" },
  { name: "animation", description: "开启线形进度的动画效果。", type: "boolean", defaultValue: "false" },
  { name: "steps", description: "将线形进度分为指定正整数段。", type: "number", defaultValue: "—" },
  { name: "stepWidth", description: "固定步骤段宽，并使组件宽度自适应内容。", type: "number", defaultValue: "—" },
  { name: "strokeWidth", description: "覆盖轨道和进度的粗细。", type: "number", defaultValue: "由 size 决定" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根元素内联样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "ref", description: "指向根 `HTMLDivElement` 元素。", type: "Ref<HTMLDivElement>", defaultValue: "—" },
] as const satisfies readonly ProgressApiItem[];
