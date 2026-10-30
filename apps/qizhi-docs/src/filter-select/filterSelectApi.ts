import type {
  FilterSelectMultipleProps,
  FilterSelectSingleProps,
} from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type FilterSelectApiName = keyof FilterSelectSingleProps
  | keyof FilterSelectMultipleProps;
type FilterSelectApiItem = ComponentApiItem<FilterSelectApiName>;

export const filterSelectApi = [
  { name: "label", description: "始终显示在触发框内的筛选名称。", type: "ReactNode", defaultValue: "必填" },
  { name: "mode", description: "单选或多选模式，并决定值与回调类型。", type: '"single" | "multiple"', defaultValue: '"single"' },
  { name: "value", description: "受控选中值。", type: "FilterSelectValue | FilterSelectValue[]", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始值。", type: "FilterSelectValue | FilterSelectValue[]", defaultValue: "—" },
  { name: "options", description: "下拉选项；菜单只渲染选项名称。", type: "FilterSelectOption[]", defaultValue: "必填" },
  { name: "allOption", description: "单选模式的“全部”选项；相同 value 会去重。", type: "FilterSelectOption", defaultValue: "—" },
  { name: "emptyText", description: "无选中值时的摘要内容。", type: "ReactNode", defaultValue: '单选 "全部"；多选 "全部标签"' },
  { name: "maxDisplayCount", description: "多选摘要最多展示的选项数量。", type: "number", defaultValue: "2" },
  { name: "separator", description: "多选摘要中的选项分隔符。", type: "ReactNode", defaultValue: '"、"' },
  { name: "renderMore", description: "自定义多选摘要的剩余数量。", type: "(count: number) => ReactNode", defaultValue: 'count => `+${count}`' },
  { name: "searchable", description: "在下拉列表顶部启用本地或远程搜索输入。", type: "boolean", defaultValue: "false" },
  { name: "searchValue", description: "受控搜索关键字。", type: "string", defaultValue: "—" },
  { name: "retainDisplayValueWhenOpen", description: "展开和搜索时继续显示当前筛选摘要。", type: "boolean", defaultValue: "true" },
  { name: "loading", description: "显示加载状态并暂时阻止选择。", type: "boolean", defaultValue: "false" },
  { name: "disabled", description: "禁用筛选器交互。", type: "boolean", defaultValue: "false" },
  { name: "allowClear", description: "仅多选提供清除入口；单选不支持清空。", type: "boolean", defaultValue: "false" },
  { name: "placeholder", description: "搜索输入的提示文字。", type: "string", defaultValue: '"请搜索"' },
  { name: "notFoundContent", description: "没有匹配选项时显示的内容。", type: "ReactNode", defaultValue: '"暂无数据"' },
  { name: "filterOption", description: "本地过滤函数；false 用于远程搜索。", type: "boolean | SelectProps['filterOption']", defaultValue: "true" },
  { name: "onSearch", description: "搜索关键字变化时触发。", type: "(keyword: string) => void", defaultValue: "—" },
  { name: "onChange", description: "选择、取消或清除后立即触发。", type: "FilterSelectSingleProps['onChange'] | FilterSelectMultipleProps['onChange']", defaultValue: "—" },
  { name: "renderOption", description: "自定义菜单中的选项内容。", type: "(option: FilterSelectOption) => ReactNode", defaultValue: "—" },
  { name: "className", description: "触发器根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "触发器根节点内联样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "aria-label", description: "非文本 label 时必需的可访问名称。", type: "string", defaultValue: "文本 label" },
] as const satisfies readonly FilterSelectApiItem[];
