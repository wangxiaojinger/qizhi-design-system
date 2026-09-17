import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import BeforeRemoveDemo from "./demos/BeforeRemoveDemo";
import beforeRemoveSource from "./demos/BeforeRemoveDemo.tsx?raw";
import BeforeUploadDemo from "./demos/BeforeUploadDemo";
import beforeUploadSource from "./demos/BeforeUploadDemo.tsx?raw";
import CropDemo from "./demos/CropDemo";
import cropSource from "./demos/CropDemo.tsx?raw";
import DirectoryDemo from "./demos/DirectoryDemo";
import directorySource from "./demos/DirectoryDemo.tsx?raw";
import DragDemo from "./demos/DragDemo";
import dragSource from "./demos/DragDemo.tsx?raw";
import FileListDemo from "./demos/FileListDemo";
import fileListSource from "./demos/FileListDemo.tsx?raw";
import LimitDemo from "./demos/LimitDemo";
import limitSource from "./demos/LimitDemo.tsx?raw";

export interface UploadDemoDefinition {
  id: string;
  title: string;
  description: readonly (string | { code: string })[];
  descriptionText: string;
  component: ComponentType;
  tsxSource: string;
}
const code = (value: string) => ({ code: value });
const demo = (
  id: string,
  title: string,
  description: UploadDemoDefinition["description"],
  component: ComponentType,
  tsxSource: string,
): UploadDemoDefinition => ({
  id,
  title,
  description,
  descriptionText: description.map((part) => typeof part === "string" ? part : part.code).join(""),
  component,
  tsxSource,
});

export const uploadDemos: readonly UploadDemoDefinition[] = [
  demo("上传-基础用法", "基础用法", ["最基础的上传组件用法。"], BasicDemo, basicSource),
  demo("上传-拖拽上传", "拖拽上传", ["拖拽上传。当使用拖拽上传，且设置 ", code("accept"), " 时，选择后的文件将会根据后缀名及文件类型进行过滤。"], DragDemo, dragSource),
  demo("上传-已上传的文件列表", "已上传的文件列表", ["默认的文件上传列表。"], FileListDemo, fileListSource),
  demo("上传-上传前校验", "上传前校验", [code("beforeUpload"), " 会在每一个文件上传之前执行。如果返回 false 或者 Promise.reject，那么将会取消当前文件的上传。"], BeforeUploadDemo, beforeUploadSource),
  demo("上传-移除前校验", "移除前校验", [code("onRemove"), " 会在每个文件从上传列表中删除之前执行。如果返回 false 或者 Promise.reject，那么将会终止移除操作。"], BeforeRemoveDemo, beforeRemoveSource),
  demo("上传-上传前裁剪", "上传前裁剪", [code("beforeUpload"), " 会在每一个文件上传之前执行。可在上传前裁剪图片，并返回裁剪后的文件继续上传。"], CropDemo, cropSource),
  demo("上传-限制上传数量", "限制上传数量", ["通过 ", code("limit"), " 限制上传的最大数量。超出后上传按钮会隐藏。"], LimitDemo, limitSource),
  demo("上传-文件夹上传", "文件夹上传", ["支持选择文件夹上传，列表会展示文件在文件夹中的相对路径。"], DirectoryDemo, directorySource),
];
