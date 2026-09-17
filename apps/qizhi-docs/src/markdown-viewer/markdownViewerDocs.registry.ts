import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import GfmDemo from "./demos/GfmDemo";
import gfmSource from "./demos/GfmDemo.tsx?raw";
import CodeBlockDemo from "./demos/CodeBlockDemo";
import codeBlockSource from "./demos/CodeBlockDemo.tsx?raw";
import StatesDemo from "./demos/StatesDemo";
import statesSource from "./demos/StatesDemo.tsx?raw";

export interface MarkdownViewerDemoDefinition { id: string; title: string; description: string; component: ComponentType; source: string; }

export const markdownViewerDemos: readonly MarkdownViewerDemoDefinition[] = [
  { id: "markdown-viewer-basic", title: "基础文档", description: "展示标题、段落、列表和引用等常用 Markdown 内容。", component: BasicDemo, source: basicSource },
  { id: "markdown-viewer-gfm", title: "扩展语法", description: "展示表格、任务列表、删除线和链接等 GFM 语法。", component: GfmDemo, source: gfmSource },
  { id: "markdown-viewer-code", title: "代码块", description: "Markdown 代码块复用 CodePreview 代码预览组件。", component: CodeBlockDemo, source: codeBlockSource },
  { id: "markdown-viewer-states", title: "安全与状态", description: "内嵌 HTML 按文本处理，并展示加载与空内容状态。", component: StatesDemo, source: statesSource },
];
