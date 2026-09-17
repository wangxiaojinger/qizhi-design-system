import type { UploadHandle, UploadProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type UploadApiName = keyof UploadProps | keyof UploadHandle;
type UploadApiItem = ComponentApiItem<UploadApiName>;

export const uploadApi = [
  { name: "fileList", description: "受控文件列表。", type: "readonly UploadFile[]", defaultValue: "—" },
  { name: "defaultFileList", description: "非受控初始文件列表。", type: "readonly UploadFile[]", defaultValue: "[]" },
  { name: "onChange", description: "文件列表或文件状态变化时触发。", type: "(fileList, file) => void", defaultValue: "—" },
  { name: "beforeUpload", description: "每个文件上传前校验或替换文件。", type: "(file, files) => boolean | File | Promise<boolean | File>", defaultValue: "—" },
  { name: "onRemove", description: "移除前校验；返回 false 保留文件。", type: "(file, files) => boolean | Promise<boolean>", defaultValue: "—" },
  { name: "onReupload", description: "重新上传失败文件时触发。", type: "(file) => void", defaultValue: "—" },
  { name: "onReject", description: "文件不符合 accept 时触发。", type: "(file) => void", defaultValue: "—" },
  { name: "accept", description: "原生文件类型过滤规则。", type: "string", defaultValue: "—" },
  { name: "multiple", description: "是否支持多选。", type: "boolean", defaultValue: "false" },
  { name: "disabled", description: "禁用文件选择和拖拽。", type: "boolean", defaultValue: "false" },
  { name: "limit", description: "文件数量上限，达到后隐藏入口。", type: "number", defaultValue: "—" },
  { name: "directory", description: "选择文件夹并保留相对路径。", type: "boolean", defaultValue: "false" },
  { name: "drag", description: "使用点击或拖拽上传区。", type: "boolean", defaultValue: "false" },
  { name: "listType", description: "文件列表外观。", type: '"text" | "picture-card"', defaultValue: '"text"' },
  { name: "showUploadList", description: "是否显示文件列表。", type: "boolean", defaultValue: "true" },
  { name: "customRequest", description: "接管真实上传请求及进度、成功、失败回调。", type: "(options) => void | abort", defaultValue: "无请求时直接成功" },
  { name: "children", description: "自定义上传触发内容。", type: "ReactNode", defaultValue: "图片卡片和拖拽模式有默认内容" },
  { name: "className", description: "根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "aria-label", description: "拖拽或图片入口的可访问名称。", type: "string", defaultValue: "内置中文名称" },
  { name: "submit", description: "提交指定文件或所有 init 文件。", type: "UploadHandle method", defaultValue: "—" },
  { name: "abort", description: "中止指定或所有请求。", type: "UploadHandle method", defaultValue: "—" },
  { name: "reupload", description: "重新提交文件。", type: "UploadHandle method", defaultValue: "—" },
] as const satisfies readonly UploadApiItem[];
