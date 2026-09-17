import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import ClosableDemo from "./demos/ClosableDemo";
import closableSource from "./demos/ClosableDemo.tsx?raw";
import CustomIconDemo from "./demos/CustomIconDemo";
import customIconSource from "./demos/CustomIconDemo.tsx?raw";
import HooksDemo from "./demos/HooksDemo";
import hooksSource from "./demos/HooksDemo.tsx?raw";
import ManualCloseDemo from "./demos/ManualCloseDemo";
import manualCloseSource from "./demos/ManualCloseDemo.tsx?raw";
import TypesDemo from "./demos/TypesDemo";
import typesSource from "./demos/TypesDemo.tsx?raw";
import UpdateDemo from "./demos/UpdateDemo";
import updateSource from "./demos/UpdateDemo.tsx?raw";

export type MessageDescriptionPart = string | { code: string } | { strong: string };
export interface MessageDemoDefinition {
  id: string;
  title: string;
  description: readonly MessageDescriptionPart[];
  descriptionText: string;
  component: ComponentType;
  tsxSource: string;
}
const code = (value: string) => ({ code: value });
const strong = (value: string) => ({ strong: value });
const text = (parts: readonly MessageDescriptionPart[]) => parts.map((part) => (
  typeof part === "string" ? part : "code" in part ? part.code : part.strong
)).join("");
const demo = (id: string, title: string, description: readonly MessageDescriptionPart[], component: ComponentType, tsxSource: string): MessageDemoDefinition => ({ id, title, description, descriptionText: text(description), component, tsxSource });

export const messageDemos: readonly MessageDemoDefinition[] = [
  demo("全局提示-基础用法", "基础用法", ["最简单的例子。"], BasicDemo, basicSource),
  demo("全局提示-不同类型", "不同类型", ["全局提示有 5 种不同的类型，分别为：", code("info"), "、", code("success"), "、", code("warning"), "、", code("error"), "、", code("normal"), "。"], TypesDemo, typesSource),
  demo("全局提示-自定义图标", "自定义图标", ["设置 ", code("icon"), " 来自定义图标。"], CustomIconDemo, customIconSource),
  demo("全局提示-更新全局提醒内容", "更新全局提醒内容", ["通过指定 ", code("id"), "，可以更新已经存在的全局提示。"], UpdateDemo, updateSource),
  demo("全局提示-手动控制关闭", "手动控制关闭", [code("Message.xxx()"), " 会返回一个函数，调用此函数能手动关闭通知。"], ManualCloseDemo, manualCloseSource),
  demo("全局提示-显示关闭按钮", "显示关闭按钮", ["设置 ", code("closable"), " 来显示关闭按钮。"], ClosableDemo, closableSource),
  demo("全局提示-hooks-用法", "Hooks 用法", ["可以通过 ", code("useMessage"), strong("（2.40.0）"), " 创建可以读取 context 的全局提示。\n", "通过 ", code("useMessage"), " 渲染的提示挂载在 ", code("contextHolder"), " 所在位置，无法通过 ", code("getContainer()"), " 修改容器。"], HooksDemo, hooksSource),
];
