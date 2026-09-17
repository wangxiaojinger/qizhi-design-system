import type { SelectOptionCardProps, SelectProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";
export type SelectApiItem = ComponentApiItem<keyof SelectProps>;
export type SelectOptionCardApiItem = ComponentApiItem<keyof SelectOptionCardProps>;
export const selectSelectionCardApi = [
  { name: "fields", description: "回填字段列表，与 SelectOptionCardField 共用字段结构；标签 text-2，值 text-1。", type: "readonly SelectOptionCardField[]", defaultValue: "必填" },
  { name: "className", description: "布局类名；组件固定使用 14px 字号、4px 圆角。与选择框的 4px 间距由组合容器控制。", type: "string", defaultValue: "—" },
] as const;
export const selectApi = [
  { name: "options", description: "可选项数据，包含标签、值和可选禁用状态。", type: "SelectOption[]", defaultValue: "—" },
  { name: "mode", description: "选择模式，并决定 value 和 onChange 的类型。", type: '"single" | "multiple"', defaultValue: '"single"' },
  { name: "value", description: "受控选中值。", type: "SelectRawValue | SelectRawValue[]", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始值。", type: "SelectRawValue | SelectRawValue[]", defaultValue: "—" },
  { name: "onChange", description: "选择、清除、删除或拖拽排序后触发。", type: "SelectSingleProps['onChange'] | SelectMultipleProps['onChange']", defaultValue: "—" },
  { name: "placeholder", description: "未选择时显示的提示文字。", type: "string", defaultValue: '"请选择"' },
  { name: "size", description: "高度分别为 24px、28px、32px 和 36px。", type: '"mini" | "small" | "default" | "large"', defaultValue: '"default"' },
  { name: "status", description: "默认、错误或警告视觉状态。", type: '"default" | "error" | "warning"', defaultValue: '"default"' },
  { name: "disabled", description: "禁用触发器和选择交互。", type: "boolean", defaultValue: "false" },
  { name: "allowClear", description: "有值时在悬停或聚焦状态提供清除入口。", type: "boolean", defaultValue: "false" },
  { name: "addBefore", description: "输入区域前的稳定标签内容。", type: "ReactNode", defaultValue: "—" },
  { name: "showSearch", description: "启用搜索，对象形式可保留搜索输入。", type: "boolean | SelectSearchConfig", defaultValue: "false" },
  { name: "filterOption", description: "覆盖默认标签和值匹配逻辑。", type: "(input: string, option: SelectOption) => boolean", defaultValue: "—" },
  { name: "onSearch", description: "搜索输入变化时触发，远程数据由调用方更新 options。", type: "(input: string) => void", defaultValue: "—" },
  { name: "allowCreate", description: "允许把不存在的搜索内容创建为选项。", type: "boolean | SelectCreateConfig", defaultValue: "false" },
  { name: "tokenSeparators", description: "多选模式的自动分词字符。", type: "string[]", defaultValue: "[]" },
  { name: "maxTagCount", description: "固定或根据容器响应式控制标签数。", type: 'number | "responsive"', defaultValue: "—" },
  { name: "renderTag", description: "自定义已选标签内容。", type: "(option: SelectOption, removable: boolean) => ReactNode", defaultValue: "—" },
  { name: "renderMore", description: "自定义被省略标签的摘要内容。", type: "(count: number) => ReactNode", defaultValue: "—" },
  { name: "hideSelected", description: "多选时在弹层中隐藏已选项。", type: "boolean", defaultValue: "false" },
  { name: "dragToSort", description: "多选时允许拖拽已选标签排序。", type: "boolean", defaultValue: "false" },
  { name: "autoWidth", description: "使宽度跟随内容，可限制最小和最大宽度。", type: "boolean | SelectAutoWidth", defaultValue: "false" },
  { name: "popupWidth", description: "弹层匹配触发器、跟随内容或使用固定像素宽度。", type: '"trigger" | "content" | number', defaultValue: '"trigger"' },
  { name: "renderOption", description: "自定义选项内容，不改变 option 语义。", type: "(option: SelectOption) => ReactNode", defaultValue: "—" },
  { name: "renderOptionDescription", description: "由 Select 在选项悬停或键盘活动项显示补充说明。", type: "(option: SelectOption) => ReactNode", defaultValue: "—" },
  { name: "dropdownRender", description: "在保留公共 Dropdown 菜单的前提下扩展弹层。", type: "(menu: ReactNode) => ReactNode", defaultValue: "—" },
  { name: "trigger", description: "自定义触发节点，必须绑定提供的 ref、键盘和 ARIA 属性。", type: "(props: SelectTriggerProps) => ReactNode", defaultValue: "—" },
  { name: "open", description: "受控弹层打开状态。", type: "boolean", defaultValue: "—" },
  { name: "defaultOpen", description: "非受控初始打开状态。", type: "boolean", defaultValue: "false" },
  { name: "onOpenChange", description: "弹层打开状态变化时触发。", type: "(open: boolean) => void", defaultValue: "—" },
] as const satisfies readonly SelectApiItem[];

export const selectOptionCardApi = [
  { name: "name", description: "信息卡片的名称，支持 React 内容。", type: "ReactNode", defaultValue: "必填" },
  { name: "fields", description: "字段列表；每项包含稳定 key、可选标签、值和可选图标。", type: "readonly SelectOptionCardField[]", defaultValue: "必填" },
] as const satisfies readonly SelectOptionCardApiItem[];
