import type { ModalConfirmConfig, ModalProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type ModalItem = ComponentApiItem<keyof ModalProps>;
type ConfirmItem = ComponentApiItem<keyof ModalConfirmConfig>;

export const modalApi = [
  { name: "open", description: "是否显示对话框。", type: "boolean", defaultValue: "—" },
  { name: "title", description: "对话框标题。", type: "ReactNode", defaultValue: "—" },
  { name: "children", description: "对话框正文。", type: "ReactNode", defaultValue: "—" },
  { name: "width", description: "对话框宽度。", type: "number | string", defaultValue: "520" },
  { name: "footer", description: "自定义页脚；传入 `null` 隐藏页脚。", type: "ReactNode", defaultValue: "—" },
  { name: "onCancel", description: "取消、关闭按钮或遮罩触发的回调。", type: "() => void", defaultValue: "—" },
  { name: "onOk", description: "确定回调；Promise 未完成时显示加载状态。", type: "() => void | Promise<void>", defaultValue: "—" },
  { name: "cancelText", description: "取消按钮文案。", type: "ReactNode", defaultValue: "取消" },
  { name: "okText", description: "确定按钮文案。", type: "ReactNode", defaultValue: "确定" },
  { name: "cancelButtonProps", description: "取消按钮属性。", type: "ButtonProps", defaultValue: "—" },
  { name: "okButtonProps", description: "确定按钮属性。", type: "ButtonProps", defaultValue: "—" },
  { name: "confirmLoading", description: "确定按钮是否处于加载状态。", type: "boolean", defaultValue: "false" },
  { name: "closable", description: "是否显示右上角关闭按钮。", type: "boolean", defaultValue: "true" },
  { name: "maskClosable", description: "点击遮罩是否触发取消。", type: "boolean", defaultValue: "true" },
  { name: "escToExit", description: "按 Escape 是否触发取消。", type: "boolean", defaultValue: "true" },
  { name: "hideCancel", description: "是否隐藏默认取消按钮。", type: "boolean", defaultValue: "false" },
  { name: "bodyClassName", description: "对话框正文区域类名。", type: "string", defaultValue: "—" },
  { name: "className", description: "对话框类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "对话框样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly ModalItem[];

export const modalConfirmApi = [
  { name: "title", description: "确认对话框标题。", type: "ReactNode", defaultValue: "—" },
  { name: "content", description: "确认对话框正文。", type: "ReactNode", defaultValue: "—" },
  { name: "onOk", description: "确定回调。", type: "() => void | Promise<void>", defaultValue: "—" },
  { name: "onCancel", description: "取消回调。", type: "() => void", defaultValue: "—" },
] as const satisfies readonly ConfirmItem[];
