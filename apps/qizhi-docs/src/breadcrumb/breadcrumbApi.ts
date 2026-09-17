import type {
  BreadcrumbItemProps,
  BreadcrumbProps,
} from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type BreadcrumbApiItem = ComponentApiItem<keyof BreadcrumbProps>;
export type BreadcrumbItemApiItem = ComponentApiItem<
  keyof BreadcrumbItemProps
>;

export const breadcrumbApi = [
  { name: "size", description: "面包屑的文字尺寸。", type: '"default" | "small"', defaultValue: '"default"' },
  { name: "separator", description: "相邻项目之间的分隔内容。", type: "ReactNode", defaultValue: '"/"' },
  { name: "children", description: "面包屑项目。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "根导航元素的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根导航元素的内联样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "ref", description: "指向根 `HTMLElement` 导航元素。", type: "Ref<HTMLElement>", defaultValue: "—" },
] as const satisfies readonly BreadcrumbApiItem[];

export const breadcrumbItemApi = [
  { name: "href", description: "项目的链接地址；提供后复用 QIZHI `Link`。", type: "string", defaultValue: "—" },
  { name: "current", description: "是否为当前页面。", type: "boolean", defaultValue: "false" },
  { name: "icon", description: "项目文字前的装饰图标。", type: "ReactNode", defaultValue: "—" },
  { name: "children", description: "项目内容。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "列表项的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "列表项的内联样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "ref", description: "指向根 `HTMLLIElement`。", type: "Ref<HTMLLIElement>", defaultValue: "—" },
] as const satisfies readonly BreadcrumbItemApiItem[];
