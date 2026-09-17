import type { ComponentType } from "react";
import AffixDemo from "./demos/AffixDemo";
import affixSource from "./demos/AffixDemo.tsx?raw";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import ButtonModeDemo from "./demos/ButtonModeDemo";
import buttonModeSource from "./demos/ButtonModeDemo.tsx?raw";
import FormatterDemo from "./demos/FormatterDemo";
import formatterSource from "./demos/FormatterDemo.tsx?raw";
import PrecisionDemo from "./demos/PrecisionDemo";
import precisionSource from "./demos/PrecisionDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";
import StrictModeDemo from "./demos/StrictModeDemo";
import strictModeSource from "./demos/StrictModeDemo.tsx?raw";

export interface InputNumberDemoDefinition {
  id: string;
  title: string;
  descriptions: readonly (readonly InputNumberDescriptionPart[])[];
  component: ComponentType;
  tsxSource: string;
}

export type InputNumberDescriptionPart = string | { code: string };

const code = (value: string): InputNumberDescriptionPart => ({ code: value });

const demo = (
  id: string,
  title: string,
  descriptions: readonly (readonly InputNumberDescriptionPart[])[],
  component: ComponentType,
  tsxSource: string,
): InputNumberDemoDefinition => ({ id, title, descriptions, component, tsxSource });

export const inputNumberDemos: readonly InputNumberDemoDefinition[] = [
  demo("数字输入框-基础用法", "基础用法", [["通过鼠标或者键盘输入范围内的标准数值。"]], BasicDemo, basicSource),
  demo("数字输入框-按钮模式", "按钮模式", [["指定 ", code("mode"), " 为 ", code("button"), " 来使用带按钮的数字输入框。"]], ButtonModeDemo, buttonModeSource),
  demo("数字输入框-三种尺寸", "三种尺寸", [["设置 ", code("size"), " 可以使用三种尺寸（", code("small"), "、", code("default"), "、", code("large"), "）的数字输入框，高度分别对应 ", code("28px"), "、", code("32px"), "、", code("36px"), "。"]], SizeDemo, sizeSource),
  demo("数字输入框-精度和步长", "精度和步长", [["通过 ", code("precision"), " 设置数字精度。当 ", code("precision"), " 小于 ", code("step"), " 的小数位时，精度取 ", code("step"), " 的小数个数。"]], PrecisionDemo, precisionSource),
  demo("数字输入框-格式化展示值", "格式化展示值", [["通过 ", code("formatter"), "、", code("parser"), " 配合使用可以定义输入框展示值。"], ["通过 ", code("formatter"), " 中的 ", code("userTyping"), " 参数，判断是否正在输入，可以延迟显示 ", code("formatter"), " 后的值。"]], FormatterDemo, formatterSource),
  demo("数字输入框-前缀及后缀", "前缀及后缀", [["可以添加前缀和后缀。"]], AffixDemo, affixSource),
  demo("数字输入框-高精度", "高精度", [["通过 ", code("strictMode"), " 开启严格模式以支持更高精度，", code("onChange"), " 此时将会返回字符串。"]], StrictModeDemo, strictModeSource),
];
