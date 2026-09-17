import type {
  SliderMultipleProps,
  SliderRangeProps,
  SliderSingleProps,
} from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type SliderApiName =
  | keyof SliderSingleProps
  | keyof SliderRangeProps
  | keyof SliderMultipleProps
  | "ref";
type SliderApiItem = ComponentApiItem<SliderApiName>;

export const sliderApi = [
  { name: "value", description: "受控值；类型随单值、范围或多点模式收窄。", type: "number | SliderRangeValue | SliderMultipleValue", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始值；类型随模式收窄。", type: "number | SliderRangeValue | SliderMultipleValue", defaultValue: "模式最小值" },
  { name: "onChange", description: "值变化过程中触发，数组值按升序返回。", type: "(value) => void", defaultValue: "—" },
  { name: "min", description: "可选范围的最小值。", type: "number", defaultValue: "0" },
  { name: "max", description: "可选范围的最大值。", type: "number", defaultValue: "100" },
  { name: "step", description: "滑动和键盘调整的步长。", type: "number", defaultValue: "1" },
  { name: "range", description: "开启双值范围模式；对象形式可启用整体拖拽。", type: "boolean | { draggableBar?: boolean }", defaultValue: "false" },
  { name: "multiple", description: "开启三个及以上滑块的多点模式。", type: "boolean", defaultValue: "false" },
  { name: "vertical", description: "使用竖直方向的滑动条。", type: "boolean", defaultValue: "false" },
  { name: "disabled", description: "禁用全部指针和键盘操作。", type: "boolean", defaultValue: "false" },
  { name: "marks", description: "按数值设置刻度标签。", type: "Record<number, ReactNode>", defaultValue: "—" },
  { name: "tooltipVisible", description: "undefined 跟随交互，true 持续显示，false 持续隐藏。", type: "boolean", defaultValue: "undefined" },
  { name: "tooltipPosition", description: "设置数值提示相对于滑块的位置。", type: "TooltipPosition", defaultValue: '水平 "top"，竖直 "right"' },
  { name: "formatterTooltip", description: "格式化数值提示内容和 aria-valuetext。", type: "(value: number) => ReactNode", defaultValue: "String(value)" },
  { name: "getPopupContainer", description: "设置 Tooltip 的 Portal 容器，与公共 Tooltip API 一致。", type: "(trigger: HTMLElement) => Element", defaultValue: "document.body" },
  { name: "onChangeComplete", description: "一次指针或键盘调整完成后触发最终值。", type: "(value) => void", defaultValue: "—" },
  { name: "className", description: "根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "ref", description: "转发至根节点。", type: "Ref<HTMLDivElement>", defaultValue: "—" },
] as const satisfies readonly SliderApiItem[];
