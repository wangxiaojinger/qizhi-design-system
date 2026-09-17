import type { MarkdownViewerProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";
type Item = ComponentApiItem<Extract<keyof MarkdownViewerProps, string>>;
export const markdownViewerApi = [
  { name: "value", description: "需要安全渲染的 Markdown 原文。", type: "string", defaultValue: "—" },
  { name: "loading", description: "是否展示加载状态。", type: "boolean", defaultValue: "false" },
  { name: "emptyText", description: "无内容时的提示。", type: "ReactNode", defaultValue: '"暂无文档"' },
  { name: "openLinksInNewTab", description: "是否在新窗口安全打开链接。", type: "boolean", defaultValue: "false" },
  { name: "maxHeight", description: "正文最大高度，超出后内部滚动。", type: "number | string", defaultValue: "—" },
  { name: "showOutline", description: "是否展示二级和三级标题目录。", type: "boolean", defaultValue: "false" },
  { name: "className", description: "根节点附加类名。", type: "string", defaultValue: "—" },
  { name: "aria-label", description: "Markdown 阅读区域的可访问名称。", type: "string", defaultValue: '"Markdown 阅读器"' },
] as const satisfies readonly Item[];
