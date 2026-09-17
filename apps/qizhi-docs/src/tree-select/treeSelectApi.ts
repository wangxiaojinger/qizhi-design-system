import type { TreeSelectProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type TreeSelectApiItem = ComponentApiItem<keyof TreeSelectProps>;

export const treeSelectApi = [
  { name: "treeData", description: "树节点数据。", type: "TreeSelectOption[]", defaultValue: "—" },
  { name: "multiple", description: "是否允许多选。", type: "boolean", defaultValue: "false" },
  { name: "value", description: "受控选中值。", type: "TreeSelectValue | TreeSelectValue[]", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始值。", type: "TreeSelectValue | TreeSelectValue[]", defaultValue: "—" },
  { name: "placeholder", description: "未选择时的提示文案。", type: "string", defaultValue: '"请选择"' },
  { name: "size", description: "控件尺寸。", type: '"default" | "large" | "huge"', defaultValue: '"default"' },
  { name: "status", description: "控件状态。", type: '"default" | "error" | "warning"', defaultValue: '"default"' },
  { name: "disabled", description: "是否禁用。", type: "boolean", defaultValue: "false" },
  { name: "allowClear", description: "有值时是否允许悬停清空。", type: "boolean", defaultValue: "false" },
  { name: "addBefore", description: "前置标签。", type: "ReactNode", defaultValue: "—" },
  { name: "labelInValue", description: "值中是否包含标签。", type: "boolean", defaultValue: "false" },
  { name: "renderFormat", description: "自定义已选内容。", type: "(option) => ReactNode", defaultValue: "—" },
  { name: "showSearch", description: "是否启用搜索。", type: "boolean", defaultValue: "false" },
  { name: "filterTreeNode", description: "本地过滤函数；false 表示关闭。", type: "false | ((input, option) => boolean)", defaultValue: "内置匹配" },
  { name: "onSearch", description: "搜索词变化回调。", type: "(input: string) => void", defaultValue: "—" },
  { name: "loadMore", description: "异步加载子节点。", type: "(option) => Promise<TreeSelectOption[] | void>", defaultValue: "—" },
  { name: "defaultExpandedKeys", description: "默认展开节点值。", type: "TreeSelectRawValue[]", defaultValue: "有子节点的分支" },
  { name: "open", description: "受控展开状态。", type: "boolean", defaultValue: "—" },
  { name: "defaultOpen", description: "默认是否展开。", type: "boolean", defaultValue: "false" },
  { name: "onOpenChange", description: "展开状态变化回调。", type: "(open: boolean) => void", defaultValue: "—" },
  { name: "onChange", description: "选中值变化回调。", type: "(value, option) => void", defaultValue: "—" },
  { name: "className", description: "根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly TreeSelectApiItem[];
