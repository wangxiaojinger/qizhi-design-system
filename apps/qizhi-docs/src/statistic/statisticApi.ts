import type { StatisticProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type StatisticApiItem = ComponentApiItem<keyof StatisticProps>;

export const statisticApi = [
  { name: "value", description: "需要显示的数值或文本；数字自动使用千分位。", type: "number | string", defaultValue: "—" },
  { name: "title", description: "数值上方的标题。", type: "ReactNode", defaultValue: "—" },
  { name: "prefix", description: "数值前缀。", type: "ReactNode", defaultValue: "—" },
  { name: "suffix", description: "数值后缀。", type: "ReactNode", defaultValue: "—" },
  { name: "extra", description: "数值下方的补充说明。", type: "ReactNode", defaultValue: "—" },
  { name: "precision", description: "数字值保留的小数位数。", type: "number", defaultValue: "—" },
  { name: "format", description: "按本地时区输出已审定的日期时间格式。", type: '"YYYY/MM/DD HH:mm:ss"', defaultValue: "—" },
  { name: "valueStyle", description: "数值容器的内联样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "loading", description: "显示组件内部加载占位并隐藏数值。", type: "boolean", defaultValue: "false" },
  { name: "className", description: "根元素的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根元素的内联样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "ref", description: "指向根 `HTMLDivElement` 元素。", type: "Ref<HTMLDivElement>", defaultValue: "—" },
] as const satisfies readonly StatisticApiItem[];
