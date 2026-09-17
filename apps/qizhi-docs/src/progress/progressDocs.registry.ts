import type { ComponentType } from "react";
import AnimationDemo from "./demos/AnimationDemo";
import animationSource from "./demos/AnimationDemo.tsx?raw";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import CircleDemo from "./demos/CircleDemo";
import circleSource from "./demos/CircleDemo.tsx?raw";
import GradientDemo from "./demos/GradientDemo";
import gradientSource from "./demos/GradientDemo.tsx?raw";
import MiniDemo from "./demos/MiniDemo";
import miniSource from "./demos/MiniDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";
import StatusDemo from "./demos/StatusDemo";
import statusSource from "./demos/StatusDemo.tsx?raw";
import StepsDemo from "./demos/StepsDemo";
import stepsSource from "./demos/StepsDemo.tsx?raw";
import TrailDemo from "./demos/TrailDemo";
import trailSource from "./demos/TrailDemo.tsx?raw";

export interface ProgressDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const progressDemos: readonly ProgressDemoDefinition[] = [
  ["进度条-基本用法", "基本用法", "简单的进度条。", BasicDemo, basicSource],
  ["进度条-状态", "进度条状态", "可以通过设置 status 显示内置状态样式，color 的优先级高于 status。", StatusDemo, statusSource],
  ["进度条-环形进度条", "环形进度条", "type = circle 时，将会展示环形进度条。", CircleDemo, circleSource],
  ["进度条-微型进度条", "微型进度条", "size = mini 时，将会展示微型进度条。", MiniDemo, miniSource],
  ["进度条-不同尺寸", "不同尺寸", "设置 size 为 small、default、large，可设置小、中、大三种尺寸。", SizeDemo, sizeSource],
  ["进度条-动画效果", "动画效果", "设置 animation = true 时，将会显示动画效果，仅当 type = line 时生效。", AnimationDemo, animationSource],
  ["进度条-渐变色", "渐变色进度条", "color 传入对象时，会作为 linear-gradient 的属性值设置渐变色。", GradientDemo, gradientSource],
  ["进度条-步骤进度条", "步骤进度条", "可以通过设置 steps 展示步骤进度条。", StepsDemo, stepsSource],
  ["进度条-剩余进度条", "剩余进度条", "可以通过 trailColor 设置剩余进度条的颜色。", TrailDemo, trailSource],
].map(([id, title, description, component, source]) => ({
  id, title, description, component, source,
})) as readonly ProgressDemoDefinition[];
