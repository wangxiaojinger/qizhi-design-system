import type { PopconfirmProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type PopconfirmApiItem = ComponentApiItem<
  Extract<keyof PopconfirmProps, string>
>;

export const popconfirmApi = [
  {
    name: "children",
    description: "唯一触发元素，保留该元素的原有事件与 ref。",
    type: "ReactElement",
    defaultValue: "—",
  },
  {
    name: "title",
    description: "确认框标题。",
    type: "ReactNode",
    defaultValue: "—",
  },
  {
    name: "content",
    description: "确认框内容。",
    type: "ReactNode",
    defaultValue: "—",
  },
  {
    name: "position",
    description: "确认框相对触发器的 12 个可用方位。",
    type: "PopoverPosition",
    defaultValue: '"top"',
  },
  {
    name: "icon",
    description: "标题前的图标；设为 null 时不渲染图标。",
    type: "ReactNode | null",
    defaultValue: "<WarningFilledIcon />",
  },
  {
    name: "disabled",
    description: "是否禁止打开确认框。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "okText",
    description: "确定按钮文字。",
    type: "ReactNode",
    defaultValue: '"确定"',
  },
  {
    name: "cancelText",
    description: "取消按钮文字。",
    type: "ReactNode",
    defaultValue: '"取消"',
  },
  {
    name: "okButtonProps",
    description: "传递给确定 Button 的属性。",
    type: "PopconfirmButtonProps",
    defaultValue: "—",
  },
  {
    name: "cancelButtonProps",
    description: "传递给取消 Button 的属性。",
    type: "PopconfirmButtonProps",
    defaultValue: "—",
  },
  {
    name: "onOk",
    description: "点击确定时触发；返回 Promise 时等待完成后关闭。",
    type: "(event: MouseEvent) => void | Promise<void>",
    defaultValue: "—",
  },
  {
    name: "onCancel",
    description: "点击取消时触发。",
    type: "(event: MouseEvent) => void",
    defaultValue: "—",
  },
  {
    name: "popupVisible",
    description: "受控的确认框显示状态。",
    type: "boolean",
    defaultValue: "—",
  },
  {
    name: "defaultPopupVisible",
    description: "非受控模式的初始显示状态。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "onVisibleChange",
    description: "确认框显示状态请求变化时触发。",
    type: "(visible: boolean) => void",
    defaultValue: "—",
  },
  {
    name: "getPopupContainer",
    description: "返回浮层挂载容器；回调参数为当前触发元素。",
    type: "(trigger: HTMLElement) => Element",
    defaultValue: "() => document.body",
  },
] as const satisfies readonly PopconfirmApiItem[];
