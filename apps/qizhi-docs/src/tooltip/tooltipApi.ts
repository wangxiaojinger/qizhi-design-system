import type { TooltipProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type TooltipApiItem = ComponentApiItem<Extract<keyof TooltipProps, string>>;

export const tooltipApi = [
  {
    name: "children",
    description: "唯一触发元素，保留该元素的原有事件与 ref。",
    type: "ReactElement",
    defaultValue: "—",
  },
  {
    name: "content",
    description: "文字气泡内容。",
    type: "ReactNode",
    defaultValue: "—",
  },
  {
    name: "position",
    description: "气泡相对触发器的 12 个可用方位。",
    type: "TooltipPosition",
    defaultValue: '"top"',
  },
  {
    name: "trigger",
    description: "气泡触发方式，可传入一个或多个值。",
    type: "TooltipTrigger | TooltipTrigger[]",
    defaultValue: '["hover", "focus", "click"]',
  },
  {
    name: "mini",
    description: "是否使用迷你尺寸。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "color",
    description: "气泡背景颜色。",
    type: "string",
    defaultValue: "—",
  },
  {
    name: "popupVisible",
    description: "受控的气泡显示状态。",
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
    description: "气泡显示状态请求变化时触发。",
    type: "(visible: boolean) => void",
    defaultValue: "—",
  },
  {
    name: "getPopupContainer",
    description: "返回气泡挂载容器；回调参数为当前触发元素。",
    type: "(trigger: HTMLElement) => Element",
    defaultValue: "() => document.body",
  },
] as const satisfies readonly TooltipApiItem[];
