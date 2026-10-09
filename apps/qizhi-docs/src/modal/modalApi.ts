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
  { name: "destroyOnHidden", description: "关闭时是否销毁内部内容；默认保留内容状态。", type: "boolean", defaultValue: "false" },
  { name: "afterClose", description: "退出动画完成后的回调。", type: "() => void", defaultValue: "—" },
  { name: "getContainer", description: "指定对话框挂载容器；传入 `false` 时原地渲染。", type: "HTMLElement | () => HTMLElement | string | false", defaultValue: "document.body" },
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
  { name: "icon", description: "确认标题前的图标；传入 `null` 隐藏默认警告图标。", type: "ReactNode | null", defaultValue: "WarningFilledIcon" },
  { name: "footer", description: "自定义页脚；传入 `null` 隐藏页脚。", type: "ReactNode", defaultValue: "—" },
  { name: "width", description: "确认对话框宽度。", type: "number | string", defaultValue: "416" },
  { name: "okText", description: "确认按钮文案。", type: "ReactNode", defaultValue: "确定" },
  { name: "cancelText", description: "取消按钮文案。", type: "ReactNode", defaultValue: "取消" },
  { name: "okButtonProps", description: "确认按钮属性。", type: "ButtonProps", defaultValue: "—" },
  { name: "cancelButtonProps", description: "取消按钮属性。", type: "ButtonProps", defaultValue: "—" },
  { name: "closable", description: "是否显示右上角关闭按钮。", type: "boolean", defaultValue: "false" },
  { name: "maskClosable", description: "点击遮罩是否触发取消。", type: "boolean", defaultValue: "false" },
  { name: "escToExit", description: "按 Escape 是否触发取消。", type: "boolean", defaultValue: "true" },
  { name: "hideCancel", description: "是否隐藏默认取消按钮。", type: "boolean", defaultValue: "false" },
  { name: "afterClose", description: "退出动画完成后的回调。", type: "() => void", defaultValue: "—" },
  { name: "getContainer", description: "指定确认框挂载容器；`false` 会跳过 Portal，静态调用渲染在临时宿主中，useModal 渲染在 holder 位置。", type: "HTMLElement | () => HTMLElement | string | false", defaultValue: "document.body" },
  { name: "onOk", description: "确定回调。", type: "() => void | Promise<void>", defaultValue: "—" },
  { name: "onCancel", description: "取消回调。", type: "() => void", defaultValue: "—" },
] as const satisfies readonly ConfirmItem[];
