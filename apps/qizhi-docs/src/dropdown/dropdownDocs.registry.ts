import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import PositionDemo from "./demos/PositionDemo";
import positionSource from "./demos/PositionDemo.tsx?raw";
import TriggerDemo from "./demos/TriggerDemo";
import triggerSource from "./demos/TriggerDemo.tsx?raw";
import EventDemo from "./demos/EventDemo";
import eventSource from "./demos/EventDemo.tsx?raw";
import ButtonDemo from "./demos/ButtonDemo";
import buttonSource from "./demos/ButtonDemo.tsx?raw";
import CascadeDemo from "./demos/CascadeDemo";
import cascadeSource from "./demos/CascadeDemo.tsx?raw";
import IconDemo from "./demos/IconDemo";
import iconSource from "./demos/IconDemo.tsx?raw";

export interface DropdownDemoDefinition { id: string; title: string; description: readonly string[]; component: ComponentType; source: string }
const demo = (id: string, title: string, description: string, component: ComponentType, source: string): DropdownDemoDefinition => ({ id, title, description: [description], component, source });
export const dropdownDemos: readonly DropdownDemoDefinition[] = [
  demo("下拉菜单-基础用法", "基础用法", "基础下拉菜单。", BasicDemo, basicSource),
  demo("下拉菜单-弹出方向", "弹出方向", "通过 position 支持指定 6 种弹出方位，分别是：top: 向上、tl: 左上、tr: 右上、bottom: 下方、bl: 左下（默认）、br: 右下。", PositionDemo, positionSource),
  demo("下拉菜单-触发方式", "触发方式", "通过 trigger 指定触发方式。", TriggerDemo, triggerSource),
  demo("下拉菜单-触发事件", "触发事件", "通过 Menu.onClickMenuItem 来为菜单指定点击菜单项时触发的回调函数。", EventDemo, eventSource),
  demo("下拉菜单-按钮下拉框", "按钮下拉框", "使用 <Dropdown.Button> 可以使用右边是额外的相关功能菜单的按钮。", ButtonDemo, buttonSource),
  demo("下拉菜单-多级菜单", "多级菜单", "带有多级菜单的下拉框。", CascadeDemo, cascadeSource),
  demo("下拉菜单-带图标的菜单", "带图标的菜单", "菜单项前可以添加图标。", IconDemo, iconSource),
];
