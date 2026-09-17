import type { PopoverProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type PopoverApiItem = ComponentApiItem<Extract<keyof PopoverProps, string>>;
export const popoverApi = [
  { name: "children", description: "唯一触发元素，保留该元素的原有事件与 ref。", type: "ReactElement", defaultValue: "—" },
  { name: "title", description: "浮层标题；为空时不渲染标题节点。", type: "ReactNode", defaultValue: "—" },
  { name: "content", description: "浮层内容。", type: "ReactNode", defaultValue: "—" },
  { name: "trigger", description: "浮层的触发方式。", type: '"hover" | "click" | "focus" | "contextMenu"', defaultValue: '"hover"' },
  { name: "position", description: "浮层相对触发器的 12 个可用方位。", type: "PopoverPosition", defaultValue: '"top"' },
  { name: "popupVisible", description: "受控的浮层显示状态。", type: "boolean", defaultValue: "—" },
  { name: "defaultPopupVisible", description: "非受控模式的初始显示状态。", type: "boolean", defaultValue: "false" },
  { name: "onVisibleChange", description: "浮层显示状态请求变化时触发。", type: "(visible: boolean) => void", defaultValue: "—" },
  { name: "getPopupContainer", description: "返回浮层挂载容器；回调参数为当前触发元素。", type: "(trigger: HTMLElement) => Element", defaultValue: "() => document.body" },
  { name: "role", description: "浮层的可访问语义。", type: '"tooltip" | "dialog" | "menu"', defaultValue: '"tooltip"' },
] as const satisfies readonly PopoverApiItem[];
