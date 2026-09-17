import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import DraggableBarDemo from "./demos/DraggableBarDemo";
import draggableSource from "./demos/DraggableBarDemo.tsx?raw";
import FormatterDemo from "./demos/FormatterDemo";
import formatterSource from "./demos/FormatterDemo.tsx?raw";
import InputDemo from "./demos/InputDemo";
import inputSource from "./demos/InputDemo.tsx?raw";
import MultipleDemo from "./demos/MultipleDemo";
import multipleSource from "./demos/MultipleDemo.tsx?raw";
import RangeDemo from "./demos/RangeDemo";
import rangeSource from "./demos/RangeDemo.tsx?raw";
import StatesDemo from "./demos/StatesDemo";
import statesSource from "./demos/StatesDemo.tsx?raw";
import TooltipVisibleDemo from "./demos/TooltipVisibleDemo";
import tooltipVisibleSource from "./demos/TooltipVisibleDemo.tsx?raw";
import VerticalDemo from "./demos/VerticalDemo";
import verticalSource from "./demos/VerticalDemo.tsx?raw";

export type SliderDescriptionPart = string | { code: string };

export interface SliderDemoDefinition {
  id: string;
  title: string;
  descriptions: readonly (readonly SliderDescriptionPart[])[];
  component: ComponentType;
  tsxSource: string;
}

const code = (value: string): SliderDescriptionPart => ({ code: value });
const demo = (
  id: string,
  title: string,
  descriptions: readonly (readonly SliderDescriptionPart[])[],
  component: ComponentType,
  tsxSource: string,
): SliderDemoDefinition => ({ id, title, descriptions, component, tsxSource });

export const sliderDemos: readonly SliderDemoDefinition[] = [
  demo("滑动输入条-基本用法", "基本用法", [["基本用法展示。"]], BasicDemo, basicSource),
  demo("滑动输入条-基础状态", "基础状态", [["默认态、禁用态。"]], StatesDemo, statesSource),
  demo("滑动输入条-范围选择", "范围选择", [["开启范围选择时，当前值为数组。"]], RangeDemo, rangeSource),
  demo("滑动输入条-多点选择", "多点选择", [["范围内多个点选择。"]], MultipleDemo, multipleSource),
  demo("滑动输入条-显示输入框", "显示输入框", [["滑动输入条可与数字输入框组合，支持单值和范围值同步输入。"]], InputDemo, inputSource),
  demo("滑动输入条-竖直滑动条", "竖直滑动条", [["设置 ", code("vertical"), " 为 ", code("true"), "，将会显示竖直的滑动条。"]], VerticalDemo, verticalSource),
  demo("滑动输入条-控制-tooltip-的展示", "控制 tooltip 的展示", [], TooltipVisibleDemo, tooltipVisibleSource),
  demo("滑动输入条-自定义提示", "自定义提示", [["使用 ", code("formatterTooltip"), " 可以格式化 Tooltip 的内容。"]], FormatterDemo, formatterSource),
  demo("滑动输入条-范围刻度可拖拽", "范围刻度可拖拽", [["通过设置 ", code("range.draggableBar"), " 为 ", code("true"), "，让范围刻度可以拖拽。"]], DraggableBarDemo, draggableSource),
];

