import type { ComponentType } from "react";
import CompositionDemo from "./demos/CompositionDemo";
import compositionSource from "./demos/CompositionDemo.tsx?raw";
import HeadingsDemo from "./demos/HeadingsDemo";
import headingsSource from "./demos/HeadingsDemo.tsx?raw";
import TextDemo from "./demos/TextDemo";
import textSource from "./demos/TextDemo.tsx?raw";
import ParagraphDemo from "./demos/ParagraphDemo";
import paragraphSource from "./demos/ParagraphDemo.tsx?raw";
import EllipsisDemo from "./demos/EllipsisDemo";
import ellipsisSource from "./demos/EllipsisDemo.tsx?raw";

export interface TypographyDemoDefinition { id: string; title: string; description: string; component: ComponentType; source: string; }

export const typographyDemos: readonly TypographyDemoDefinition[] = [
  { id: "组合使用", title: "组合使用", description: "排版组件用于展示标题、段落和文本内容，这里展示排版能力的组合调用。", component: CompositionDemo, source: compositionSource },
  { id: "标题", title: "标题", description: "通过 heading 设置 H1 至 H6 的语义标题级别。", component: HeadingsDemo, source: headingsSource },
  { id: "文本", title: "文本", description: "展示不同语义类型和装饰样式的文本。", component: TextDemo, source: textSource },
  { id: "段落", title: "段落", description: "展示默认、次要及两种行距的文本段落。", component: ParagraphDemo, source: paragraphSource },
  { id: "超出省略", title: "超出省略", description: "使用 CSS 优先的省略策略展示单行、多行、展开/收起、禁用和受控状态。", component: EllipsisDemo, source: ellipsisSource },
];
