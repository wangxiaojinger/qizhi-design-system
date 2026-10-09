import type { PopoverHandle, PopoverProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type PopoverApiItem = ComponentApiItem<Extract<keyof PopoverProps | keyof PopoverHandle, string>>;
export const popoverApi = [
  { name: "children", description: "唯一触发元素，保留该元素的原有事件与 ref。", type: "ReactElement", defaultValue: "—" },
  { name: "title", description: "浮层标题；为空时不渲染标题节点。", type: "ReactNode", defaultValue: "—" },
  { name: "content", description: "浮层内容；为 null、undefined 或空字符串时不显示，数字 0 为有效内容。", type: "ReactNode", defaultValue: "—" },
  { name: "trigger", description: "浮层的触发方式，可传入一个或多个值。", type: "PopoverTrigger | PopoverTrigger[]", defaultValue: '["hover", "focus"]' },
  { name: "position", description: "浮层相对触发器的 12 个可用方位。", type: "PopoverPosition", defaultValue: '"top"' },
  { name: "popupVisible", description: "受控的浮层显示状态。", type: "boolean", defaultValue: "—" },
  { name: "defaultPopupVisible", description: "非受控模式的初始显示状态。", type: "boolean", defaultValue: "false" },
  { name: "onVisibleChange", description: "浮层显示状态请求变化时触发。", type: "(visible: boolean) => void", defaultValue: "—" },
  { name: "getPopupContainer", description: "返回浮层挂载容器；回调参数为当前触发元素。", type: "(trigger: HTMLElement) => Element", defaultValue: "() => document.body" },
  { name: "role", description: "浮层的可访问语义；交互内容使用 dialog，真实菜单使用 menu，tooltip 仅用于兼容非交互说明。", type: '"tooltip" | "dialog" | "menu"', defaultValue: '"dialog"' },
  { name: "ariaLabel", description: "无标题且内容不是纯文本时，为浮层提供可访问名称。", type: "string", defaultValue: "—" },
  { name: "mouseEnterDelay", description: "鼠标移入后延迟显示的时间，单位为秒。", type: "number", defaultValue: "0" },
  { name: "mouseLeaveDelay", description: "鼠标离开触发元素和浮层后延迟隐藏的时间，单位为秒。", type: "number", defaultValue: "0.08" },
  { name: "arrow", description: "是否显示指向触发元素的箭头。", type: "boolean", defaultValue: "true" },
  { name: "zIndex", description: "浮层根元素的层级。", type: "number", defaultValue: "1200" },
  { name: "classNames", description: "为 root、title、content 和 arrow 语义结构设置类名。", type: "Partial<Record<PopoverSemanticName, string>>", defaultValue: "—" },
  { name: "styles", description: "为 root、title、content 和 arrow 语义结构设置样式。", type: "Partial<Record<PopoverSemanticName, CSSProperties>>", defaultValue: "—" },
  { name: "variant", description: "浮层的明暗样式；深色变体中的文字与图标操作可继承白色。", type: '"light" | "dark"', defaultValue: '"light"' },
  { name: "forceAlign", description: "通过 PopoverHandle ref 手动重新计算浮层位置。", type: "PopoverHandle method", defaultValue: "—" },
] as const satisfies readonly PopoverApiItem[];
