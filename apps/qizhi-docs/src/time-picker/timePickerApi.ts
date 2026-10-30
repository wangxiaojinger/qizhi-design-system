import type { TimePickerProps, TimeRangePickerProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type TimePickerApiName = keyof TimePickerProps | keyof TimeRangePickerProps | "ref";
type TimePickerApiItem = ComponentApiItem<TimePickerApiName>;

export const timePickerApi = [
  { name: "value", description: "受控时间值；范围模式使用空元组或两个字符串。", type: "string | readonly [string, string] | readonly []", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始时间值；类型随单值或范围模式收窄。", type: "string | readonly [string, string] | readonly []", defaultValue: "单值为空字符串，范围为空元组" },
  { name: "onChange", description: "默认选择后立即触发；needConfirm 开启时确认后触发。", type: "(value) => void", defaultValue: "—" },
  { name: "allowClear", description: "有值时允许清空。", type: "boolean", defaultValue: "true" },
  { name: "needConfirm", description: "编辑草稿并在确认后提交。", type: "boolean", defaultValue: "false" },
  { name: "order", description: "范围模式自动排序；跨午夜可设 false。", type: "boolean", defaultValue: "true" },
  { name: "disabledTime", description: "按当前时间和起止字段返回禁用时、分、秒数组。", type: "(value: string, field?: 'start' | 'end') => DisabledTimeConfig", defaultValue: "—" },
  { name: "hideDisabledOptions", description: "隐藏禁用选项。", type: "boolean", defaultValue: "false" },
  { name: "format", description: "控制显示和面板列；v1 支持 `HH:mm:ss` 与 `HH:mm`。", type: '"HH:mm:ss" | "HH:mm"', defaultValue: '"HH:mm:ss"' },
  { name: "step", description: "分别设置时、分、秒选项的正整数步长。", type: "{ hour?: number; minute?: number; second?: number }", defaultValue: "均为 1" },
  { name: "size", description: "设置输入控件高度。", type: '"mini" | "small" | "default" | "large"', defaultValue: '"default"' },
  { name: "status", description: "设置默认、错误或警告状态。", type: '"default" | "error" | "warning"', defaultValue: '"default"' },
  { name: "disabled", description: "禁用输入字段、面板打开和选择事件。", type: "boolean", defaultValue: "false" },
  { name: "placeholder", description: "设置单值模式的占位文案。", type: "string", defaultValue: '"请选择时间"' },
  { name: "placeholders", description: "设置范围模式开始和结束字段的占位文案。", type: "readonly [string, string]", defaultValue: '["开始时间", "结束时间"]' },
  { name: "className", description: "根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "aria-label", description: "设置组件或范围弹层的可访问名称。", type: "string", defaultValue: '单值 "选择时间"，范围 "选择时间范围"' },
  { name: "ref", description: "转发至根节点。", type: "Ref<HTMLDivElement>", defaultValue: "—" },
] as const satisfies readonly TimePickerApiItem[];
