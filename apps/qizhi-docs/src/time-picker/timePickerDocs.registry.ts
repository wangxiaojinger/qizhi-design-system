import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import ControlledDemo from "./demos/ControlledDemo";
import controlledSource from "./demos/ControlledDemo.tsx?raw";
import DisabledDemo from "./demos/DisabledDemo";
import disabledSource from "./demos/DisabledDemo.tsx?raw";
import FormatDemo from "./demos/FormatDemo";
import formatSource from "./demos/FormatDemo.tsx?raw";
import RangeDemo from "./demos/RangeDemo";
import rangeSource from "./demos/RangeDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";
import StatusDemo from "./demos/StatusDemo";
import statusSource from "./demos/StatusDemo.tsx?raw";
import StepDemo from "./demos/StepDemo";
import stepSource from "./demos/StepDemo.tsx?raw";

export type TimePickerDescriptionPart = string | { code: string };
export interface TimePickerDemoDefinition {
  id: string;
  title: string;
  descriptions: readonly (readonly TimePickerDescriptionPart[])[];
  component: ComponentType;
  tsxSource: string;
}

const code = (value: string): TimePickerDescriptionPart => ({ code: value });
const demo = (
  id: string,
  title: string,
  descriptions: readonly (readonly TimePickerDescriptionPart[])[],
  component: ComponentType,
  tsxSource: string,
): TimePickerDemoDefinition => ({ id, title, descriptions, component, tsxSource });

export const timePickerDemos: readonly TimePickerDemoDefinition[] = [
  demo("时间选择器-基础用法", "基础用法", [["时间输入器的基础用法。"]], BasicDemo, basicSource),
  demo("时间选择器-范围选择器", "范围选择器", [["时间输入器的范围选择器。"]], RangeDemo, rangeSource),
  demo("时间选择器-不同状态", "不同状态", [["不同状态的时间输入器。"]], StatusDemo, statusSource),
  demo("时间选择器-受控组件", "受控组件", [[code("value"), " 和 ", code("onChange"), " 需要配合使用。"]], ControlledDemo, controlledSource),
  demo("时间选择器-不同尺寸", "不同尺寸", [["有四种尺寸可供选择。"]], SizeDemo, sizeSource),
  demo("时间选择器-禁用", "禁用", [["禁用状态下不可输入和选择。"]], DisabledDemo, disabledSource),
  demo("时间选择器-定制时分", "定制时分", [["通过设置 ", code("format"), "，可以定制需要显示的时、分、秒。"]], FormatDemo, formatSource),
  demo("时间选择器-定制步长", "定制步长", [["通过设置 ", code("step"), "，可以定制需要显示的时、分、秒的步长。"]], StepDemo, stepSource),
];
