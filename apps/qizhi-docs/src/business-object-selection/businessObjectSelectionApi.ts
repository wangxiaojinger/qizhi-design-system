import type {
  BasicChoiceCardsProps,
  ChoiceCardGroupProps,
  ChoiceCardProps,
  ObjectSelectorProps,
} from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type Api<T> = readonly ComponentApiItem<Extract<keyof T, string>>[];

export const choiceCardApi = [
  { name: "value", description: "选项值。", type: "ChoiceCardValue", defaultValue: "—" },
  { name: "title", description: "选项标题。", type: "ReactNode", defaultValue: "—" },
  { name: "description", description: "选项说明。", type: "ReactNode", defaultValue: "—" },
  { name: "icon", description: "选项图标。", type: "ReactNode", defaultValue: "—" },
  { name: "disabled", description: "是否禁用。", type: "boolean", defaultValue: "false" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies Api<ChoiceCardProps>;

export const choiceCardGroupApi = [
  { name: "children", description: "ChoiceCard 选项。", type: "ReactNode", defaultValue: "—" },
  { name: "value", description: "受控选中值。", type: "ChoiceCardValue", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始值。", type: "ChoiceCardValue", defaultValue: "—" },
  { name: "size", description: "尺寸。", type: '"small" | "default"', defaultValue: '"default"' },
  { name: "columns", description: "桌面端列数。", type: "2 | 3", defaultValue: "3" },
  { name: "onChange", description: "选中值变化时触发。", type: "(value) => void", defaultValue: "—" },
] as const satisfies Api<ChoiceCardGroupProps>;

export const objectSelectorApi = [
  { name: "label", description: "字段与对话框名称。", type: "string", defaultValue: "—" },
  { name: "items", description: "可选对象、项目归属与版本数据。", type: "readonly ObjectSelectorItem[]", defaultValue: "—" },
  { name: "projects", description: "项目筛选项。", type: "readonly ObjectSelectorProject[]", defaultValue: "—" },
  { name: "value", description: "受控已提交值。", type: "ObjectSelectorValue", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始已提交值。", type: "ObjectSelectorValue", defaultValue: "—" },
  { name: "placeholder", description: "未选时触发器文案。", type: "string", defaultValue: "label" },
  { name: "searchPlaceholder", description: "搜索框占位文案。", type: "string", defaultValue: '"输入模型名称搜索"' },
  { name: "onChange", description: "确认提交对象与版本时触发。", type: "(value, item) => void", defaultValue: "—" },
  { name: "className", description: "字段根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies Api<ObjectSelectorProps>;

export const basicChoiceCardsApi = [
  { name: "items", description: "固定两列选项数据。", type: "readonly BusinessChoiceCardItem[]", defaultValue: "—" },
  { name: "value", description: "受控选中值。", type: "ChoiceCardValue", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始值。", type: "ChoiceCardValue", defaultValue: "—" },
  { name: "onChange", description: "选中值变化时触发。", type: "(value) => void", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies Api<BasicChoiceCardsProps>;

export const iconChoiceCardsApi = basicChoiceCardsApi;
