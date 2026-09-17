import type { CodePreviewProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";
type Item = ComponentApiItem<Extract<keyof CodePreviewProps, string>>;
export const codePreviewApi = [
  { name: "value", description: "需要只读展示的代码或结构化文本。", type: "string", defaultValue: "—" },
  { name: "language", description: "语法着色语言；未知运行时值回退为纯文本。", type: "CodePreviewLanguage", defaultValue: '"text"' },
  { name: "showLineNumbers", description: "是否展示行号。", type: "boolean", defaultValue: "true" },
  { name: "wrap", description: "长行是否在视口内自动换行。", type: "boolean", defaultValue: "false" },
  { name: "copyable", description: "是否展示复制代码操作。", type: "boolean", defaultValue: "true" },
  { name: "downloadable", description: "是否展示下载代码操作。", type: "boolean", defaultValue: "false" },
  { name: "fileName", description: "下载代码时使用的文件名。", type: "string", defaultValue: '"code.txt"' },
  { name: "maxHeight", description: "代码视口最大高度，超出后内部滚动。", type: "number | string", defaultValue: "—" },
  { name: "loading", description: "是否展示加载状态。", type: "boolean", defaultValue: "false" },
  { name: "emptyText", description: "无内容时的提示。", type: "ReactNode", defaultValue: '"暂无代码"' },
  { name: "className", description: "根节点附加类名。", type: "string", defaultValue: "—" },
  { name: "aria-label", description: "代码预览区域的可访问名称。", type: "string", defaultValue: '"代码预览"' },
] as const satisfies readonly Item[];
