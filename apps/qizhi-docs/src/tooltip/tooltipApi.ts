import type {
  TooltipHandle,
  TooltipProps,
} from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type TooltipApiName = Extract<
  keyof TooltipProps | keyof TooltipHandle,
  string
>;
type TooltipApiItem = ComponentApiItem<TooltipApiName>;

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
    defaultValue: '["hover", "focus"]',
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
  {
    name: "mouseEnterDelay",
    description: "鼠标移入后延迟显示的时间，单位为秒。",
    type: "number",
    defaultValue: "0",
  },
  {
    name: "mouseLeaveDelay",
    description: "鼠标移出后延迟隐藏的时间，单位为秒。",
    type: "number",
    defaultValue: "0.08",
  },
  {
    name: "arrow",
    description: "是否显示指向触发元素的箭头。",
    type: "boolean",
    defaultValue: "true",
  },
  {
    name: "zIndex",
    description: "气泡根元素的层级。",
    type: "number",
    defaultValue: "1200",
  },
  {
    name: "classNames",
    description: "为 root、container 和 arrow 语义结构设置类名。",
    type: "Partial<Record<TooltipSemanticName, string>>",
    defaultValue: "—",
  },
  {
    name: "styles",
    description: "为 root、container 和 arrow 语义结构设置样式。",
    type: "Partial<Record<TooltipSemanticName, CSSProperties>>",
    defaultValue: "—",
  },
  {
    name: "forceAlign",
    description: "通过 TooltipHandle ref 手动重新计算气泡位置。",
    type: "TooltipHandle method",
    defaultValue: "—",
  },
] as const satisfies readonly TooltipApiItem[];
