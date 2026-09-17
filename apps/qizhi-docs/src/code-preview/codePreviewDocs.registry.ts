import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import LanguagesDemo from "./demos/LanguagesDemo";
import languagesSource from "./demos/LanguagesDemo.tsx?raw";
import LongContentDemo from "./demos/LongContentDemo";
import longContentSource from "./demos/LongContentDemo.tsx?raw";
import StatesDemo from "./demos/StatesDemo";
import statesSource from "./demos/StatesDemo.tsx?raw";

export interface CodePreviewDemoDefinition { id: string; title: string; description: string; component: ComponentType; source: string; }

export const codePreviewDemos: readonly CodePreviewDemoDefinition[] = [
  { id: "code-preview-basic", title: "基础用法", description: "展示 TypeScript 代码、行号和复制操作。", component: BasicDemo, source: basicSource },
  { id: "code-preview-languages", title: "多种语言", description: "通过选择器切换代码语言并查看对应的语法着色。", component: LanguagesDemo, source: languagesSource },
  { id: "code-preview-long-content", title: "长内容", description: "长内容支持自动换行、内部滚动和文件下载。", component: LongContentDemo, source: longContentSource },
  { id: "code-preview-states", title: "加载与空状态", description: "展示内容加载中和无代码内容时的反馈。", component: StatesDemo, source: statesSource },
];
