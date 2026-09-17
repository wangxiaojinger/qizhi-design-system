import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import FrameworkPreviewDemo from "./demos/FrameworkPreviewDemo";
import frameworkPreviewSource from "./demos/FrameworkPreviewDemo.tsx?raw";
import LocaleProviderDemo from "./demos/LocaleProviderDemo";
import localeProviderSource from "./demos/LocaleProviderDemo.tsx?raw";

export interface LayoutDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const layoutDemos: readonly LayoutDemoDefinition[] = [
  {
    id: "layout-locale-provider",
    title: "全局语言",
    description: "通过 LocaleProvider 和 useLocale 让整棵应用共享中文与英文状态。",
    component: LocaleProviderDemo,
    source: localeProviderSource,
  },
  {
    id: "layout-basic",
    title: "基础用法",
    description: "典型的页面布局。上方展示 Header、Content、Footer 纵向结构，下方展示带 Sider 的复合结构。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "layout-framework-preview",
    title: "框架结构预览",
    description: "启智结构预览",
    component: FrameworkPreviewDemo,
    source: frameworkPreviewSource,
  },
];
