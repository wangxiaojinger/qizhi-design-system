import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import BorderedDemo from "./demos/BorderedDemo";
import borderedSource from "./demos/BorderedDemo.tsx?raw";
import CheckableDemo from "./demos/CheckableDemo";
import checkableSource from "./demos/CheckableDemo.tsx?raw";
import ClosableDemo from "./demos/ClosableDemo";
import closableSource from "./demos/ClosableDemo.tsx?raw";
import ColorDemo from "./demos/ColorDemo";
import colorSource from "./demos/ColorDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";

export interface TagDemoDefinition { id: string; title: string; description: string; component: ComponentType; source: string }

export const tagDemos: readonly TagDemoDefinition[] = [
  { id: "标签-基础用法", title: "基础用法", description: "标签的基础用法，可单独展示文本，也可搭配图标表达完成、状态和分类。", component: BasicDemo, source: basicSource },
  { id: "标签-可关闭标签", title: "可关闭标签", description: "可设置 closable 属性控制标签是否可关闭，也可通过 visible 属性控制标签的显示隐藏。", component: ClosableDemo, source: closableSource },
  { id: "标签-多彩标签", title: "多彩标签", description: "通过 color 设置标签颜色，支持内置色板名称和自定义颜色。", component: ColorDemo, source: colorSource },
  { id: "标签-可选中", title: "可选中", description: "通过参数 checkable，可以实现点击选中的效果。", component: CheckableDemo, source: checkableSource },
  { id: "标签-不同尺寸", title: "不同尺寸", description: "使用 size 属性设置不同尺寸，覆盖 small、default、medium、large 四种规格。", component: SizeDemo, source: sizeSource },
  { id: "标签-带边框的标签", title: "带边框的标签", description: "通过参数 bordered，可以显示带边框的标签。", component: BorderedDemo, source: borderedSource },
];
