import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import IconDemo from "./demos/IconDemo";
import iconSource from "./demos/IconDemo.tsx?raw";
import PositionDemo from "./demos/PositionDemo";
import positionSource from "./demos/PositionDemo.tsx?raw";
import TypeDemo from "./demos/TypeDemo";
import typeSource from "./demos/TypeDemo.tsx?raw";
import NoDividerDemo from "./demos/NoDividerDemo";
import noDividerSource from "./demos/NoDividerDemo.tsx?raw";
import ControlledDemo from "./demos/ControlledDemo";
import controlledSource from "./demos/ControlledDemo.tsx?raw";
import NestedDemo from "./demos/NestedDemo";
import nestedSource from "./demos/NestedDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";
import StickyDemo from "./demos/StickyDemo";
import stickySource from "./demos/StickyDemo.tsx?raw";
import DragDemo from "./demos/DragDemo";
import dragSource from "./demos/DragDemo.tsx?raw";
import ScrollDemo from "./demos/ScrollDemo";
import scrollSource from "./demos/ScrollDemo.tsx?raw";
import ScrollPositionDemo from "./demos/ScrollPositionDemo";
import scrollPositionSource from "./demos/ScrollPositionDemo.tsx?raw";

export interface TabsDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const tabsDemos: readonly TabsDemoDefinition[] = [
  {
    id: "标签页-基础用法",
    title: "基础用法",
    description: "最简单的使用。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "标签页-带图标的页签",
    title: "带图标的页签",
    description: "通过自定义 title，可以给页签添加图标。",
    component: IconDemo,
    source: iconSource,
  },
  {
    id: "标签页-位置",
    title: "位置",
    description: "通过 position 设置位置。",
    component: PositionDemo,
    source: positionSource,
  },
  {
    id: "标签页-不同类型",
    title: "不同类型",
    description: "使用 type 属性设置不同类型的页签。",
    component: TypeDemo,
    source: typeSource,
  },
  {
    id: "标签页-隐藏分割线",
    title: "隐藏分割线",
    description: "通过 showDivider 隐藏导航底部分割线，并保留当前项的选中下划线。",
    component: NoDividerDemo,
    source: noDividerSource,
  },
  {
    id: "标签页-受控模式",
    title: "受控模式",
    description: "通过 activeKey 开启受控模式。",
    component: ControlledDemo,
    source: controlledSource,
  },
  {
    id: "标签页-嵌套使用",
    title: "嵌套使用",
    description: "组件可以嵌套使用。",
    component: NestedDemo,
    source: nestedSource,
  },
  {
    id: "标签页-不同尺寸",
    title: "不同尺寸",
    description: "使用 size 属性设置不同尺寸的页签。",
    component: SizeDemo,
    source: sizeSource,
  },
  {
    id: "标签页-自定义选项卡头部",
    title: "自定义选项卡头部",
    description: "组合容器的 sticky 能力实现选项卡头部吸顶。",
    component: StickyDemo,
    source: stickySource,
  },
  {
    id: "标签页-可拖拽页签",
    title: "可拖拽页签",
    description: "通过受控 items 可以实现页签拖拽排序。",
    component: DragDemo,
    source: dragSource,
  },
  {
    id: "标签页-滚动",
    title: "滚动",
    description: "支持通过滚轮或者触摸板进行滚动操作。",
    component: ScrollDemo,
    source: scrollSource,
  },
  {
    id: "标签页-滚动偏移位置",
    title: "滚动偏移位置",
    description: "支持设置 scrollPosition 改变选中页签的滚动位置。",
    component: ScrollPositionDemo,
    source: scrollPositionSource,
  },
];
