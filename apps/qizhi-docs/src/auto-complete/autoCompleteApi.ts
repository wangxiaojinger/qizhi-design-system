import type { AutoCompleteProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type AutoCompleteApiItem = ComponentApiItem<keyof AutoCompleteProps>;

export const autoCompleteApi = [
  { name: "data", description: "候选数据，支持字符串或带有 value、label、group、disabled 的选项对象。", type: "readonly (string | AutoCompleteOption)[]", defaultValue: "[]" },
  { name: "children", description: "使用 AutoComplete.Option 声明自定义候选项。", type: "ReactNode", defaultValue: "—" },
  { name: "value", description: "受控输入值。", type: "string", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始输入值。", type: "string", defaultValue: '""' },
  { name: "strict", description: "匹配时是否严格区分大小写。", type: "boolean", defaultValue: "false" },
  { name: "filterOption", description: "自定义候选过滤函数；设为 false 关闭默认过滤。", type: "false | ((inputValue, option) => boolean)", defaultValue: "默认包含匹配" },
  { name: "triggerElement", description: "替换默认 Input 的自定义输入组件。", type: "ReactElement", defaultValue: "Input" },
  { name: "onChange", description: "输入值或选中值改变时触发。", type: "(value: string) => void", defaultValue: "—" },
  { name: "onSearch", description: "用户输入时返回当前查询值。", type: "(value: string) => void", defaultValue: "—" },
  { name: "onSelect", description: "选中候选项时返回值和选项数据。", type: "(value, option) => void", defaultValue: "—" },
  { name: "className", description: "根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点内联样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "ref", description: "指向实际的 input 或 textarea 元素。", type: "Ref<HTMLInputElement | HTMLTextAreaElement>", defaultValue: "—" },
] as const satisfies readonly AutoCompleteApiItem[];
