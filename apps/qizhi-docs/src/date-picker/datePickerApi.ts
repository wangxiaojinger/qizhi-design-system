import type { DatePickerProps, DateRangePickerProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type DatePickerApiItem = ComponentApiItem<keyof DatePickerProps | keyof DateRangePickerProps>;
export const datePickerApi = [
  { name: "mode", description: "选择粒度。", type: '"date" | "week" | "month" | "year" | "quarter"', defaultValue: '"date"' },
  { name: "showTime", description: "是否显示时、分、秒选择。", type: "boolean", defaultValue: "false" },
  { name: "value", description: "受控值；范围选择器使用二元数组。", type: "string | readonly [string, string]", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始值。", type: "string | readonly [string, string]", defaultValue: "—" },
  { name: "status", description: "输入状态。", type: '"default" | "error" | "warning"', defaultValue: '"default"' },
  { name: "prefix", description: "输入框前缀。", type: "ReactNode", defaultValue: "—" },
  { name: "placeholder", description: "未选择时的提示文案。", type: "string", defaultValue: "按模式生成" },
  { name: "allowClear", description: "有值时是否允许悬停清空。", type: "boolean", defaultValue: "true" },
  { name: "disabledDate", description: "判断日期是否不可选。", type: "(date: Date) => boolean", defaultValue: "—" },
  { name: "disabledTime", description: "返回不可选的时、分、秒。", type: "(date, field?) => DisabledTimeConfig", defaultValue: "—" },
  { name: "hideDisabledTimeOptions", description: "是否隐藏不可选的时间项。", type: "boolean", defaultValue: "false" },
  { name: "defaultPickerDate", description: "首次打开时展示的月份。", type: "string", defaultValue: "当前月份" },
  { name: "onChange", description: "完成日期选择后触发。", type: "(value) => void", defaultValue: "—" },
  { name: "className", description: "根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly DatePickerApiItem[];
