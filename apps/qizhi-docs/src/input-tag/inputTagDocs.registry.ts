import type { ComponentType } from "react";
import cssSource from "./inputTagDemos.css?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";
import LabelInValueDemo from "./demos/LabelInValueDemo";
import labelSource from "./demos/LabelInValueDemo.tsx?raw";
import ValidateDemo from "./demos/ValidateDemo";
import validateSource from "./demos/ValidateDemo.tsx?raw";
import SaveOnBlurDemo from "./demos/SaveOnBlurDemo";
import saveSource from "./demos/SaveOnBlurDemo.tsx?raw";
import MaxTagCountDemo from "./demos/MaxTagCountDemo";
import maxSource from "./demos/MaxTagCountDemo.tsx?raw";
import ResponsiveDemo from "./demos/ResponsiveDemo";
import responsiveSource from "./demos/ResponsiveDemo.tsx?raw";

export interface InputTagDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  tsxSource: string;
  cssSource: string;
}

const demo = (
  id: string,
  title: string,
  description: string,
  component: ComponentType,
  tsxSource: string,
): InputTagDemoDefinition => ({ id, title, description, component, tsxSource, cssSource });

export const inputTagDemos: readonly InputTagDemoDefinition[] = [
  demo("标签输入框不同尺寸", "不同尺寸", "通过设置 size 来指定大小，标签输入框提供 small、default、large 三种尺寸，高度分别为 28px、32px、36px。", SizeDemo, sizeSource),
  demo("获取选项的文本", "获取选项的文本", "可以通过设置 labelInValue=true 获取选项的文本值。", LabelInValueDemo, labelSource),
  demo("校验与格式化输入", "校验与格式化输入", "通过 validate 校验输入，也可以返回非布尔类型来将用户输入的字符串格式化为特定值。", ValidateDemo, validateSource),
  demo("失焦时保存", "失焦时保存", "设置 saveOnBlur 在失焦时自动将正在输入的文本保存为标签。", SaveOnBlurDemo, saveSource),
  demo("最大标签数", "最大标签数", "通过 maxTagCount 设置最多展示的标签数，maxTagCount.render 自定义 +x 部分的节点内容。", MaxTagCountDemo, maxSource),
  demo("响应式显示Tag", "响应式显示标签", "通过 maxTagCount=responsive 设置根据容器尺寸动态显示标签数。标签数较多时不建议使用，可能存在性能问题。", ResponsiveDemo, responsiveSource),
];
