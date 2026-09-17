import type { CascaderProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type CascaderApiItem = ComponentApiItem<keyof CascaderProps>;

export const cascaderApi = [
  {
    name: "options",
    description: "多级选项数据；组件不会原地修改传入数组。",
    type: "CascaderOption[]",
    defaultValue: "—",
  },
  {
    name: "mode",
    description: "选择模式，并决定 `value`、`defaultValue` 与 `onChange` 的类型。",
    type: '"single" | "multiple"',
    defaultValue: '"single"',
  },
  {
    name: "value",
    description: "受控值；单选使用一条路径，多选使用路径数组。",
    type: "CascaderPathValue | CascaderPathValue[]",
    defaultValue: "—",
  },
  {
    name: "defaultValue",
    description: "非受控初始值；数据结构必须与 `mode` 匹配。",
    type: "CascaderPathValue | CascaderPathValue[]",
    defaultValue: "—",
  },
  {
    name: "onChange",
    description: "选择、清除或拖拽排序后触发；参数结构与单选或多选模式一致。",
    type: "CascaderSingleProps['onChange'] | CascaderMultipleProps['onChange']",
    defaultValue: "—",
  },
  {
    name: "fieldNames",
    description: "映射选项的标签、值、子级、禁用和叶子节点字段。",
    type: "CascaderFieldNames",
    defaultValue: "—",
  },
  {
    name: "placeholder",
    description: "未选择时显示的提示文字。",
    type: "string",
    defaultValue: '"请选择"',
  },
  {
    name: "size",
    description: "输入框高度尺寸，分别对应 24px、28px、32px 和 36px。",
    type: '"mini" | "small" | "default" | "large"',
    defaultValue: '"default"',
  },
  {
    name: "status",
    description: "输入框的默认、错误或警告状态。",
    type: '"default" | "error" | "warning"',
    defaultValue: '"default"',
  },
  {
    name: "expandTrigger",
    description: "鼠标点击或悬停展开下一级；该设置不改变键盘协议。",
    type: '"click" | "hover"',
    defaultValue: '"click"',
  },
  {
    name: "allowClear",
    description: "有值时是否允许清除；鼠标悬停或键盘聚焦时，清除按钮替换下拉箭头。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "addBefore",
    description: "输入框外部的前置标签内容。",
    type: "ReactNode",
    defaultValue: "—",
  },
  {
    name: "showSearch",
    description: "是否启用完整路径的本地搜索。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "filterOption",
    description: "覆盖默认的路径标签过滤逻辑。",
    type: "(input: string, optionPath: CascaderOption[]) => boolean",
    defaultValue: "—",
  },
  {
    name: "changeOnSelect",
    description: "是否允许把非叶子节点作为选择结果。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "loadMore",
    description: "异步加载子节点；完成后由调用方更新 `options`。",
    type: "(option: CascaderOption, optionPath: CascaderOption[]) => Promise<void>",
    defaultValue: "—",
  },
  {
    name: "renderFormat",
    description: "根据路径标签和选项自定义已选值的显示内容。",
    type: "(labels: ReactNode[], selectedOptions: CascaderOption[]) => ReactNode",
    defaultValue: "—",
  },
  {
    name: "trigger",
    description: "自定义触发器；返回元素必须绑定 render prop 提供的全部属性和 ref。",
    type: "(props: CascaderTriggerProps) => ReactNode",
    defaultValue: "—",
  },
  {
    name: "checkedStrategy",
    description: "多选模式下使用全部路径或父级回显策略；单选模式不支持。",
    type: '"all" | "parent"',
    defaultValue: '"all"',
  },
  {
    name: "dragToSort",
    description: "多选模式下是否允许拖拽调整已选路径顺序；单选模式不支持。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "open",
    description: "受控的弹层打开状态。",
    type: "boolean",
    defaultValue: "—",
  },
  {
    name: "defaultOpen",
    description: "非受控模式下弹层的初始打开状态。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "onOpenChange",
    description: "弹层打开状态变化时触发。",
    type: "(open: boolean) => void",
    defaultValue: "—",
  },
  {
    name: "className",
    description: "组件根节点类名。",
    type: "string",
    defaultValue: "—",
  },
  {
    name: "style",
    description: "组件根节点内联样式。",
    type: "CSSProperties",
    defaultValue: "—",
  },
  {
    name: "id",
    description: "底层输入元素的原生 id。",
    type: "string",
    defaultValue: "—",
  },
  {
    name: "name",
    description: "底层输入元素的原生 name。",
    type: "string",
    defaultValue: "—",
  },
  {
    name: "aria-label",
    description: "没有可见标签时提供级联选择器的无障碍名称。",
    type: "string",
    defaultValue: '"请选择"',
  },
  {
    name: "aria-labelledby",
    description: "引用页面中提供可见名称的元素 id。",
    type: "string",
    defaultValue: "—",
  },
] as const satisfies readonly CascaderApiItem[];
