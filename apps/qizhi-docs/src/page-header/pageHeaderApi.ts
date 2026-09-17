import type { PageHeaderProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type PageHeaderApiItem = ComponentApiItem<keyof PageHeaderProps>;

export const pageHeaderApi = [
  {
    name: "children",
    description: "页头欢迎语内容。",
    type: "ReactNode",
    defaultValue: "—",
  },
  {
    name: "className",
    description: "根页头元素的类名。",
    type: "string",
    defaultValue: "—",
  },
  {
    name: "style",
    description: "根页头元素的内联样式。",
    type: "CSSProperties",
    defaultValue: "—",
  },
  {
    name: "ref",
    description: "指向根 HTMLElement 页头元素。",
    type: "Ref<HTMLElement>",
    defaultValue: "—",
  },
] as const satisfies readonly PageHeaderApiItem[];
