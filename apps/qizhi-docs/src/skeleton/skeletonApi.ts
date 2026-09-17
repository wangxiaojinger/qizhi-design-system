import type { SkeletonProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type SkeletonApiItem = ComponentApiItem<keyof SkeletonProps>;

export const skeletonApi = [
  { name: "animation", description: "是否显示骨架屏流光动画。", type: "boolean", defaultValue: "false" },
  { name: "image", description: "是否显示图像占位，或配置形状和尺寸。", type: "boolean | SkeletonImageConfig", defaultValue: "false" },
  { name: "text", description: "是否显示文本占位，或配置行数和每行宽度。", type: "boolean | SkeletonTextConfig", defaultValue: "true" },
  { name: "className", description: "根元素的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根元素的内联样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "ref", description: "指向根 `HTMLDivElement` 元素。", type: "Ref<HTMLDivElement>", defaultValue: "—" },
] as const satisfies readonly SkeletonApiItem[];
