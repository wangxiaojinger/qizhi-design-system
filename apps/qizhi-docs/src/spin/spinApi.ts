import type { SpinProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type SpinApiItem = ComponentApiItem<keyof SpinProps>;

export const spinApi = [
  { name: "loading", description: "是否显示加载指示符并禁用子内容交互。", type: "boolean", defaultValue: "true" },
  { name: "size", description: "加载指示符的像素尺寸。", type: "20 | 30 | 40", defaultValue: "20" },
  { name: "tip", description: "加载指示符下方的描述文案。", type: "ReactNode", defaultValue: "—" },
  { name: "icon", description: "替换默认 `LoadingIcon` 的自定义指示符。", type: "ReactNode", defaultValue: "<LoadingIcon />" },
  { name: "block", description: "容器模式下是否撑满父级可用宽度。", type: "boolean", defaultValue: "false" },
  { name: "children", description: "被加载遮罩覆盖的内容。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "根元素的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根元素的内联样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "ref", description: "指向根 `HTMLDivElement` 元素。", type: "Ref<HTMLDivElement>", defaultValue: "—" },
] as const satisfies readonly SpinApiItem[];
